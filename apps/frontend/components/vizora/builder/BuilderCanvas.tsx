'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import type { Layout, ResponsiveLayouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useBuilderStore } from '@/store/vizora-builder-store';
import { WidgetRegistry } from './WidgetRegistry';
import { ErrorBoundary } from '../ErrorBoundary';
import { BuilderCanvasSkeleton } from '../skeletons/BuilderCanvasSkeleton';
import { NoComponentsEmptyState } from '../EmptyStates';
import type { ComponentConfig, ThemeConfig, QueryResult } from '@/lib/vizora/types';
import { cn } from '@/lib/utils';

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

type BuilderCanvasProps = {
  theme: ThemeConfig;
  dataMap?: Record<string, QueryResult | null>;
  loadingMap?: Record<string, boolean>;
  errorMap?: Record<string, string | null>;
};



export function BuilderCanvas({ theme, dataMap = {}, loadingMap = {}, errorMap = {} }: BuilderCanvasProps) {
  const dashboard = useBuilderStore((s) => s.dashboard);
  const activePageId = useBuilderStore((s) => s.activePageId);
  const selectedComponentId = useBuilderStore((s) => s.selectedComponentId);
  const selectComponent = useBuilderStore((s) => s.selectComponent);
  const updateComponent = useBuilderStore((s) => s.updateComponent);
  const removeComponent = useBuilderStore((s) => s.removeComponent);
  const isPreview = useBuilderStore((s) => s.isPreview);
  const isLoading = useBuilderStore((s) => s.isLoading);
  const { width, containerRef, mounted } = useContainerWidth();

  const activePage = useMemo(() => {
    if (!dashboard || !activePageId) return null;
    return dashboard.config.pages.find((p) => p.id === activePageId) ?? null;
  }, [dashboard, activePageId]);

  const components = activePage?.components ?? [];

  const layouts = useMemo(() => {
    const lgLayout: Layout = components.map((c) => ({
      i: c.id,
      x: c.layout.x,
      y: c.layout.y,
      w: c.layout.w,
      h: c.layout.h,
    }));
    return { lg: lgLayout };
  }, [components]);

  const handleLayoutChange = useCallback(
    (layout: Layout, allLayouts: ResponsiveLayouts) => {
      for (const item of layout) {
        const comp = components.find((c) => c.id === item.i);
        if (!comp) continue;
        if (
          comp.layout.x === item.x &&
          comp.layout.y === item.y &&
          comp.layout.w === item.w &&
          comp.layout.h === item.h
        ) continue;
        updateComponent(item.i, {
          layout: { x: item.x, y: item.y, w: item.w, h: item.h },
        });
      }
    },
    [components, updateComponent],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return;
      if (!selectedComponentId || isPreview) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeComponent(selectedComponentId);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        selectComponent(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedComponentId, isPreview, removeComponent, selectComponent]);

  const handleSelect = useCallback(
    (e: React.MouseEvent, componentId: string) => {
      if (isPreview) return;
      e.stopPropagation();
      selectComponent(componentId);
    },
    [isPreview, selectComponent],
  );

  if (isLoading) {
    return <BuilderCanvasSkeleton className="flex-1" />;
  }

  if (!activePage) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">No page selected</p>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <NoComponentsEmptyState />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-auto p-4" onClick={() => selectComponent(null)}>
      <ErrorBoundary>
        {mounted && width > 0 && (
          <Responsive
            className={cn('layout', isPreview && 'pointer-events-none')}
            width={width}
            layouts={layouts}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={30}
            margin={[16, 16]}
            containerPadding={[8, 8]}
            dragConfig={{ enabled: !isPreview, handle: '.drag-handle' }}
            resizeConfig={{ enabled: !isPreview, handles: ['se'] }}
            onLayoutChange={handleLayoutChange}
          >
            {components.map((comp) => (
              <div
                key={comp.id}
                onClick={(e) => handleSelect(e, comp.id)}
                className={cn(
                  'overflow-hidden rounded-xl border bg-card transition-shadow',
                  selectedComponentId === comp.id && !isPreview
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-muted-foreground/30',
                )}
              >
                {!isPreview && (
                  <div className="drag-handle flex h-7 items-center justify-between border-b border-border bg-muted/40 px-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      {comp.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">
                      {comp.layout.w}x{comp.layout.h}
                    </span>
                  </div>
                )}
                <div className={cn('p-2', !isPreview && 'h-[calc(100%-28px)]', isPreview && 'h-full')}>
                  <ErrorBoundary>
                    <WidgetRegistry
                      config={comp}
                      data={dataMap[comp.id] ?? null}
                      theme={theme}
                      isLoading={loadingMap[comp.id] ?? false}
                      error={errorMap[comp.id] ?? null}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            ))}
          </Responsive>
        )}
      </ErrorBoundary>
    </div>
  );
}
