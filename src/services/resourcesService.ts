import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LearningResource, ResourceFormData } from '../types/database.types';

const STORAGE_KEY_RESOURCES = 'focora_local_resources';

const INITIAL_DEMO_RESOURCES: LearningResource[] = [
  {
    id: 'r-1',
    user_id: 'demo-user',
    title: 'Advanced Cognitive Walkthroughs & Usability Heuristics',
    url: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
    goal_id: 'g-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    learning_goals: { id: 'g-1', skill_name: 'UX/UI Design' },
  },
  {
    id: 'r-2',
    user_id: 'demo-user',
    title: 'Zero-Runtime React Compiler Architecture in Production',
    url: 'https://overreacted.io',
    goal_id: 'g-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    learning_goals: { id: 'g-2', skill_name: 'Frontend Development' },
  },
  {
    id: 'r-3',
    user_id: 'demo-user',
    title: 'Mathematical Fluid Typography and Variable Font Weight Calculations',
    url: 'https://utopia.fyi/type/calculator',
    goal_id: 'g-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    learning_goals: { id: 'g-1', skill_name: 'UX/UI Design' },
  },
  {
    id: 'r-4',
    user_id: 'demo-user',
    title: 'Typography Basics & Scale Pairing',
    url: 'https://fontpair.co',
    goal_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    learning_goals: null,
  },
  {
    id: 'r-5',
    user_id: 'demo-user',
    title: 'UX Design Fundamentals',
    url: 'https://ixdf.org/ux-fundamentals',
    goal_id: 'g-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    learning_goals: { id: 'g-1', skill_name: 'UX/UI Design' },
  },
  {
    id: 'r-6',
    user_id: 'demo-user',
    title: 'Introduction to JavaScript',
    url: 'https://youtube.com/watch?v=js-primer-2024',
    goal_id: 'g-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    learning_goals: { id: 'g-3', skill_name: 'JavaScript' },
  },
  {
    id: 'r-7',
    user_id: 'demo-user',
    title: 'Design Systems Guide',
    url: 'https://designsystemsrepo.com',
    goal_id: 'g-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
    learning_goals: { id: 'g-1', skill_name: 'UX/UI Design' },
  },
  {
    id: 'r-8',
    user_id: 'demo-user',
    title: 'Responsive Web Design',
    url: 'https://freecodecamp.org/learn/responsive-web-design',
    goal_id: 'g-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 160).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 160).toISOString(),
    learning_goals: { id: 'g-2', skill_name: 'Frontend Development' },
  },
  {
    id: 'r-9',
    user_id: 'demo-user',
    title: 'Modern CSS Grid & Flexbox Techniques',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS',
    goal_id: 'g-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
    learning_goals: { id: 'g-2', skill_name: 'Frontend Development' },
  },
  {
    id: 'r-10',
    user_id: 'demo-user',
    title: 'Advanced JavaScript Event Loop & Microtasks',
    url: 'https://javascript.info/event-loop',
    goal_id: 'g-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    learning_goals: { id: 'g-3', skill_name: 'JavaScript' },
  },
];

