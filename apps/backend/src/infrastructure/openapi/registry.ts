import type { OpenAPIFragment } from "./types";
import { baseOpenApi } from "./base";

export function buildOpenApiSpec(fragments: OpenAPIFragment[]) {
  const spec = structuredClone(baseOpenApi);

  for (const fragment of fragments) {
    if (fragment.tags) {
      spec.tags.push(...fragment.tags);
    }
    Object.assign(spec.paths, fragment.paths);
    Object.assign(spec.components.schemas, fragment.components.schemas);
  }

  return spec;
}
