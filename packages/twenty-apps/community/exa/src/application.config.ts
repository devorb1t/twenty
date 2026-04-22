import { defineApplication } from 'twenty-sdk/define';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '2b7f4a2e-9c4b-4a11-b63c-2e5e7d3f5a9a';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Exa',
  description:
    'Structured web search powered by Exa. Surfaces entity-aware results (companies, people, research, news) to Twenty AI agents.',
  icon: 'IconSearch',
  serverVariables: {
    EXA_API_KEY: {
      description:
        'Exa API key. Set by the server admin on this registration after installation; the value is injected into every logic function execution.',
      isSecret: true,
      isRequired: true,
    },
  },
});