function getLocalResources(userId: string): LearningResource[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_RESOURCES}_${userId}`);
    if (!raw) {
      localStorage.setItem(
        `${STORAGE_KEY_RESOURCES}_${userId}`,
        JSON.stringify(INITIAL_DEMO_RESOURCES)
      );
      return INITIAL_DEMO_RESOURCES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_RESOURCES;
  }
}

function saveLocalResources(userId: string, resources: LearningResource[]) {
  localStorage.setItem(`${STORAGE_KEY_RESOURCES}_${userId}`, JSON.stringify(resources));
}

export function isValidUrl(urlString: string): boolean {
  const trimmed = urlString.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:')) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'file:';
  } catch {
    // Also accept local directory/file path references e.g. ~/workspace/..., D:\..., or file names
    return (
      trimmed.startsWith('~/') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('./') ||
      /^[A-Za-z]:[\\/]/.test(trimmed) ||
      /\.(pdf|md|epub|zip|doc|docx|png|jpg|txt)$/i.test(trimmed)
    );
  }
}

export const resourcesService = {
  async fetchResources(
    userId: string,
    searchQuery: string = '',
    goalFilter?: string | null
  ): Promise<LearningResource[]> {
    if (!isSupabaseConfigured() || userId === 'demo-user') {
      let list = getLocalResources(userId);

      // Search query filtering
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        list = list.filter((r) => r.title.toLowerCase().includes(query));
      }

      // Goal filtering
      if (goalFilter === 'unassigned') {
        list = list.filter((r) => !r.goal_id);
      } else if (goalFilter && goalFilter !== 'all') {
        list = list.filter((r) => r.goal_id === goalFilter);
      }

      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    let query = supabase
      .from('learning_resources')
      .select('*, learning_goals(id, skill_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (searchQuery.trim()) {
      query = query.ilike('title', `%${searchQuery.trim()}%`);
    }

    if (goalFilter === 'unassigned') {
      query = query.is('goal_id', null);
    } else if (goalFilter && goalFilter !== 'all') {
      query = query.eq('goal_id', goalFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      url: row.url,
      goal_id: row.goal_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      learning_goals: row.learning_goals ?? null,
    }));
  },

  async checkDuplicateUrl(
    userId: string,
    url: string,
    excludeResourceId?: string
  ): Promise<boolean> {
    const trimmed = url.trim().toLowerCase();
    if (!trimmed) return false;

    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const list = getLocalResources(userId);
      return list.some(
        (r) =>
          r.id !== excludeResourceId &&
          r.url.trim().toLowerCase() === trimmed
      );
    }

    const { data, error } = await supabase
      .from('learning_resources')
      .select('id')
      .eq('user_id', userId)
      .ilike('url', trimmed);

    if (error) return false;
    if (!data || data.length === 0) return false;
    if (excludeResourceId) {
      return data.some((r) => r.id !== excludeResourceId);
    }
    return data.length > 0;
  },

  async createResource(
    userId: string,
    data: ResourceFormData,
    goalSkillName?: string
  ): Promise<LearningResource> {
    const trimmedTitle = data.title.trim();
    const trimmedUrl = data.url.trim();

    if (!trimmedTitle) {
      throw new Error('Resource title cannot be empty.');
    }
    if (!trimmedUrl) {
      throw new Error('Resource URL cannot be empty.');
    }
    if (!isValidUrl(trimmedUrl)) {
      throw new Error('Please enter a valid web URL (e.g. https://example.com).');
    }

    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const list = getLocalResources(userId);
      const newResource: LearningResource = {
        id: 'r-' + Date.now(),
        user_id: userId,
        title: trimmedTitle,
        url: trimmedUrl,
        goal_id: data.goal_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        learning_goals: data.goal_id && goalSkillName
          ? { id: data.goal_id, skill_name: goalSkillName }
          : null,
      };

      list.unshift(newResource);
      saveLocalResources(userId, list);

      // Update goal count locally
      if (data.goal_id) {
        try {
          const goalsRaw = localStorage.getItem(`focora_local_goals_${userId}`);
          if (goalsRaw) {
            const goals: any[] = JSON.parse(goalsRaw);
            const updated = goals.map((g) =>
              g.id === data.goal_id
                ? { ...g, resource_count: (g.resource_count || 0) + 1 }
                : g
            );
            localStorage.setItem(`focora_local_goals_${userId}`, JSON.stringify(updated));
          }
        } catch (e) {
          console.error(e);
        }
      }

      return newResource;
    }

    const { data: inserted, error } = await supabase
      .from('learning_resources')
      .insert({
        user_id: userId,
        title: trimmedTitle,
        url: trimmedUrl,
        goal_id: data.goal_id || null,
      })
      .select('*, learning_goals(id, skill_name)')
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      throw error;
    }

    return {
      id: inserted.id,
      user_id: inserted.user_id,
      title: inserted.title,
      url: inserted.url,
      goal_id: inserted.goal_id,
      created_at: inserted.created_at,
      updated_at: inserted.updated_at,
      learning_goals: inserted.learning_goals ?? null,
    };
  },

  async updateResource(
    userId: string,
    resourceId: string,
    data: ResourceFormData,
    goalSkillName?: string
  ): Promise<LearningResource> {
    const trimmedTitle = data.title.trim();
    const trimmedUrl = data.url.trim();

    if (!trimmedTitle) {
      throw new Error('Resource title cannot be empty.');
    }
    if (!trimmedUrl) {
      throw new Error('Resource URL cannot be empty.');
    }
    if (!isValidUrl(trimmedUrl)) {
      throw new Error('Please enter a valid web URL (e.g. https://example.com).');
    }

    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const list = getLocalResources(userId);
      const updated = list.map((r) => {
        if (r.id === resourceId) {
          return {
            ...r,
            title: trimmedTitle,
            url: trimmedUrl,
            goal_id: data.goal_id || null,
            updated_at: new Date().toISOString(),
            learning_goals: data.goal_id && goalSkillName
              ? { id: data.goal_id, skill_name: goalSkillName }
              : null,
          };
        }
        return r;
      });

      saveLocalResources(userId, updated);
      const res = updated.find((r) => r.id === resourceId);
      if (!res) throw new Error('Resource not found');
      return res;
    }

    const { data: updated, error } = await supabase
      .from('learning_resources')
      .update({
        title: trimmedTitle,
        url: trimmedUrl,
        goal_id: data.goal_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resourceId)
      .eq('user_id', userId)
      .select('*, learning_goals(id, skill_name)')
      .single();

    if (error) {
      console.error('Error updating resource:', error);
      throw error;
    }

    return {
      id: updated.id,
      user_id: updated.user_id,
      title: updated.title,
      url: updated.url,
      goal_id: updated.goal_id,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
      learning_goals: updated.learning_goals ?? null,
    };
  },

  async deleteResource(userId: string, resourceId: string): Promise<void> {
    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const list = getLocalResources(userId);
      const target = list.find((r) => r.id === resourceId);
      const filtered = list.filter((r) => r.id !== resourceId);
      saveLocalResources(userId, filtered);

      // Decrement goal resource count if needed
      if (target?.goal_id) {
        try {
          const goalsRaw = localStorage.getItem(`focora_local_goals_${userId}`);
          if (goalsRaw) {
            const goals: any[] = JSON.parse(goalsRaw);
            const updated = goals.map((g) =>
              g.id === target.goal_id
                ? { ...g, resource_count: Math.max(0, (g.resource_count || 1) - 1) }
                : g
            );
            localStorage.setItem(`focora_local_goals_${userId}`, JSON.stringify(updated));
          }
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    const { error } = await supabase
      .from('learning_resources')
      .delete()
      .eq('id', resourceId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },
};
