export type OpenAPIFragment = {
  tags?: { name: string; description: string }[];
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, unknown>;
  };
};
