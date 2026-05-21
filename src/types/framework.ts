// ── Backend API types (mirrors ECI-UK-BE/models/framework.py) ────────────────

export type FrameworkDraftStatus =
  | 'draft'
  | 'processing'
  | 'pending_obligation_selection'
  | 'synthesizing_tasks'
  | 'ready_for_review'
  | 'error'
  | 'published';

export interface ApiEvidenceSpec {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  expiry_days?: number | null;
  accepted_formats: string[];
  auto_start: boolean;
}

export interface ApiActionItem {
  id: string;
  title: string;
  description?: string;
  evidence_specs: ApiEvidenceSpec[];
}

export interface ApiClauseTags {
  framework_id?: string | null;
  framework_name?: string | null;
  clause_id?: string | null;
  clause_name?: string | null;
  sub_clause_id?: string | null;
  sub_clause_name?: string | null;
  source_citation?: string | null;
}

export interface ApiFrequencyMetadata {
  reg_type?: string | null;
  reg_days?: number | null;
  reg_source?: string | null;
  reg_confidence?: string | null;
  anchor_code?: string | null;
  anchor_window_days?: number | null;
  override_type?: string | null;
  override_days?: number | null;
  override_reason?: string | null;
}

export interface ApiFrameworkSubTask {
  id: string;
  title: string;
  description?: string | null;
  evidence_required: boolean;
  display_order: number;
  evidence_requirements: ApiEvidenceSpec[];
}

export interface ApiTaskMetadata {
  priority?: string | null;
  effort_estimate?: string | null;
  owner_role?: string | null;
  is_ai_generated: boolean;
  generated_at?: string | null;
  human_reviewed: boolean;
}

export interface ApiFrameworkReviewSummary {
  task_count: number;
  sub_task_count: number;
  evidence_spec_count: number;
  human_reviewed_count: number;
  confidence_counts: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface ApiTask {
  id: string;
  title: string;
  description?: string;
  action_items: ApiActionItem[];
  evidence_requirements: ApiEvidenceSpec[];
  clause_tags?: ApiClauseTags | null;
  institution_scope: string[];
  sub_tasks: ApiFrameworkSubTask[];
  frequency?: ApiFrequencyMetadata | null;
  meta?: ApiTaskMetadata | null;
  review_status: string;
  confidence_score?: number | null;
  source_text?: string | null;
  ai_review_notes?: string | null;
}

export interface ApiTheme {
  id: string;
  title: string;
  description?: string;
  tasks: ApiTask[];
}

export interface ApiFramework {
  id: string;
  title: string;
  slug: string;
  description?: string;
  version: string;
  is_published: boolean;
  themes: ApiTheme[];
  review_summary?: ApiFrameworkReviewSummary | null;
  created_at: string;
  updated_at: string;
}

export interface ApiSynthesisProgress {
  tasks_generated: number;
  total_obligations: number;
  current_batch?: number;
  batches_done: number;
  total_batches: number;
}

export interface ApiFrameworkDraft {
  id: string;
  original_file_url: string;
  raw_ai_output?: Record<string, unknown>;
  normalized_text?: string;
  structured_content?: ApiFramework;
  status: FrameworkDraftStatus;
  synthesis_progress?: ApiSynthesisProgress;
  created_by: string;
  created_at: string;
  updated_at: string;
}
