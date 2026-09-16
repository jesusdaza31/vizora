import type { PageConfig, ComponentConfig, WidgetType } from './types';

function generateId(): string {
  return crypto.randomUUID();
}

function createComponent(
  type: WidgetType,
  x: number,
  y: number,
  w: number,
  h: number,
  options: Record<string, unknown> = {},
): ComponentConfig {
  return {
    id: generateId(),
    type,
    layout: { x, y, w, h },
    dataSource: { table: '', columns: [] },
    filters: [],
    options,
  };
}

export type TemplateName = 'executive' | 'analytical' | 'comparative' | 'detailed' | 'kpi' | 'custom';

export const templates: Record<TemplateName, { name: string; description: string }> = {
  executive: {
    name: 'Executive',
    description: '4 KPI cards + 2 charts + 1 table',
  },
  analytical: {
    name: 'Analytical',
    description: '2 charts + table + filter bar',
  },
  comparative: {
    name: 'Comparative',
    description: '2 charts side-by-side for comparison',
  },
  detailed: {
    name: 'Detailed',
    description: 'Table-heavy with 2 tables + 1 KPI',
  },
  kpi: {
    name: 'KPI',
    description: '6 KPI cards in 2×3 grid',
  },
  custom: {
    name: 'Custom',
    description: 'Empty canvas',
  },
};

export function applyTemplate(templateName: TemplateName): PageConfig {
  const pageId = generateId();

  switch (templateName) {
    case 'executive':
      return {
        id: pageId,
        name: 'Executive Dashboard',
        components: [
          createComponent('kpi', 0, 0, 3, 2, { label: 'KPI 1', format: 'number' }),
          createComponent('kpi', 3, 0, 3, 2, { label: 'KPI 2', format: 'currency' }),
          createComponent('kpi', 6, 0, 3, 2, { label: 'KPI 3', format: 'percentage' }),
          createComponent('kpi', 9, 0, 3, 2, { label: 'KPI 4', format: 'number' }),
          createComponent('bar', 0, 2, 6, 4, {}),
          createComponent('line', 6, 2, 6, 4, {}),
          createComponent('table', 0, 6, 12, 4, {}),
        ],
      };

    case 'analytical':
      return {
        id: pageId,
        name: 'Analytical Dashboard',
        components: [
          createComponent('filter', 0, 0, 12, 1, {
            label: 'Filters',
            filterConfig: {
              column: '',
              vizoraType: 'string',
              operator: '$in',
              label: 'Filter',
            },
          }),
          createComponent('bar', 0, 1, 6, 4, {}),
          createComponent('line', 6, 1, 6, 4, {}),
          createComponent('table', 0, 5, 12, 4, {}),
        ],
      };

    case 'comparative':
      return {
        id: pageId,
        name: 'Comparative Dashboard',
        components: [
          createComponent('bar', 0, 0, 6, 5, { label: 'Dataset A' }),
          createComponent('line', 6, 0, 6, 5, { label: 'Dataset B' }),
          createComponent('pie', 0, 5, 4, 4, {}),
          createComponent('kpi', 4, 5, 4, 4, { label: 'Comparison', format: 'number' }),
          createComponent('table', 8, 5, 4, 4, {}),
        ],
      };

    case 'detailed':
      return {
        id: pageId,
        name: 'Detailed Dashboard',
        components: [
          createComponent('kpi', 0, 0, 4, 2, { label: 'Summary', format: 'number' }),
          createComponent('table', 0, 2, 12, 4, {}),
          createComponent('table', 0, 6, 12, 4, {}),
        ],
      };

    case 'kpi':
      return {
        id: pageId,
        name: 'KPI Dashboard',
        components: [
          createComponent('kpi', 0, 0, 4, 2, { label: 'KPI 1', format: 'number' }),
          createComponent('kpi', 4, 0, 4, 2, { label: 'KPI 2', format: 'currency' }),
          createComponent('kpi', 8, 0, 4, 2, { label: 'KPI 3', format: 'percentage' }),
          createComponent('kpi', 0, 2, 4, 2, { label: 'KPI 4', format: 'number' }),
          createComponent('kpi', 4, 2, 4, 2, { label: 'KPI 5', format: 'currency' }),
          createComponent('kpi', 8, 2, 4, 2, { label: 'KPI 6', format: 'percentage' }),
        ],
      };

    case 'custom':
    default:
      return {
        id: pageId,
        name: 'Custom Dashboard',
        components: [],
      };
  }
}
