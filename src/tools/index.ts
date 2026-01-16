import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchItemTool } from "./searchItem.js";
import { getMaterialGuideTool } from "./getMaterialGuide.js";
import { searchFaqTool } from "./searchFaq.js";

export function registerTools(server: McpServer) {
  server.registerTool(
    searchItemTool.name,
    {
      description: searchItemTool.description,
      inputSchema: searchItemTool.schema,
    },
    searchItemTool.handler
  );

  server.registerTool(
    getMaterialGuideTool.name,
    {
      description: getMaterialGuideTool.description,
      inputSchema: getMaterialGuideTool.schema,
    },
    getMaterialGuideTool.handler
  );

  server.registerTool(
    searchFaqTool.name,
    {
      description: searchFaqTool.description,
      inputSchema: searchFaqTool.schema,
    },
    searchFaqTool.handler
  );
}
