import { create } from 'zustand';
import { toast } from 'sonner';
import type { DashboardDTO, DashboardConfig, ComponentConfig, FilterConfig, FilterBinding, PageConfig, ThemeConfig } from '@/lib/vizora/types';
import { updateDashboard } from '@/lib/vizora/dashboard-api';

const MAX_UNDO = 20;

type BuilderState = {
  dashboard: DashboardDTO | null;
  activePageId: string | null;
  selectedComponentId: string | null;
  filterValues: Record<string, unknown>;
  filterConfigs: FilterConfig[];
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSavedAt: string | null;
  isPreview: boolean;
  error: string | null;
  undoStack: DashboardConfig[];
  redoStack: DashboardConfig[];

  loadDashboard: (dashboard: DashboardDTO) => void;
  setActivePage: (pageId: string) => void;
  selectComponent: (componentId: string | null) => void;
  addComponent: (component: ComponentConfig) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: Partial<ComponentConfig>) => void;
  setFilterValue: (filterId: string, value: unknown) => void;
  clearFilters: () => void;
  setFilterConfigs: (configs: FilterConfig[]) => void;
  getFilteredComponents: (components: ComponentConfig[]) => ComponentConfig[];
  getFilterQueryParams: (bindings: FilterBinding[]) => Record<string, unknown>;
  save: () => Promise<void>;
  reset: () => void;
  undo: () => void;
  redo: () => void;
  togglePreview: () => void;
  addPage: (name: string) => void;
  removePage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  updateTheme: (theme: ThemeConfig) => void;
};

function pushUndo(stack: DashboardConfig[], config: DashboardConfig): DashboardConfig[] {
  const next = [...stack, config];
  if (next.length > MAX_UNDO) next.shift();
  return next;
}

