import { type ToolSet } from 'ai';

import { ToolCategory } from 'twenty-shared/ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { LazyToolRuntimeService } from 'src/engine/core-modules/tool-provider/services/lazy-tool-runtime.service';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

const createTool = (name: string): ToolSet[string] =>
  ({
    description: name,
    inputSchema: {},
    execute: jest.fn(),
  }) as unknown as ToolSet[string];

const createToolIndexEntry = (
  name: string,
  category: ToolCategory,
): ToolIndexEntry => ({
  name,
  category,
  description: name,
  executionRef: { kind: 'static', toolId: name },
});

describe('LazyToolRuntimeService', () => {
  const context: ToolProviderContext = {
    workspaceId: 'workspace-id',
    roleId: 'role-id',
    rolePermissionConfig: { unionOf: ['role-id'] },
  };

  const setup = () => {
    const toolRegistry = {
      getCatalog: jest.fn(),
      getToolsByName: jest.fn(),
      getToolInfo: jest.fn(),
      resolveAndExecute: jest.fn(),
    } as unknown as jest.Mocked<ToolRegistryService>;

    const service = new LazyToolRuntimeService(toolRegistry);

    return { service, toolRegistry };
  };

  it('builds runtime tools from direct tools', async () => {
    const { service, toolRegistry } = setup();

    toolRegistry.getCatalog.mockResolvedValue([
      createToolIndexEntry('search_help_center', ToolCategory.ACTION),
    ]);

    const runtime = await service.buildToolRuntime({
      context,
      directTools: {
        search_help_center: createTool('search_help_center'),
        x_search: createTool('x_search'),
      },
    });

    expect(runtime.directToolNames).toEqual(['search_help_center', 'x_search']);
    expect(Object.keys(runtime.runtimeTools)).toEqual([
      'search_help_center',
      'x_search',
      LEARN_TOOLS_TOOL_NAME,
      EXECUTE_TOOL_TOOL_NAME,
    ]);
  });

  it('filters lazy tools by category while keeping direct tools callable', async () => {
    const { service, toolRegistry } = setup();

    toolRegistry.getCatalog.mockResolvedValue([
      createToolIndexEntry('find_companies', ToolCategory.DATABASE_CRUD),
      createToolIndexEntry('create_workflow', ToolCategory.WORKFLOW),
    ]);
    toolRegistry.getToolInfo.mockImplementation(async (toolNames: string[]) =>
      toolNames.map((toolName) => ({
        name: toolName,
        description: toolName,
      })),
    );

    const runtime = await service.buildToolRuntime({
      context,
      directTools: {
        x_search: createTool('x_search'),
      },
      lazyToolCategories: [ToolCategory.DATABASE_CRUD],
    });

    expect(runtime.lazyToolCatalog.map((tool) => tool.name)).toEqual([
      'find_companies',
    ]);
    expect(runtime.runtimeTools.x_search).toBeDefined();

    const learnTools = runtime.runtimeTools[
      LEARN_TOOLS_TOOL_NAME
    ] as unknown as {
      execute: (parameters: {
        toolNames: string[];
        aspects: ['description'];
      }) => Promise<unknown>;
    };

    await learnTools.execute({
      toolNames: ['find_companies', 'create_workflow'],
      aspects: ['description'],
    });

    expect(toolRegistry.getToolInfo).toHaveBeenCalledWith(
      ['find_companies'],
      context,
      ['description'],
    );
  });
});
