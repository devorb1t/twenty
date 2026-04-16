import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { wrapToolsWithOutputSerialization } from 'src/engine/core-modules/tool-provider/output-serialization/wrap-tools-with-output-serialization.util';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createExecuteToolTool,
  createLearnToolsTool,
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { ToolCategory } from 'twenty-shared/ai';

export type AgentToolRuntime = {
  toolCatalog: ToolIndexEntry[];
  lazyToolCatalog: ToolIndexEntry[];
  directTools: ToolSet;
  directToolNames: string[];
  runtimeTools: ToolSet;
};

// I need to be sure this isnt duplicated logic and the right place to do this
// is naming correct?
// I assume this is for lazy tools? is itdone in similar manner for agent chat?
@Injectable()
export class AgentToolRuntimeService {
  constructor(private readonly toolRegistry: ToolRegistryService) {}

  async buildToolRuntime({
    context,
    directTools = {},
    preloadedToolNames = [],
    lazyToolCategories,
    wrapPreloadedToolsWithOutputSerialization = false,
  }: {
    context: ToolContext;
    directTools?: ToolSet;
    preloadedToolNames?: string[];
    lazyToolCategories?: readonly ToolCategory[];
    wrapPreloadedToolsWithOutputSerialization?: boolean;
  }): Promise<AgentToolRuntime> {
    const toolCatalog = await this.toolRegistry.getCatalogByContext(context);
    const preloadedTools =
      preloadedToolNames.length > 0
        ? await this.toolRegistry.getToolsByName(preloadedToolNames, context)
        : {};

    const preparedPreloadedTools = wrapPreloadedToolsWithOutputSerialization
      ? wrapToolsWithOutputSerialization(preloadedTools)
      : preloadedTools;

    const lazyToolCatalog = this.filterLazyToolCatalog(
      toolCatalog,
      lazyToolCategories,
    );

    const lazyToolNames = new Set(lazyToolCatalog.map((tool) => tool.name));
    const excludedToolNames = new Set(
      toolCatalog
        .filter((tool) => !lazyToolNames.has(tool.name))
        .map((tool) => tool.name),
    );

    const allDirectTools = {
      ...preparedPreloadedTools,
      ...directTools,
    };

    return {
      toolCatalog,
      lazyToolCatalog,
      directTools: allDirectTools,
      directToolNames: Object.keys(allDirectTools),
      runtimeTools: {
        ...allDirectTools,
        [LEARN_TOOLS_TOOL_NAME]: createLearnToolsTool(
          this.toolRegistry,
          context,
          excludedToolNames,
        ),
        [EXECUTE_TOOL_TOOL_NAME]: createExecuteToolTool(
          this.toolRegistry,
          context,
          allDirectTools,
          excludedToolNames,
        ),
      },
    };
  }

  private filterLazyToolCatalog(
    toolCatalog: ToolIndexEntry[],
    lazyToolCategories?: readonly ToolCategory[],
  ): ToolIndexEntry[] {
    if (!lazyToolCategories) {
      return toolCatalog;
    }

    const categorySet = new Set(lazyToolCategories);

    return toolCatalog.filter((tool) => categorySet.has(tool.category));
  }
}