function getActivePage(config: DashboardConfig, pageId: string | null) {
  if (!pageId) return null;
  return config.pages.find((p) => p.id === pageId) ?? null;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  dashboard: null,
  activePageId: null,
  selectedComponentId: null,
  filterValues: {},
  filterConfigs: [],
  isDirty: false,
  isSaving: false,
  isLoading: false,
  lastSavedAt: null,
  isPreview: false,
  error: null,
  undoStack: [],
  redoStack: [],

  loadDashboard: (dashboard) => {
    set({
      dashboard,
      activePageId: dashboard.config.pages[0]?.id ?? null,
      selectedComponentId: null,
      filterValues: {},
      isDirty: false,
      isLoading: false,
      lastSavedAt: dashboard.updatedAt,
      error: null,
      undoStack: [],
      redoStack: [],
    });
  },

  setActivePage: (pageId) => {
    set({ activePageId: pageId, selectedComponentId: null });
  },

  selectComponent: (componentId) => {
    set({ selectedComponentId: componentId });
  },

  addComponent: (component) => {
    const { dashboard, activePageId } = get();
    if (!dashboard || !activePageId) return;

    const config = dashboard.config;
    set({
      undoStack: pushUndo(get().undoStack, config),
      redoStack: [],
      dashboard: {
        ...dashboard,
        config: {
          ...config,
          pages: config.pages.map((p) =>
            p.id === activePageId ? { ...p, components: [...p.components, component] } : p,
          ),
        },
      },
      isDirty: true,
    });
  },

  removeComponent: (componentId) => {
    const { dashboard, activePageId } = get();
    if (!dashboard || !activePageId) return;

    const config = dashboard.config;
    set({
      undoStack: pushUndo(get().undoStack, config),
      redoStack: [],
      dashboard: {
        ...dashboard,
        config: {
          ...config,
          pages: config.pages.map((p) =>
            p.id === activePageId
              ? { ...p, components: p.components.filter((c) => c.id !== componentId) }
              : p,
          ),
        },
      },
      selectedComponentId: get().selectedComponentId === componentId ? null : get().selectedComponentId,
      isDirty: true,
    });
  },

  updateComponent: (componentId, updates) => {
    const { dashboard, activePageId } = get();
    if (!dashboard || !activePageId) return;

    const config = dashboard.config;
    set({
      undoStack: pushUndo(get().undoStack, config),
      redoStack: [],
      dashboard: {
        ...dashboard,
        config: {
          ...config,
          pages: config.pages.map((p) =>
            p.id === activePageId
              ? {
                  ...p,
                  components: p.components.map((c) =>
                    c.id === componentId ? { ...c, ...updates } : c,
                  ),
                }
              : p,
          ),
        },
      },
      isDirty: true,
    });
  },

  setFilterValue: (filterId, value) => {
    set({ filterValues: { ...get().filterValues, [filterId]: value } });
  },

  clearFilters: () => {
    set({ filterValues: {} });
  },

  setFilterConfigs: (configs) => {
    set({ filterConfigs: configs });
  },

  getFilteredComponents: (components) => {
    const { filterValues } = get();
    const hasActiveFilters = Object.values(filterValues).some(
      (v) => v !== null && v !== undefined,
    );
    if (!hasActiveFilters) return components;
    return components.filter((comp) => {
      if (!comp.filters || comp.filters.length === 0) return true;
      return comp.filters.some((binding) => {
        const filterConfig = get().filterConfigs.find((f) => f.id === binding.filterId);
        if (!filterConfig) return false;
        const value = filterValues[binding.filterId];
        return value !== null && value !== undefined;
      });
    });
  },

  getFilterQueryParams: (bindings) => {
    const { filterValues, filterConfigs } = get();
    const params: Record<string, unknown> = {};
    for (const binding of bindings) {
      const value = filterValues[binding.filterId];
      if (value === null || value === undefined) continue;
      const config = filterConfigs.find((f) => f.id === binding.filterId);
      if (!config) continue;
      if (typeof value === 'string') {
        params[binding.column] = value;
      } else if (Array.isArray(value)) {
        params[binding.column] = { $in: value };
      } else if (typeof value === 'object' && 'start' in value && 'end' in value) {
        params[binding.column] = { $between: [value.start, value.end] };
      } else if (typeof value === 'object' && 'min' in value && 'max' in value) {
        params[binding.column] = { $between: [value.min, value.max] };
      } else if (typeof value === 'boolean') {
        params[binding.column] = value;
      }
    }
    return params;
  },

  save: async () => {
    const { dashboard } = get();
    if (!dashboard) return;

    set({ isSaving: true, error: null });
    try {
      const updated = await updateDashboard(dashboard.id, {
        name: dashboard.name,
        description: dashboard.description ?? undefined,
        config: dashboard.config,
        version: dashboard.version,
      });
      set({ dashboard: updated, isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() });
      toast.success('Dashboard saved');
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Save failed', isSaving: false });
      toast.error('Failed to save dashboard');
    }
  },

  reset: () => {
    set({
      dashboard: null,
      activePageId: null,
      selectedComponentId: null,
      filterValues: {},
      isDirty: false,
      isSaving: false,
      isLoading: false,
      lastSavedAt: null,
      error: null,
      undoStack: [],
      redoStack: [],
    });
  },

  undo: () => {
    const { dashboard, undoStack, redoStack } = get();
    if (!dashboard || undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, dashboard.config],
      dashboard: { ...dashboard, config: previous },
      isDirty: true,
    });
  },

  redo: () => {
    const { dashboard, undoStack, redoStack } = get();
    if (!dashboard || redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, dashboard.config],
      dashboard: { ...dashboard, config: next },
      isDirty: true,
    });
  },

  togglePreview: () => {
    set({ isPreview: !get().isPreview, selectedComponentId: null });
  },

  addPage: (name) => {
    const { dashboard } = get();
    if (!dashboard) return;

    const config = dashboard.config;
    const newPage: PageConfig = {
      id: crypto.randomUUID(),
      name,
      components: [],
    };
    set({
      undoStack: pushUndo(get().undoStack, config),
      redoStack: [],
      dashboard: {
        ...dashboard,
        config: {
          ...config,
          pages: [...config.pages, newPage],
        },
      },
      activePageId: newPage.id,
      isDirty: true,
    });
  },

  removePage: (pageId) => {
    const { dashboard, activePageId } = get();
    if (!dashboard) return;
    if (dashboard.config.pages.length <= 1) return;

    const config = dashboard.config;
    const idx = config.pages.findIndex((p) => p.id === pageId);
    if (idx === -1) return;

    const newPages = config.pages.filter((p) => p.id !== pageId);
    let newActivePageId = activePageId;
    if (activePageId === pageId) {
      newActivePageId = newPages[Math.max(0, idx - 1)]?.id ?? newPages[0]?.id ?? null;
    }

    set({
      undoStack: pushUndo(get().undoStack, config),
      redoStack: [],
      dashboard: {
        ...dashboard,
        config: { ...config, pages: newPages },
      },
      activePageId: newActivePageId,
      selectedComponentId: null,
      isDirty: true,
    });
  },

  renamePage: (pageId, name) => {
    const { dashboard } = get();
    if (!dashboard) return;

    const config = dashboard.config;
    set({
      undoStack: pushUndo(get().undoStack, config),
      redoStack: [],
      dashboard: {
        ...dashboard,
        config: {
          ...config,
          pages: config.pages.map((p) => (p.id === pageId ? { ...p, name } : p)),
        },
      },
      isDirty: true,
    });
  },

  reorderPages: (fromIndex, toIndex) => {
    const { dashboard } = get();
    if (!dashboard) return;

    const config = dashboard.config;
    const pages = [...config.pages];
    const [moved] = pages.splice(fromIndex, 1);
    pages.splice(toIndex, 0, moved);

    set({
      undoStack: pushUndo(get().undoStack, config),
      redoStack: [],
      dashboard: {
        ...dashboard,
        config: { ...config, pages },
      },
      isDirty: true,
    });
  },

  updateTheme: (theme) => {
    const { dashboard } = get();
    if (!dashboard) return;

    const config = dashboard.config;
    set({
      undoStack: pushUndo(get().undoStack, config),
      redoStack: [],
      dashboard: {
        ...dashboard,
        config: { ...config, theme },
      },
      isDirty: true,
    });
  },
}));
