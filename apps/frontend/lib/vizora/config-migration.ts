import type { ComponentConfig, DashboardConfig } from './types';

function migrateYAxis(options: Record<string, unknown>): Record<string, unknown> {
  if (typeof options.yAxis === 'string') {
    return { ...options, yAxis: [options.yAxis] };
  }
  return options;
}

function migrateAlignment(options: Record<string, unknown>): Record<string, unknown> {
  if ('alignment' in options && !('align' in options)) {
    const { alignment, ...rest } = options;
    return { ...rest, align: alignment };
  }
  return options;
}

function migrateComponentConfig(config: ComponentConfig): ComponentConfig {
  let options = config.options;

  if (config.type === 'bar' || config.type === 'line') {
    options = migrateYAxis(options);
  }
  if (config.type === 'text') {
    options = migrateAlignment(options);
  }

  return options !== config.options ? { ...config, options } : config;
}

export function migrateDashboardConfig(config: DashboardConfig): DashboardConfig {
  return {
    ...config,
    pages: config.pages.map((page) => ({
      ...page,
      components: page.components.map(migrateComponentConfig),
    })),
  };
}
