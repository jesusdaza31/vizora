'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  Table2,
  Gauge,
  Type,
  Filter,
  LayoutGrid,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/store/vizora-builder-store';
import { templates, applyTemplate, type TemplateName } from '@/lib/vizora/templates';
import type { WidgetType, ComponentConfig } from '@/lib/vizora/types';

type WidgetDef = {
  type: WidgetType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const CHART_WIDGETS: WidgetDef[] = [
  { type: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { type: 'line', label: 'Line Chart', icon: LineChart },
  { type: 'pie', label: 'Pie Chart', icon: PieChart },
];

const DATA_WIDGETS: WidgetDef[] = [
  { type: 'table', label: 'Table', icon: Table2 },
  { type: 'kpi', label: 'KPI Card', icon: Gauge },
];

const CONTENT_WIDGETS: WidgetDef[] = [
  { type: 'text', label: 'Text Block', icon: Type },
  { type: 'filter', label: 'Filter', icon: Filter },
];

function getNextPosition(existing: ComponentConfig[]): { x: number; y: number } {
  if (existing.length === 0) return { x: 0, y: 0 };
  const maxY = Math.max(...existing.map((c) => c.layout.y + c.layout.h));
  return { x: 0, y: maxY };
}

export function ComponentPanel() {
  const dashboard = useBuilderStore((s) => s.dashboard);
  const activePageId = useBuilderStore((s) => s.activePageId);
  const addComponent = useBuilderStore((s) => s.addComponent);
  const [templatesOpen, setTemplatesOpen] = useState(true);
  const [widgetsOpen, setWidgetsOpen] = useState(true);

  const activePage = React.useMemo(() => {
    if (!dashboard || !activePageId) return null;
    return dashboard.config.pages.find((p) => p.id === activePageId) ?? null;
  }, [dashboard, activePageId]);

  const existingComponents = activePage?.components ?? [];

  const handleAddWidget = (type: WidgetType) => {
    const pos = getNextPosition(existingComponents);
    const component: ComponentConfig = {
      id: crypto.randomUUID(),
      type,
      layout: { x: pos.x, y: pos.y, w: 4, h: 2 },
      dataSource: { table: '', columns: [] },
      filters: [],
      options: {},
    };
    addComponent(component);
  };

  const handleApplyTemplate = (name: TemplateName) => {
    if (!dashboard || !activePageId) return;
    const template = applyTemplate(name);
    
    // Find existing table and columns from current components to inherit
    const existingComponent = activePage.components.find(
      (c) => c.dataSource?.table && c.dataSource.table.length > 0
    );
    const existingTable = existingComponent?.dataSource?.table ?? '';
    const existingColumns = existingComponent?.dataSource?.columns ?? [];
    
    // Inherit table and columns for new components
    for (const comp of template.components) {
      if (existingTable && (!comp.dataSource?.table || comp.dataSource.table.length === 0)) {
        comp.dataSource = {
          table: existingTable,
          columns: existingColumns.length > 0 ? existingColumns : (comp.dataSource?.columns ?? []),
        };
      }
      addComponent(comp);
    }
  };

  const renderWidgetItem = (def: WidgetDef) => {
    const Icon = def.icon;
    return (
      <button
        key={def.type}
        onClick={() => handleAddWidget(def.type)}
        className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent md:gap-2 md:px-2"
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm text-foreground md:hidden lg:inline">{def.label}</span>
        <Plus className="ml-auto h-3.5 w-3.5 text-muted-foreground/50 md:hidden lg:inline" />
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border px-4 py-2.5 md:px-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider md:hidden lg:block">
          Components
        </h3>
        <LayoutGrid className="mx-auto h-4 w-4 text-muted-foreground md:block lg:hidden" />
      </div>

      <div className="flex flex-col gap-1 p-3 md:p-1.5">
        <button
          onClick={() => setTemplatesOpen(!templatesOpen)}
          className="flex items-center gap-1.5 rounded-md px-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {templatesOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="md:hidden lg:inline">Templates</span>
        </button>
        {templatesOpen && (
          <div className="ml-4 flex flex-col gap-1 md:ml-0 md:hidden lg:block">
            {(Object.entries(templates) as [TemplateName, { name: string; description: string }][]).map(
              ([key, tmpl]) => (
                <button
                  key={key}
                  onClick={() => handleApplyTemplate(key)}
                  className={cn(
                    'rounded-md px-2 py-1.5 text-left transition-colors',
                    key === 'custom'
                      ? 'text-xs text-muted-foreground hover:text-foreground'
                      : 'hover:bg-accent',
                  )}
                >
                  <div className="text-xs font-medium text-foreground">{tmpl.name}</div>
                  <div className="text-[10px] text-muted-foreground">{tmpl.description}</div>
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-3 pb-3 md:px-1.5 md:pb-1.5">
        <button
          onClick={() => setWidgetsOpen(!widgetsOpen)}
          className="flex items-center gap-1.5 rounded-md px-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {widgetsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className="md:hidden lg:inline">Widgets</span>
        </button>
        {widgetsOpen && (
          <div className="ml-4 flex flex-col gap-3 md:ml-0 md:gap-2 lg:ml-4 lg:gap-3">
            <div>
              <p className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider md:hidden lg:block">
                Charts
              </p>
              <div className="flex flex-col gap-1">
                {CHART_WIDGETS.map(renderWidgetItem)}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider md:hidden lg:block">
                Data
              </p>
              <div className="flex flex-col gap-1">
                {DATA_WIDGETS.map(renderWidgetItem)}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider md:hidden lg:block">
                Content
              </p>
              <div className="flex flex-col gap-1">
                {CONTENT_WIDGETS.map(renderWidgetItem)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
