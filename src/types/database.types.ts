export interface LearningGoal {
  id: string;
  user_id: string;
  skill_name: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  resource_count?: number;
}

export interface LearningResource {
  id: string;
  user_id: string;
  title: string;
  url: string;
  goal_id: string | null;
  created_at: string;
  updated_at: string;
  learning_goals?: {
    id: string;
    skill_name: string;
  } | null;
}

export interface GoalFormData {
  skill_name: string;
  is_primary: boolean;
}

export interface ResourceFormData {
  title: string;
  url: string;
  goal_id: string | null;
}

export type ResourceFilter = 'all' | 'unassigned' | string;
export type ViewMode = 'table' | 'grid';
