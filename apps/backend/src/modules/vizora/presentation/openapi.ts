import type { OpenAPIFragment } from "@/infrastructure/openapi";

export const vizoraOpenApi = {
  tags: [
    { name: "Vizora", description: "Dynamic Dashboard Builder — create, configure, and manage interactive dashboards from SQL Server data sources." },
  ],
  paths: {
    "/vizora/health": {
      get: {
        tags: ["Vizora"],
        summary: "Health check",
        operationId: "vizoraHealth",
        responses: {
          200: {
            description: "Module is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    module: { type: "string", example: "vizora" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/vizora/dashboards": {
      get: {
        tags: ["Vizora"],
        summary: "List dashboards (paginated)",
        operationId: "listDashboards",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 } },
        ],
        responses: {
          200: {
            description: "Paginated list of dashboards",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/DashboardListDTO" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Vizora"],
        summary: "Create a new dashboard",
        operationId: "createDashboard",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/CreateDashboardDTO" },
            },
          },
        },
        responses: {
          201: {
            description: "Dashboard created",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/DashboardDTO" },
              },
            },
          },
          400: { description: "Validation error" },
        },
      },
    },
    "/vizora/dashboards/{id}": {
      get: {
        tags: ["Vizora"],
        summary: "Get dashboard by ID",
        operationId: "getDashboardById",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Dashboard found",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/DashboardDTO" },
              },
            },
          },
          404: { description: "Dashboard not found" },
        },
      },
      put: {
        tags: ["Vizora"],
        summary: "Update dashboard (optimistic concurrency)",
        operationId: "updateDashboard",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/UpdateDashboardDTO" },
            },
          },
        },
        responses: {
          200: {
            description: "Dashboard updated",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/DashboardDTO" },
              },
            },
          },
          400: { description: "Validation error" },
          404: { description: "Dashboard not found" },
          409: { description: "Concurrency conflict (version mismatch)" },
        },
      },
      delete: {
        tags: ["Vizora"],
        summary: "Soft-delete a dashboard",
        operationId: "deleteDashboard",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Dashboard deleted" },
          404: { description: "Dashboard not found" },
        },
      },
    },
    "/vizora/dashboards/{id}/duplicate": {
      post: {
        tags: ["Vizora"],
        summary: "Duplicate a dashboard",
        operationId: "duplicateDashboard",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          201: {
            description: "Dashboard duplicated",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/DashboardDTO" },
              },
            },
          },
          404: { description: "Dashboard not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      DashboardDTO: {
        type: "object",
        properties: {
          id: { type: "string" },
          sede: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          config: { "$ref": "#/components/schemas/DashboardConfig" },
          version: { type: "integer" },
          ownerId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateDashboardDTO: {
        type: "object",
        required: ["name", "config"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          config: { "$ref": "#/components/schemas/DashboardConfig" },
        },
      },
      UpdateDashboardDTO: {
        type: "object",
        required: ["config", "version"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          config: { "$ref": "#/components/schemas/DashboardConfig" },
          version: { type: "integer", description: "Expected version for optimistic concurrency" },
        },
      },
      DashboardListDTO: {
        type: "object",
        properties: {
          dashboards: { type: "array", items: { "$ref": "#/components/schemas/DashboardDTO" } },
          totalCount: { type: "integer" },
          page: { type: "integer" },
          pageSize: { type: "integer" },
        },
      },
      DashboardConfig: {
        type: "object",
        properties: {
          version: { type: "integer", enum: [1] },
          theme: { "$ref": "#/components/schemas/ThemeConfig" },
          pages: { type: "array", items: { "$ref": "#/components/schemas/PageConfig" } },
        },
      },
      ThemeConfig: {
        type: "object",
        properties: {
          primaryColor: { type: "string" },
          chartPalette: { type: "array", items: { type: "string" } },
          fontSize: { type: "string", enum: ["sm", "md", "lg"] },
          borderRadius: { type: "integer", enum: [8, 12, 16] },
        },
      },
      PageConfig: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          components: { type: "array", items: { "$ref": "#/components/schemas/ComponentConfig" } },
        },
      },
      ComponentConfig: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["kpi", "bar", "line", "pie", "table", "filter", "text"] },
          layout: { "$ref": "#/components/schemas/LayoutConfig" },
          dataSource: { "$ref": "#/components/schemas/DataSourceBinding" },
          filters: { type: "array", items: { "$ref": "#/components/schemas/FilterBinding" } },
          options: { type: "object" },
        },
      },
      LayoutConfig: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" },
          w: { type: "number" },
          h: { type: "number" },
        },
      },
      DataSourceBinding: {
        type: "object",
        properties: {
          table: { type: "string" },
          columns: { type: "array", items: { type: "string" } },
          aggregation: { type: "string", enum: ["SUM", "AVG", "COUNT", "MIN", "MAX"] },
        },
      },
      FilterBinding: {
        type: "object",
        properties: {
          column: { type: "string" },
          filterId: { type: "string" },
        },
      },
    },
  },
} satisfies OpenAPIFragment;
