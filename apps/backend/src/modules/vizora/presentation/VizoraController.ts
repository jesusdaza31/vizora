import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { toHttpError } from "@/middleware/toHttpError";
import type { IDashboardService } from "../application/contracts/IDashboardService";
import type { IDataSourceService } from "../application/contracts/IDataSourceService";
import type { IQueryExecutorService } from "../application/contracts/IQueryExecutorService";
import type { AutoGenerationService } from "../application/services/AutoGenerationService";
import type { QueryRequestDTO } from "../application/dtos/QueryRequestDTO";

const SEDE = "default";
const OWNER_ID = "anonymous";

@injectable()
export class VizoraController {
  constructor(
    @inject("IDashboardService") private readonly dashboardService: IDashboardService,
    @inject("IDataSourceService") private readonly dataSourceService: IDataSourceService,
    @inject("IQueryExecutorService") private readonly queryExecutorService: IQueryExecutorService,
    @inject("AutoGenerationService") private readonly autoGenerationService: AutoGenerationService,
  ) {}

  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));

    const result = await this.dashboardService.list(SEDE, page, pageSize);
    return result.match(
      (dto) => res.status(200).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.dashboardService.getById(req.params.id, SEDE);
    return result.match(
      (dto) => res.status(200).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.dashboardService.create(req.body, SEDE, OWNER_ID);
    return result.match(
      (dto) => res.status(201).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.dashboardService.update(req.params.id, req.body, SEDE);
    return result.match(
      (dto) => res.status(200).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.dashboardService.delete(req.params.id, SEDE);
    return result.match(
      () => res.status(204).send(),
      (err) => { throw toHttpError(err); },
    );
  });

  duplicate = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.dashboardService.duplicate(req.params.id, SEDE, OWNER_ID);
    return result.match(
      (dto) => res.status(201).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  listDataSources = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await this.dataSourceService.listDataSources();
    return result.match(
      (dto) => res.status(200).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  searchTables = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const result = await this.dataSourceService.searchTables(search, limit, offset);
    return result.match(
      (dto) => res.status(200).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  autoGenerate = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { tableName } = req.body;
    if (!tableName || typeof tableName !== "string") {
      return res.status(400).json({ title: "Validation Error", detail: "tableName is required", status: 400 });
    }
    const result = await this.autoGenerationService.generateProposal(tableName);
    return result.match(
      (proposal) => res.status(200).json(proposal),
      (err) => { throw toHttpError(err); },
    );
  });

  executeQuery = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const request = req.body as QueryRequestDTO;
    const result = await this.queryExecutorService.execute(request);
    return result.match(
      (queryResult) => res.status(200).json(queryResult),
      (err) => { throw toHttpError(err); },
    );
  });

  getDistinctValues = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const table = typeof req.query.table === "string" ? req.query.table : "";
    const column = typeof req.query.column === "string" ? req.query.column : "";
    const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 100));

    if (!table || !column) {
      return res.status(400).json({ title: "Validation Error", detail: "table and column are required", status: 400 });
    }

    const result = await this.dataSourceService.getDistinctValues(table, column, limit);
    return result.match(
      (dto) => res.status(200).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  getNumericBounds = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const table = typeof req.query.table === "string" ? req.query.table : "";
    const column = typeof req.query.column === "string" ? req.query.column : "";

    if (!table || !column) {
      return res.status(400).json({ title: "Validation Error", detail: "table and column are required", status: 400 });
    }

    const result = await this.dataSourceService.getNumericBounds(table, column);
    return result.match(
      (dto) => res.status(200).json(dto),
      (err) => { throw toHttpError(err); },
    );
  });

  getTableSchema = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const tableName = req.params.tableName;
    if (!tableName) {
      return res.status(400).json({ title: "Validation Error", detail: "tableName is required", status: 400 });
    }

    const result = await this.dataSourceService.getTableColumns("dbo", tableName);
    return result.match(
      (tableDTO) => {
        if (!tableDTO) {
          return res.status(404).json({ title: "Not Found", detail: `Table "${tableName}" not found`, status: 404 });
        }
        return res.status(200).json({ columns: tableDTO.columns });
      },
      (err) => { throw toHttpError(err); },
    );
  });
}
