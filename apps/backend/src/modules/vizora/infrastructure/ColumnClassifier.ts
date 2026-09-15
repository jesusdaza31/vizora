import type { VizoraType } from "../domain/entities";

const NUMBER_TYPES = new Set([
  "int",
  "bigint",
  "smallint",
  "tinyint",
  "decimal",
  "numeric",
  "float",
  "real",
  "money",
  "smallmoney",
]);

const DATE_TYPES = new Set([
  "datetime",
  "datetime2",
  "smalldatetime",
  "date",
  "datetimeoffset",
]);

const BOOLEAN_TYPES = new Set(["bit"]);

export function classifySqlType(sqlType: string): VizoraType {
  const normalized = sqlType.toLowerCase().replace(/\(.*\)/, "").trim();

  if (NUMBER_TYPES.has(normalized)) return "number";
  if (DATE_TYPES.has(normalized)) return "date";
  if (BOOLEAN_TYPES.has(normalized)) return "boolean";
  return "string";
}

export function computeNullableRatio(isNullable: boolean): number {
  return isNullable ? 1 : 0;
}
