'use server';

import { revalidatePath } from 'next/cache';

const API_BASE = process.env.API_URL || 'http://localhost:5279';

export async function deleteDashboardAction(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/vizora/dashboards/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete dashboard: ${res.statusText}`);
    }
    revalidatePath('/vizora/dashboards');
  } catch (error) {
    console.error('Delete failed:', error);
  }
}

export async function duplicateDashboardAction(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/vizora/dashboards/${id}/duplicate`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Failed to duplicate dashboard: ${res.statusText}`);
    }
    revalidatePath('/vizora/dashboards');
  } catch (error) {
    console.error('Duplicate failed:', error);
  }
}
