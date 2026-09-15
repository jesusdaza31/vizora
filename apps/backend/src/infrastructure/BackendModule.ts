import { Express } from "express";

export interface BackendModule {
  register(app: Express): void;
}
