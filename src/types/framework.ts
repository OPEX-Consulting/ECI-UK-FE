// ── Backend API types (mirrors ECI-UK-BE/models/framework.py) ────────────────

export type FrameworkDraftStatus =
  | 'draft'
  | 'processing'
  | 'ready_for_review'
  | 'error'
  | 'published';

export interface ApiEvidenceSpec {
  id: string;
  title: string;
  description?: string;
  required: boolean;
}

export interface ApiActionItem {
  id: string;
  title: string;
  description?: string;
  evidence_specs: ApiEvidenceSpec[];
}

export interface ApiTask {
  id: string;
  title: string;
  description?: string;
  action_items: ApiActionItem[];
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
  created_at: string;
  updated_at: string;
}

export interface ApiFrameworkDraft {
  id: string;
  original_file_url: string;
  raw_ai_output?: Record<string, unknown>;
  normalized_text?: string;
  structured_content?: ApiFramework;
  status: FrameworkDraftStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}
