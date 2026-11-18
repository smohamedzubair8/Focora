import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LearningGoal, GoalFormData } from '../types/database.types';

const STORAGE_KEY_GOALS = 'focora_local_goals';

// Fallback initial demo data matching Figma design
const INITIAL_DEMO_GOALS: LearningGoal[] = [
  {
    id: 'g-1',
    user_id: 'demo-user',
    skill_name: 'UX/UI Design',
    is_primary: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    resource_count: 4,
  },
  {
    id: 'g-2',
    user_id: 'demo-user',
    skill_name: 'Frontend Development',
    is_primary: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    resource_count: 3,
  },
  {
    id: 'g-3',
    user_id: 'demo-user',
    skill_name: 'JavaScript',
    is_primary: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    resource_count: 2,
  },
  {
    id: 'g-4',
    user_id: 'demo-user',
    skill_name: 'Data Analytics',
    is_primary: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    resource_count: 0,
  },
];

function getLocalGoals(userId: string): LearningGoal[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_GOALS}_${userId}`);
    if (!raw) {
      localStorage.setItem(`${STORAGE_KEY_GOALS}_${userId}`, JSON.stringify(INITIAL_DEMO_GOALS));
      return INITIAL_DEMO_GOALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_GOALS;
  }
}

function saveLocalGoals(userId: string, goals: LearningGoal[]) {
  localStorage.setItem(`${STORAGE_KEY_GOALS}_${userId}`, JSON.stringify(goals));
}

export const goalsService = {
  async fetchGoals(userId: string): Promise<LearningGoal[]> {
    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const goals = getLocalGoals(userId);
      // Sort: primary first, then created_at desc
      return goals.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    // Supabase query with resource count join
    const { data, error } = await supabase
      .from('learning_goals')
      .select('*, learning_resources(count)')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching learning goals:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      skill_name: row.skill_name,
      is_primary: row.is_primary,
      created_at: row.created_at,
      updated_at: row.updated_at,
      resource_count: row.learning_resources?.[0]?.count ?? 0,
    }));
  },

  async createGoal(userId: string, data: GoalFormData): Promise<LearningGoal> {
    const trimmedSkill = data.skill_name.trim();
    if (!trimmedSkill) {
      throw new Error('Skill name cannot be empty.');
    }

    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const current = getLocalGoals(userId);
      const isDuplicate = current.some(
        (g) => g.skill_name.trim().toLowerCase() === trimmedSkill.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(
          `Goal Conflict: "${trimmedSkill}" is already in your learning goals. Choose a distinctive discipline.`
        );
      }

      // If set as primary, unset any existing primary goal
      let updatedGoals = current;
      if (data.is_primary) {
        updatedGoals = updatedGoals.map((g) => ({ ...g, is_primary: false }));
      }

      const newGoal: LearningGoal = {
        id: 'g-' + Date.now(),
        user_id: userId,
        skill_name: trimmedSkill,
        is_primary: data.is_primary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resource_count: 0,
      };

      updatedGoals.unshift(newGoal);
      saveLocalGoals(userId, updatedGoals);
      return newGoal;
    }

    // 1. Check for duplicate skill name for this user (case-insensitive)
    const { data: existingGoals, error: checkError } = await supabase
      .from('learning_goals')
      .select('id, skill_name')
      .eq('user_id', userId);

    if (checkError) {
      throw checkError;
    }

    const hasDuplicate = existingGoals?.some(
      (g) => g.skill_name.trim().toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (hasDuplicate) {
      throw new Error(
        `Goal Conflict: "${trimmedSkill}" is already in your learning goals. Choose a distinctive discipline.`
      );
    }

    // 2. If marked as primary, unset other primary goals for this user first
    if (data.is_primary) {
      await supabase
        .from('learning_goals')
        .update({ is_primary: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_primary', true);
    }

    // 3. Insert new goal
    const { data: inserted, error: insertError } = await supabase
      .from('learning_goals')
      .insert({
        user_id: userId,
        skill_name: trimmedSkill,
        is_primary: data.is_primary,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting goal:', insertError);
      throw insertError;
    }

    return {
      ...inserted,
      resource_count: 0,
    };
  },

  async updateGoal(
    userId: string,
    goalId: string,
    data: Partial<GoalFormData>
  ): Promise<LearningGoal> {
    const trimmedSkill = data.skill_name?.trim();
    if (trimmedSkill !== undefined && !trimmedSkill) {
      throw new Error('Skill name cannot be empty.');
    }

    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const current = getLocalGoals(userId);
      if (trimmedSkill) {
        const isDuplicate = current.some(
          (g) =>
            g.id !== goalId &&
            g.skill_name.trim().toLowerCase() === trimmedSkill.toLowerCase()
        );
        if (isDuplicate) {
          throw new Error(
            `Goal Conflict: "${trimmedSkill}" is already in your learning goals. Choose a distinctive discipline.`
          );
        }
      }

      let updatedGoals = current.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            skill_name: trimmedSkill ?? g.skill_name,
            is_primary: data.is_primary ?? g.is_primary,
            updated_at: new Date().toISOString(),
          };
        }
        if (data.is_primary) {
          return { ...g, is_primary: false };
        }
        return g;
      });

      saveLocalGoals(userId, updatedGoals);
      const target = updatedGoals.find((g) => g.id === goalId);
      if (!target) throw new Error('Goal not found');
      return target;
    }

    // Validate duplicate if skill_name is being changed
    if (trimmedSkill) {
      const { data: existingGoals, error: checkError } = await supabase
        .from('learning_goals')
        .select('id, skill_name')
        .eq('user_id', userId);

      if (checkError) throw checkError;

      const hasDuplicate = existingGoals?.some(
        (g) =>
          g.id !== goalId &&
          g.skill_name.trim().toLowerCase() === trimmedSkill.toLowerCase()
      );

      if (hasDuplicate) {
        throw new Error(
          `Goal Conflict: "${trimmedSkill}" is already in your learning goals. Choose a distinctive discipline.`
        );
      }
    }

    // If making this goal primary, demote all other goals
    if (data.is_primary) {
      await supabase
        .from('learning_goals')
        .update({ is_primary: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .neq('id', goalId)
        .eq('is_primary', true);
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (trimmedSkill !== undefined) updatePayload.skill_name = trimmedSkill;
    if (data.is_primary !== undefined) updatePayload.is_primary = data.is_primary;

    const { data: updated, error: updateError } = await supabase
      .from('learning_goals')
      .update(updatePayload)
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating goal:', updateError);
      throw updateError;
    }

    return updated;
  },

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const current = getLocalGoals(userId);
      const filtered = current.filter((g) => g.id !== goalId);
      saveLocalGoals(userId, filtered);

      // Also unassign resources associated with this goal
      try {
        const rawRes = localStorage.getItem(`focora_local_resources_${userId}`);
        if (rawRes) {
          const resList: any[] = JSON.parse(rawRes);
          const updatedRes = resList.map((r) =>
            r.goal_id === goalId ? { ...r, goal_id: null, learning_goals: null } : r
          );
          localStorage.setItem(
            `focora_local_resources_${userId}`,
            JSON.stringify(updatedRes)
          );
        }
      } catch (e) {
        console.error('Error updating local resources on goal delete:', e);
      }
      return;
    }

    const { error } = await supabase
      .from('learning_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  async setPrimaryGoal(userId: string, goalId: string | null): Promise<void> {
    if (!isSupabaseConfigured() || userId === 'demo-user') {
      const current = getLocalGoals(userId);
      const updated = current.map((g) => ({
        ...g,
        is_primary: goalId ? g.id === goalId : false,
        updated_at: new Date().toISOString(),
      }));
      saveLocalGoals(userId, updated);
      return;
    }

    // Try calling atomic RPC procedure first
    const { error: rpcError } = await supabase.rpc('set_primary_goal', {
      p_goal_id: goalId,
    });

    if (rpcError) {
      // Fallback: two-step update
      await supabase
        .from('learning_goals')
        .update({ is_primary: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_primary', true);

      if (goalId) {
        const { error: setErr } = await supabase
          .from('learning_goals')
          .update({ is_primary: true, updated_at: new Date().toISOString() })
          .eq('id', goalId)
          .eq('user_id', userId);

        if (setErr) throw setErr;
      }
    }
  },
};
