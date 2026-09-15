export const baseOpenApi = {
  openapi: "3.1.0",
  info: {
    title: "Vizora API",
    version: "1.0.0",
    description: "Dynamic Dashboard Builder Platform — REST API",
  },
  servers: [
    { url: "/api", description: "API root" },
  ],
  tags: [] as { name: string; description: string }[],
  paths: {},
  components: {
    schemas: {},
  },
};
