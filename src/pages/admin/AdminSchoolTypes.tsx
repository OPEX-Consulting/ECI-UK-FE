// pages/admin/AdminSchoolTypes.tsx
import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchoolTypes,
  createSchoolType,
  updateSchoolType,
  deleteSchoolType,
} from "@/services/organisation";
import { ApiSchoolType, SchoolTypeCreatePayload } from "@/types/organisation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SchoolTypeStatus = "Active" | "Deprecated";

interface SchoolTypeRow {
  id: string;
  name: string;
  description: string;
  slug: string;
  country: string;
  status: SchoolTypeStatus;
  orgsUsing: number;
}

// Which roles may mutate school types (mirrors backend require_permission("manage_school_types"))
const CAN_MANAGE = ["super_admin", "platform_admin"];

const AdminSchoolTypes = () => {
  const { adminUser } = useAuth();
  const queryClient = useQueryClient();

  const canManage = adminUser ? CAN_MANAGE.includes(adminUser.role) : false;

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SchoolTypeRow | null>(null); // null = create mode
  const [deleteTarget, setDeleteTarget] = useState<SchoolTypeRow | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("UK");
  const [formError, setFormError] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const {
    data: apiSchoolTypes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["school-types"],
    queryFn: () => getSchoolTypes(0, 100),
  });

  const schoolTypes = useMemo<SchoolTypeRow[]>(() => {
    if (!apiSchoolTypes) return [];
    return apiSchoolTypes.map((st: ApiSchoolType) => ({
      id: st.id,
      name: st.name,
      description: st.description,
      slug: st.slug,
      country: st.country,
      status: (st.status.charAt(0).toUpperCase() +
        st.status.slice(1)) as SchoolTypeStatus,
      orgsUsing: st.orgs_using,
    }));
  }, [apiSchoolTypes]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["school-types"] });

  const createMutation = useMutation({
    mutationFn: (payload: SchoolTypeCreatePayload) => createSchoolType(payload),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err: unknown) => setFormError(extractError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<SchoolTypeCreatePayload>;
    }) => updateSchoolType(id, payload),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err: unknown) => setFormError(extractError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSchoolType(id),
    onSuccess: invalidate,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  function extractError(err: unknown): string {
    const e = err as { response?: { data?: { detail?: unknown } } };
    const detail = e.response?.data?.detail;
    return typeof detail === "string" ? detail : "Something went wrong.";
  }

  function openCreate() {
    setEditTarget(null);
    setName("");
    setDescription("");
    setCountry("UK");
    setFormError("");
    setShowModal(true);
  }

  function openEdit(st: SchoolTypeRow) {
    setEditTarget(st);
    setName(st.name);
    setDescription(st.description);
    setCountry(st.country);
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setFormError("");
  }

  function handleSubmit() {
    setFormError("");
    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Description is required.");
      return;
    }

    if (editTarget) {
      updateMutation.mutate({
        id: editTarget.id,
        payload: { name, description, country },
      });
    } else {
      createMutation.mutate({ name, description, country });
    }
  }

  function handleToggleStatus(st: SchoolTypeRow) {
    const newStatus = st.status === "Active" ? "deprecated" : "active";
    updateMutation.mutate({ id: st.id, payload: { status: newStatus } });
  }

  function handleDelete(st: SchoolTypeRow) {
    setDeleteTarget(st);
  }

  const isBusy = createMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-bold text-2xl">School Types</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Configure school types for the onboarding wizard
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary hover:opacity-90 px-4 py-2 rounded-md font-medium text-primary-foreground text-sm transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add School Type
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="mb-4 w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">
              Fetching school types...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col justify-center items-center px-4 py-20 text-center">
            <AlertCircle className="mb-4 w-8 h-8 text-red-500" />
            <p className="font-medium text-foreground text-sm">
              Failed to load school types
            </p>
            <p className="mt-1 max-w-xs text-muted-foreground text-xs">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
            </p>
          </div>
        ) : schoolTypes.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Plus className="mb-4 w-8 h-8 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">
              No school types found
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="w-8" />
                {[
                  "Name",
                  "Slug",
                  "Country",
                  "Status",
                  "Orgs Using",
                  ...(canManage ? ["Actions"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-semibold text-muted-foreground text-xs text-left tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schoolTypes.map((st) => (
                <tr
                  key={st.id}
                  className="hover:bg-muted/50 border-border/50 border-b transition-colors"
                >
                  <td className="py-4 pl-4 w-8">
                    <div className="flex flex-col gap-0.5 opacity-40 cursor-grab">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex gap-0.5">
                          <span className="bg-muted-foreground rounded-full w-1 h-1" />
                          <span className="bg-muted-foreground rounded-full w-1 h-1" />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">{st.name}</p>
                    <p className="mt-0.5 text-muted-foreground/60 text-xs">
                      {st.description}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <code className="bg-muted px-1.5 py-0.5 border border-border rounded font-mono text-muted-foreground text-xs">
                      {st.slug}
                    </code>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {st.country}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        st.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-center">
                    {st.orgsUsing}
                  </td>

                  {canManage && (
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(st)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete (active) or Restore (deprecated) */}
                        {st.status === "Active" ? (
                          <button
                            onClick={() => handleDelete(st)}
                            disabled={deleteMutation.isPending}
                            className="disabled:opacity-40 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(st)}
                            disabled={updateMutation.isPending}
                            className="disabled:opacity-40 text-muted-foreground hover:text-emerald-500 transition-colors"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-card shadow-2xl p-6 border border-border rounded-xl w-full max-w-sm animate-in duration-200 fade-in zoom-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold">Delete School Type</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {deleteTarget.name}
                </span>
                ? This action cannot be undone.
              </p>

              {deleteMutation.isError && (
                <div className="mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                  {deleteMutation.error instanceof Error
                    ? deleteMutation.error.message
                    : "Failed to delete. Please try again."}
                </div>
              )}

              <div className="flex items-center gap-3 mt-6 w-full">
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    deleteMutation.reset();
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    deleteMutation.mutate(deleteTarget.id, {
                      onSuccess: () => setDeleteTarget(null),
                    })
                  }
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-card shadow-2xl p-6 border border-border rounded-xl w-full max-w-md animate-in duration-200 fade-in zoom-in">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="font-semibold text-lg">
                  {editTarget ? "Edit School Type" : "New School Type"}
                </h2>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  {editTarget
                    ? "Update the school classification"
                    : "Add a new school classification"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block mb-1.5 font-medium text-sm">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Studio School"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background px-3 py-2.5 border border-border focus-within:border-primary rounded-md outline-none w-full text-foreground text-sm transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1.5 font-medium text-sm">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this school type..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background px-3 py-2.5 border border-border focus-within:border-primary rounded-md outline-none w-full text-foreground text-sm transition-colors resize-none"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block mb-1.5 font-medium text-sm">
                  Country
                </label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="bg-background border border-border outline-none w-full h-10 text-foreground text-sm">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground">
                    <SelectItem value="UK">UK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error */}
              {formError && (
                <p className="flex items-center gap-1 text-red-500 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formError}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isBusy}
                className="flex justify-center items-center gap-2 bg-primary hover:opacity-90 disabled:opacity-60 mt-2 py-2.5 rounded-md w-full font-semibold text-primary-foreground text-sm transition-opacity"
              >
                {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                {editTarget ? "Save Changes" : "Create School Type"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchoolTypes;
