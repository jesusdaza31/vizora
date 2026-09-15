import { BackendModule } from "@/infrastructure/BackendModule";
import { VizoraModule } from "@/modules/vizora/presentation/VizoraModule";

export const modules: BackendModule[] = [
  new VizoraModule(),
];
