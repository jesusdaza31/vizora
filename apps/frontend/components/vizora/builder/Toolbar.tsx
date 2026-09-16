'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '@/store/vizora-builder-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeEditor } from './ThemeEditor';
import {
  Save,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  Plus,
  X,
  Check,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Palette,
} from 'lucide-react';
import { RelativeTime } from '@/components/vizora/ui/RelativeTime';
import { ConfirmDialog } from '@/components/vizora/ui/ConfirmDialog';

export function Toolbar() {
  const dashboard = useBuilderStore((s) => s.dashboard);
  const activePageId = useBuilderStore((s) => s.activePageId);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const isSaving = useBuilderStore((s) => s.isSaving);
  const isPreview = useBuilderStore((s) => s.isPreview);
  const lastSavedAt = useBuilderStore((s) => s.lastSavedAt);
  const undoStack = useBuilderStore((s) => s.undoStack);
  const redoStack = useBuilderStore((s) => s.redoStack);
  const save = useBuilderStore((s) => s.save);
  const togglePreview = useBuilderStore((s) => s.togglePreview);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const setActivePage = useBuilderStore((s) => s.setActivePage);
  const addPage = useBuilderStore((s) => s.addPage);
  const removePage = useBuilderStore((s) => s.removePage);
  const renamePage = useBuilderStore((s) => s.renamePage);

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);
  const [deletePageConfirmId, setDeletePageConfirmId] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const pages = dashboard?.config.pages ?? [];

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    check();
    el.addEventListener('scroll', check);
    return () => el.removeEventListener('scroll', check);
  }, [pages.length]);

  const startRename = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setEditName(currentName);
  };

  const commitRename = () => {
    if (editingPageId && editName.trim()) {
      renamePage(editingPageId, editName.trim());
    }
    setEditingPageId(null);
    setEditName('');
  };

  const handleAddPage = () => {
    const name = `Page ${pages.length + 1}`;
    addPage(name);
  };

  return (
    <div className="flex h-auto min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-teal-700 bg-teal-600 px-3 py-2 sm:px-4 sm:py-0 sm:h-12 sm:flex-nowrap">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-white truncate max-w-[120px] sm:max-w-none">
          {dashboard?.name ?? 'Dashboard'}
        </span>
        {isSaving && (
          <span className="text-xs text-teal-100">Saving...</span>
        )}
        {!isSaving && isDirty && (
          <span className="text-xs text-amber-300 font-medium">Unsaved changes</span>
        )}
        {!isSaving && !isDirty && lastSavedAt && (
          <span className="text-xs text-teal-100">
            Saved <RelativeTime date={lastSavedAt} />
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center gap-1 min-w-0 px-2 overflow-hidden sm:px-4">
        {canScrollLeft && (
          <button
            onClick={() => tabsRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <div ref={tabsRef} className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {pages.map((page, idx) => (
            <div
              key={page.id}
              className={cn(
                'group flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                page.id === activePageId
                  ? 'bg-teal-700 text-white'
                  : 'text-teal-100 hover:text-white hover:bg-teal-700/50',
              )}
            >
              {editingPageId === page.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditingPageId(null);
                  }}
                  className="w-20 rounded border border-border bg-background px-1 py-0 text-xs outline-none"
                />
              ) : (
                <button
                  onClick={() => setActivePage(page.id)}
                  onDoubleClick={() => startRename(page.id, page.name)}
                  className="max-w-[100px] truncate"
                >
                  {page.name}
                </button>
              )}
              {pages.length > 1 && editingPageId !== page.id && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startRename(page.id, page.name)}
                    className="rounded p-0.5 hover:bg-muted"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </button>
                  <button
                    onClick={() => setDeletePageConfirmId(page.id)}
                    className="rounded p-0.5 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
              {editingPageId === page.id && (
                <button onClick={commitRename} className="rounded p-0.5 hover:bg-muted">
                  <Check className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {canScrollRight && (
          <button
            onClick={() => tabsRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
            className="shrink-0 rounded p-0.5 text-teal-100 hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={handleAddPage}
          className="shrink-0 rounded-md p-1 text-teal-100 transition-colors hover:bg-teal-700 hover:text-white"
          title="Add page"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 shrink-0 sm:gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setThemeEditorOpen(true)}
          title="Theme"
          className="text-teal-100 hover:bg-teal-700 hover:text-white"
        >
          <Palette className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo"
          className="text-teal-100 hover:bg-teal-700 hover:text-white disabled:text-teal-300/50"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo"
          className="text-teal-100 hover:bg-teal-700 hover:text-white disabled:text-teal-300/50"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          title={isPreview ? 'Edit mode' : 'Preview mode'}
          className="text-teal-100 hover:bg-teal-700 hover:text-white"
        >
          {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          onClick={save}
          disabled={!isDirty || isSaving}
          className="gap-1.5 bg-white text-teal-700 hover:bg-teal-50 disabled:bg-teal-100 disabled:text-teal-400"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isSaving ? 'Saving' : 'Save'}</span>
          <span className="sm:hidden">{isSaving ? '...' : 'Save'}</span>
        </Button>
      </div>

      <ThemeEditor open={themeEditorOpen} onClose={() => setThemeEditorOpen(false)} />

      <ConfirmDialog
        open={deletePageConfirmId !== null}
        onOpenChange={(open) => !open && setDeletePageConfirmId(null)}
        title="Delete page"
        description={`Are you sure you want to delete "${pages.find((p) => p.id === deletePageConfirmId)?.name ?? 'this page'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deletePageConfirmId) {
            removePage(deletePageConfirmId);
          }
          setDeletePageConfirmId(null);
        }}
      />
    </div>
  );
}
