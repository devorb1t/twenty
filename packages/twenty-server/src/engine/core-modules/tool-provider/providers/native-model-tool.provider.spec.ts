import { NativeModelToolProvider } from './native-model-tool.provider';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type WebSearchService } from 'src/engine/core-modules/web-search/web-search.service';
import { type AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

describe('NativeModelToolProvider', () => {
  const agent = {
    id: 'agent-id',
    modelId: 'xai-model',
    modelConfiguration: {
      webSearch: { enabled: true },
      twitterSearch: { enabled: true },
    },
  } as FlatAgentWithRoleId;

  const context = {
    workspaceId: 'workspace-id',
    roleId: 'role-id',
    rolePermissionConfig: { unionOf: ['role-id'] },
    agent,
  } as ToolProviderContext;

  it('asks for native model tools even when external web search is preferred', async () => {
    const registeredModel = {
      modelId: 'xai-model',
    } as RegisteredAiModel;
    const aiModelConfigService = {
      getNativeModelTools: jest.fn().mockReturnValue({
        x_search: { type: 'provider', id: 'xai.x_search', args: {} },
      }),
    } as Pick<AiModelConfigService, 'getNativeModelTools'>;
    const aiModelRegistryService = {
      resolveModelForAgent: jest.fn().mockResolvedValue(registeredModel),
    } as Pick<AiModelRegistryService, 'resolveModelForAgent'>;
    const webSearchService = {
      shouldUseNativeSearch: jest.fn().mockReturnValue(false),
    } as Pick<WebSearchService, 'shouldUseNativeSearch'>;

    const provider = new NativeModelToolProvider(
      aiModelConfigService as AiModelConfigService,
      aiModelRegistryService as AiModelRegistryService,
      webSearchService as WebSearchService,
    );

    const tools = await provider.generateTools(context);

    expect(tools).toEqual({
      x_search: { type: 'provider', id: 'xai.x_search', args: {} },
    });
    expect(aiModelConfigService.getNativeModelTools).toHaveBeenCalledWith(
      registeredModel,
      agent,
      { useProviderNativeWebSearch: false },
    );
  });
});
