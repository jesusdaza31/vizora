'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useBuilderStore } from '@/store/vizora-builder-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Select } from '@base-ui/react/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Settings2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Aggregation } from '@/lib/vizora/types';
import { TableCombobox } from './TableCombobox';
import { ColumnCombobox } from './ColumnCombobox';

const AGGREGATIONS: { value: Aggregation; label: string }[] = [
  { value: 'SUM', label: 'Sum' },
  { value: 'AVG', label: 'Average' },
  { value: 'COUNT', label: 'Count' },
  { value: 'MIN', label: 'Min' },
  { value: 'MAX', label: 'Max' },
];

const KPI_FORMATS = [
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'percentage', label: 'Percentage' },
];

const TREND_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'up', label: 'Up' },
  { value: 'down', label: 'Down' },
  { value: 'neutral', label: 'Neutral' },
];

const FONT_SIZES = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 text-xs font-semibold text-foreground">{children}</h4>
  );
}

export function PropertyEditor() {
  const dashboard = useBuilderStore((s) => s.dashboard);
  const activePageId = useBuilderStore((s) => s.activePageId);
  const selectedComponentId = useBuilderStore((s) => s.selectedComponentId);
  const updateComponent = useBuilderStore((s) => s.updateComponent);
  const removeComponent = useBuilderStore((s) => s.removeComponent);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const component = useMemo(() => {
    if (!dashboard || !activePageId || !selectedComponentId) return null;
    const page = dashboard.config.pages.find((p) => p.id === activePageId);
    return page?.components.find((c) => c.id === selectedComponentId) ?? null;
  }, [dashboard, activePageId, selectedComponentId]);

  const handleOptionChange = useCallback(
    (key: string, value: unknown) => {
      if (!component) return;
      updateComponent(component.id, {
        options: { ...component.options, [key]: value },
      });
    },
    [component, updateComponent],
  );

  const handleDataSourceChange = useCallback(
    (key: 'table' | 'columns', value: string | string[]) => {
      if (!component) return;
      const newDataSource = { ...component.dataSource, [key]: value };
      if (key === 'table') {
        newDataSource.columns = [];
      }
      updateComponent(component.id, { dataSource: newDataSource });
    },
    [component, updateComponent],
  );

  const handleAggregationChange = useCallback(
    (value: string | null) => {
      if (!component || value === null) return;
      updateComponent(component.id, {
        dataSource: {
          ...component.dataSource,
          aggregation: value as Aggregation,
        },
      });
    },
    [component, updateComponent],
  );

  if (!component) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <Settings2 className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">Select a component to edit its properties</p>
      </div>
    );
  }

  const table = component.dataSource.table;

  const editorContent = (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Properties
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => removeComponent(component.id)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Delete component"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setMobileExpanded(false)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent md:hidden"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div>
          <FieldLabel>Widget Type</FieldLabel>
          <div className="rounded-md bg-muted px-3 py-1.5 text-sm capitalize text-foreground">
            {component.type}
          </div>
        </div>

        <div>
          <FieldLabel>Title</FieldLabel>
          <Input
            value={(component.options.title as string) ?? ''}
            onChange={(e) => handleOptionChange('title', e.target.value)}
            placeholder="Widget title..."
          />
        </div>

        <div>
          <SectionTitle>Data Source</SectionTitle>
          <div className="flex flex-col gap-3">
            <div>
              <FieldLabel>Table</FieldLabel>
              <TableCombobox
                value={component.dataSource.table}
                onChange={(t) => handleDataSourceChange('table', t)}
              />
            </div>
            <div>
              <FieldLabel>Columns</FieldLabel>
              <ColumnCombobox
                table={table}
                value={component.dataSource.columns}
                onChange={(cols) =>
                  handleDataSourceChange('columns', Array.isArray(cols) ? cols : [cols])
                }
                multiple
              />
            </div>
            <div>
              <FieldLabel>Aggregation</FieldLabel>
              <Select.Root
                value={component.dataSource.aggregation ?? ''}
                onValueChange={handleAggregationChange}
              >
                <SelectTrigger className="w-full">
                  {component.dataSource.aggregation ?? 'None'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {AGGREGATIONS.map((agg) => (
                    <SelectItem key={agg.value} value={agg.value}>
                      {agg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select.Root>
            </div>
          </div>
        </div>

        {component.type === 'kpi' && (
          <div>
            <SectionTitle>KPI Options</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Label</FieldLabel>
                <Input
                  value={(component.options.label as string) ?? ''}
                  onChange={(e) => handleOptionChange('label', e.target.value)}
                  placeholder="KPI label"
                />
              </div>
              <div>
                <FieldLabel>Format</FieldLabel>
                <Select.Root
                  value={(component.options.format as string) ?? 'number'}
                  onValueChange={(v: string | null) => handleOptionChange('format', v ?? 'number')}
                >
                  <SelectTrigger className="w-full">
                    {(component.options.format as string) ?? 'number'}
                  </SelectTrigger>
                  <SelectContent>
                    {KPI_FORMATS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select.Root>
              </div>
              <div>
                <FieldLabel>Trend</FieldLabel>
                <Select.Root
                  value={(component.options.trend as string) ?? ''}
                  onValueChange={(v: string | null) => handleOptionChange('trend', v ?? '')}
                >
                  <SelectTrigger className="w-full">
                    {(component.options.trend as string) ?? 'None'}
                  </SelectTrigger>
                  <SelectContent>
                    {TREND_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select.Root>
              </div>
              <div>
                <FieldLabel>Trend Value</FieldLabel>
                <Input
                  value={(component.options.trendValue as string) ?? ''}
                  onChange={(e) => handleOptionChange('trendValue', e.target.value)}
                  placeholder="e.g. +12.5%"
                />
              </div>
            </div>
          </div>
        )}

        {(component.type === 'bar' || component.type === 'line') && (
          <div>
            <SectionTitle>Chart Options</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>X Axis Column</FieldLabel>
                <ColumnCombobox
                  table={table}
                  value={(component.options.xAxis as string) ?? ''}
                  onChange={(v) => handleOptionChange('xAxis', v)}
                />
              </div>
              <div>
                <FieldLabel>Y Axis Columns</FieldLabel>
                <ColumnCombobox
                  table={table}
                  value={
                    Array.isArray(component.options.yAxis)
                      ? (component.options.yAxis as string[])
                      : []
                  }
                  onChange={(v) =>
                    handleOptionChange('yAxis', Array.isArray(v) ? v : [v])
                  }
                  multiple
                />
              </div>
              {component.type === 'bar' && (
                <>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Stacked</FieldLabel>
                    <Switch
                      checked={(component.options.stacked as boolean) ?? false}
                      onCheckedChange={(v) => handleOptionChange('stacked', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Grouped</FieldLabel>
                    <Switch
                      checked={(component.options.grouped as boolean) ?? false}
                      onCheckedChange={(v) => handleOptionChange('grouped', v)}
                    />
                  </div>
                </>
              )}
              {component.type === 'line' && (
                <>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Area Fill</FieldLabel>
                    <Switch
                      checked={(component.options.areaFill as boolean) ?? false}
                      onCheckedChange={(v) => handleOptionChange('areaFill', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Smooth Curves</FieldLabel>
                    <Switch
                      checked={(component.options.smooth as boolean) ?? false}
                      onCheckedChange={(v) => handleOptionChange('smooth', v)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {component.type === 'pie' && (
          <div>
            <SectionTitle>PieChart Options</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Name Key</FieldLabel>
                <ColumnCombobox
                  table={table}
                  value={(component.options.nameKey as string) ?? ''}
                  onChange={(v) => handleOptionChange('nameKey', v)}
                />
              </div>
              <div>
                <FieldLabel>Value Key</FieldLabel>
                <ColumnCombobox
                  table={table}
                  value={(component.options.valueKey as string) ?? ''}
                  onChange={(v) => handleOptionChange('valueKey', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <FieldLabel>Donut</FieldLabel>
                <Switch
                  checked={(component.options.donut as boolean) ?? false}
                  onCheckedChange={(v) => handleOptionChange('donut', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <FieldLabel>Show Labels</FieldLabel>
                <Switch
                  checked={(component.options.showLabels as boolean) ?? true}
                  onCheckedChange={(v) => handleOptionChange('showLabels', v)}
                />
              </div>
            </div>
          </div>
        )}

        {component.type === 'text' && (
          <div>
            <SectionTitle>Text Options</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Content</FieldLabel>
                <Textarea
                  value={(component.options.content as string) ?? ''}
                  onChange={(e) => handleOptionChange('content', e.target.value)}
                  placeholder="Enter text content..."
                  rows={4}
                />
              </div>
              <div>
                <FieldLabel>Font Size</FieldLabel>
                <Select.Root
                  value={(component.options.fontSize as string) ?? 'md'}
                  onValueChange={(v: string | null) => handleOptionChange('fontSize', v ?? 'md')}
                >
                  <SelectTrigger className="w-full">
                    {(component.options.fontSize as string) ?? 'md'}
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select.Root>
              </div>
              <div>
                <FieldLabel>Alignment</FieldLabel>
                <Select.Root
                  value={(component.options.align as string) ?? 'left'}
                  onValueChange={(v: string | null) => handleOptionChange('align', v ?? 'left')}
                >
                  <SelectTrigger className="w-full">
                    {(component.options.align as string) ?? 'left'}
                  </SelectTrigger>
                  <SelectContent>
                    {ALIGNMENTS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select.Root>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="hidden h-full flex-col overflow-y-auto md:flex">
        {editorContent}
      </div>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card shadow-lg transition-transform duration-300 md:hidden',
          mobileExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]',
        )}
        style={{ maxHeight: '70vh' }}
      >
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="flex h-12 w-full items-center justify-between border-b border-border px-4"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Properties — {component.type}
          </span>
          {mobileExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 3rem)' }}>
          {editorContent}
        </div>
      </div>
    </>
  );
}
