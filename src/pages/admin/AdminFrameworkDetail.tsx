import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Send, Globe, FileText, Loader2,
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Clock,
} from 'lucide-react';
import { getFrameworkDraft, publishFramework } from '@/services/frameworkService';
import type { ApiFrameworkDraft, ApiTheme } from '@/types/framework';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ApiFrameworkDraft['status'],
  { label: string; colour: string; icon: React.ReactNode }
> = {
  draft:            { label: 'Draft',            colour: 'text-slate-400 bg-slate-500/10 border-slate-500/20',   icon: <Clock className="w-3 h-3" /> },
  processing:       { label: 'Processing',       colour: 'text-amber-400 bg-amber-500/10 border-amber-500/20',   icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  ready_for_review: { label: 'Ready for Review', colour: 'text-blue-400 bg-blue-500/10 border-blue-500/20',      icon: <AlertTriangle className="w-3 h-3" /> },
  error:            { label: 'Error',            colour: 'text-red-400 bg-red-500/10 border-red-500/20',         icon: <AlertTriangle className="w-3 h-3" /> },
  published:        { label: 'Published',        colour: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminFrameworkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const canPublish = user?.role === 'platform_admin' || user?.role === 'super_admin';

  const [draft, setDraft] = useState<ApiFrameworkDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getFrameworkDraft(id)
      .then((d) => {
        setDraft(d);
        // Expand all themes by default
        const ids = new Set(d.structured_content?.themes.map((t) => t.id) ?? []);
        setExpandedThemes(ids);
      })
      .catch(() => setError('Failed to load framework. It may have been deleted.'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleTheme = (themeId: string) => {
    setExpandedThemes((prev) => {
      const next = new Set(prev);
      next.has(themeId) ? next.delete(themeId) : next.add(themeId);
      return next;
    });
  };

  const handlePublish = async () => {
    if (!id) return;
    setIsPublishing(true);
    try {
      await publishFramework(id);
      toast.success('Framework published successfully');
      navigate('/admin/frameworks');
    } catch {
      toast.error('Failed to publish framework');
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm">Loading framework…</p>
        </div>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-muted-foreground">{error ?? 'Framework not found.'}</p>
          <button
            onClick={() => navigate('/admin/frameworks')}
            className="text-xs text-primary hover:underline"
          >
            ← Back to frameworks
          </button>
        </div>
      </div>
    );
  }

  const sc = draft.structured_content;
  const statusCfg = STATUS_CONFIG[draft.status];

  const stats = {
    themes: sc?.themes.length ?? 0,
    tasks: sc?.themes.reduce((a, t) => a + t.tasks.length, 0) ?? 0,
    actionItems: sc?.themes.reduce(
      (a, t) => a + t.tasks.reduce((b, task) => b + task.action_items.length, 0),
      0,
    ) ?? 0,
  };

  return (
    <div className="p-7 min-h-screen text-foreground">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/frameworks')}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold">
                {sc?.title ?? `Draft (${draft.id.slice(0, 8)}…)`}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.colour}`}
              >
                {statusCfg.icon}
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Version {sc?.version ?? '—'} · Last updated{' '}
              {new Date(draft.updated_at).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {draft.status !== 'published' && (
            <button
              onClick={() => navigate(`/admin/frameworks/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
          {canPublish && draft.status === 'ready_for_review' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              Publish
            </button>
          )}
          {!canPublish && draft.status === 'ready_for_review' && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-2 rounded-md border border-dashed border-border">
              <Send className="w-3.5 h-3.5" />
              Awaiting approval
            </span>
          )}
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Themes',       value: stats.themes },
          { label: 'Control Tasks', value: stats.tasks },
          { label: 'Action Items', value: stats.actionItems },
          {
            label: 'Source',
            value: draft.original_file_url.startsWith('http') ? (
              <a
                href={draft.original_file_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline text-sm truncate block max-w-[160px]"
              >
                View source ↗
              </a>
            ) : (
              <span className="text-muted-foreground text-sm">Internal / text</span>
            ),
          },
        ].map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {card.label}
            </p>
            {typeof card.value === 'number' ? (
              <p className="text-3xl font-bold">{card.value}</p>
            ) : (
              card.value
            )}
          </div>
        ))}
      </div>

      {/* ── Description ────────────────────────────────────────────────────── */}
      {sc?.description && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Description
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{sc.description}</p>
        </div>
      )}

      {/* ── Themes & Tasks ─────────────────────────────────────────────────── */}
      {sc && sc.themes.length > 0 ? (
        <div className="space-y-4">
          {sc.themes.map((theme: ApiTheme, i: number) => (
            <div
              key={theme.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Theme Header */}
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
                onClick={() => toggleTheme(theme.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sm">{theme.title}</p>
                    {theme.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {theme.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {theme.tasks.length} task{theme.tasks.length !== 1 ? 's' : ''}
                  </span>
                  {expandedThemes.has(theme.id) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Tasks */}
              {expandedThemes.has(theme.id) && theme.tasks.length > 0 && (
                <div className="border-t border-border divide-y divide-border/50">
                  {theme.tasks.map((task, j) => (
                    <div key={task.id} className="px-6 py-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] font-bold text-muted-foreground/60 mt-1 shrink-0">
                          {i + 1}.{j + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                          {task.action_items.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {task.action_items.map((ai) => (
                                <div
                                  key={ai.id}
                                  className="ml-3 pl-3 border-l-2 border-primary/20"
                                >
                                  <p className="text-xs font-semibold text-foreground/80">{ai.title}</p>
                                  {ai.description && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                      {ai.description}
                                    </p>
                                  )}
                                  {ai.evidence_specs.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                      {ai.evidence_specs.map((ev) => (
                                        <span
                                          key={ev.id}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground border border-border"
                                        >
                                          <FileText className="w-2.5 h-2.5" />
                                          {ev.title}
                                          {ev.required && (
                                            <span className="text-red-400 font-bold">*</span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {expandedThemes.has(theme.id) && theme.tasks.length === 0 && (
                <div className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
                  No tasks defined for this theme.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {draft.status === 'processing'
              ? 'AI is extracting the framework structure. Check back shortly.'
              : 'No structured content yet. Edit the draft to add themes and tasks.'}
          </p>
          {draft.status !== 'published' && (
            <button
              onClick={() => navigate(`/admin/frameworks/${id}/edit`)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
            >
              <Pencil className="w-4 h-4" />
              Edit Draft
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFrameworkDetail;
