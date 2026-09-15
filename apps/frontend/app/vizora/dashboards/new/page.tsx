'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDashboard } from '@/lib/vizora/dashboard-api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewDashboardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const dashboard = await createDashboard({
        name: name.trim(),
        description: description.trim() || undefined,
        config: {
          version: 1,
          pages: [
            {
              id: crypto.randomUUID(),
              name: 'Page 1',
              components: [],
            },
          ],
          theme: {
            primaryColor: '#4f46e5',
            chartPalette: ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
            fontSize: 'md',
            borderRadius: 8,
          },
        },
      });

      router.push(`/vizora/dashboards/${dashboard.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 py-8 lg:px-10">
        <button
          onClick={() => router.back()}
          className={cn(
            'mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
            'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-foreground">Create New Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Give your dashboard a name and description to get started.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sales Overview"
                required
                className={cn(
                  'mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                )}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className={cn(
                  'mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                )}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className={cn(
                  'rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground',
                  'transition-colors hover:bg-accent hover:text-foreground',
                )}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium',
                  'text-primary-foreground transition-colors hover:bg-primary/90',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
