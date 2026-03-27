# Handoff: AI Chat Streaming — Alternating Messages Bug

## Branch
`fix/ai-chat-thread-switching`

## Problem

During streaming, the UI flickers: the last assistant message alternates between two versions with different `parts` arrays. This continues until streaming finishes, at which point the message stabilizes.

## Root Cause Analysis

The bug comes from having **two independent sources writing messages to the Chat instance**, creating a tug-of-war during streaming.

### Source 1: AI SDK streaming (internal)

`useChat` subscribes to the Chat instance's messages via `useSyncExternalStore`. During streaming, the SDK calls `Chat.replaceMessage()` on every chunk, which:
1. Calls `structuredClone(message)` on the updated last message
2. Replaces it in the internal `#messages` array
3. Fires all registered callbacks (throttled at 100ms via `experimental_throttle`)

### Source 2: GraphQL fetch (external mutation)

`AgentChatMessagesFetchEffect.handleDataLoaded` (line 76) directly mutates the Chat instance:
```ts
chatInstance.messages = uiMessages;
```
This triggers the Chat's `set messages()` setter, which creates `[...newMessages]` and fires ALL registered callbacks — including the throttled one that `useSyncExternalStore` uses.

### The guard that doesn't fully work

There IS a guard in `handleDataLoaded` (lines 68-74):
```ts
const isStreaming = chatInstance.status === 'streaming' || chatInstance.status === 'submitted';
if (isStreaming) { return; }
```

But this guard only protects against the **initial fetch** and **explicit refetch** during streaming. The problem occurs because:

1. `onStreamingComplete` dispatches `AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME`
2. This triggers `refetchAgentChatMessages()` — a GraphQL network call
3. The response arrives asynchronously, potentially AFTER the SDK has already updated internal state but BEFORE React has committed the final render
4. More critically: Apollo's `useQuery` can update its cache and trigger `onDataLoaded` from cache operations (optimistic updates, cache writes from other queries) even during streaming

### The alternation mechanism

When both sources write to the Chat instance in rapid succession:
1. SDK streaming updates `#messages` with the latest chunk → snapshot A (has new parts)
2. Apollo cache/refetch triggers `handleDataLoaded` → `chatInstance.messages = uiMessages` → snapshot B (DB version, missing latest streamed parts)
3. `useSyncExternalStore` detects the snapshot changed → re-render with B
4. Next throttle tick, SDK has already updated internally → snapshot A again
5. React renders with A, then B arrives again → alternation

The user sees the last message's `parts` flickering between the streaming version (more content) and the DB version (less content).

## Architecture Context

### How useChat works internally (`@ai-sdk/react`)

```
useChat({ chat: instance, experimental_throttle: 100 })
  └── chatRef = useRef(instance)
  └── useSyncExternalStore(
        subscribe: throttle(onChange, 100ms),  // only fires every 100ms
        getSnapshot: () => chatRef.current.messages  // but reads LATEST on every render
      )
```

Key detail: `getSnapshot` always reads the latest `chatRef.current.messages`. React can call this during ANY render — not just when the subscribe callback fires. If something else triggers a render (Jotai state update, parent re-render), React will read the current snapshot and may detect it differs from the last committed value, causing an additional re-render.

### Data flow (current)

```
AI SDK streaming ──replaceMessage()──► Chat#messages ──useSyncExternalStore──► useChat.messages
                                           ▲                                        │
GraphQL fetch ──handleDataLoaded──► chatInstance.messages = uiMessages           │
                                                                                    ▼
                                                                           setAgentChatMessages (Jotai)
                                                                                    │
                                                                           agentChatMessagesComponentFamilyState
                                                                                    │
                                                                              UI renders
```

The problem is the two arrows writing to `Chat#messages`.

### Key files

| File | Role |
|---|---|
| `useAgentChat.ts` | Calls `useChat({ chat: agentChatInstanceForThread })`, returns messages/status |
| `useAgentChatInstanceForThread.ts` | Creates/caches Chat instances per thread in Jotai atom family |
| `AgentChatAiSdkStreamEffect.tsx` | Bridges useChat → Jotai: `setAgentChatMessages(chatState.messages)` |
| `AgentChatMessagesFetchEffect.tsx` | Fetches historical messages from GraphQL, writes to Chat instance |
| `agentChatInstanceByThreadIdFamilyState.ts` | Jotai atom family holding Chat instances keyed by `{ threadId }` |

### AI SDK internals (relevant)

| Method | What it does |
|---|---|
| `Chat.replaceMessage(index, message)` | `structuredClone`s the message, replaces at index, fires callbacks |
| `Chat.messages` setter | Creates `[...newMessages]`, fires callbacks |
| `Chat.messages` getter | Returns internal `#messages` reference |
| `~registerMessagesCallback(onChange, throttleMs)` | Wraps onChange with `throttleit` if throttleMs provided |

## Logging

There are `console.log` statements in `AgentChatAiSdkStreamEffect.tsx` and a `lastMessageMap` (module-level Map) that captures every message snapshot with a timestamp. These were added for debugging this exact issue and will be kept as-is in the PR.

## Possible Fix Directions

1. **Make Chat instance the single source of truth during streaming**: Remove the `chatInstance.messages = uiMessages` path entirely. Instead, only seed messages at Chat construction time (before streaming starts). After streaming ends, refetch and set.

2. **Use setMessages from useChat instead of direct mutation**: The AI SDK's `useChat` returns a `setMessages` function that properly coordinates with the internal state. Replace `chatInstance.messages = uiMessages` with the SDK's own `setMessages`. This ensures the SDK controls the timing.

3. **Strengthen the guard**: Instead of checking `chatInstance.status`, use a dedicated atom that tracks whether the SDK is actively streaming for this thread. Set it before the stream starts, clear it after the effect processes the final message.

4. **Debounce/skip the fetch effect during streaming**: Don't refetch at all while streaming. Only fetch historical messages when switching TO a thread that isn't streaming.

## What's Working

- Thread creation (draft → first send → thread created)
- Message sending and receiving (when not observing the alternation)
- Thread switching (historical messages load correctly for non-streaming threads)
- Backend resumable streams (Redis infrastructure, `GET /agent-chat/:threadId/stream`)
- `onFinish` callback (title update, usage tracking)
