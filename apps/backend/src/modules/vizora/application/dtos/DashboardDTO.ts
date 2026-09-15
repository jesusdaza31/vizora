import type { DashboardConfig } from "../../domain/entities";

export type DashboardDTO = {
  id: string;
  sede: string;
  name: string;
  description: string | null;
  config: DashboardConfig;
  version: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateDashboardDTO = {
  name: string;
  description?: string;
  config: DashboardConfig;
};

export type UpdateDashboardDTO = {
  name?: string;
  description?: string;
  config: DashboardConfig;
  version: number;
};

export type DashboardListDTO = {
  dashboards: DashboardDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
};
