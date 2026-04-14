import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, RotateCcw, X, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSchoolTypes } from '@/services/organisation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SchoolTypeStatus = 'Active' | 'Deprecated';

interface SchoolType {
  id: string;
  name: string;
  description: string;
  slug: string;
  country: string;
  status: SchoolTypeStatus;
  orgsUsing: number;
}

const AdminSchoolTypes = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: apiSchoolTypes, isLoading, isError, error } = useQuery({
    queryKey: ['school-types'],
    queryFn: () => getSchoolTypes(0, 100),
  });

  const schoolTypes = useMemo(() => {
    console.log("AdminSchoolTypes - raw API data:", apiSchoolTypes);
    if (!apiSchoolTypes) return [];
    
    const mapped = apiSchoolTypes.map(st => ({
      id: st.id,
      name: st.name,
      description: st.description,
      slug: st.slug,
      country: st.country,
      status: (st.status.charAt(0).toUpperCase() + st.status.slice(1)) as SchoolTypeStatus,
      orgsUsing: st.orgs_using,
    }));
    console.log("AdminSchoolTypes - mapped data:", mapped);
    return mapped;
  }, [apiSchoolTypes]);

  return (
    <div className="p-7 min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">School Types</h1>
          <p className="text-sm mt-1 text-muted-foreground">Configure school types for the onboarding wizard</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-opacity bg-primary text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add School Type
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-card border border-border rounded-[10px] transition-colors duration-300">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-b-[10px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Fetching school types...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-b-[10px] text-center px-4">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-sm font-medium text-foreground">Failed to load school types</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {error instanceof Error ? error.message : "An unexpected error occurred while fetching the school types list."}
            </p>
          </div>
        ) : schoolTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-b-[10px]">
            <Plus className="w-8 h-8 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No school types found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-8" />
                {['Name', 'Slug', 'Country', 'Status', 'Orgs Using', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schoolTypes.map((st) => (
                <tr
                  key={st.id}
                  className="transition-colors border-b border-border/50 hover:bg-muted/50"
                >
                  <td className="pl-4 py-4 w-8">
                    <div className="flex flex-col gap-0.5 cursor-grab opacity-40">
                      <div className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      </div>
                      <div className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      </div>
                      <div className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">{st.name}</p>
                    <p className="text-xs mt-0.5 text-muted-foreground/60">{st.description}</p>
                  </td>
                  <td className="px-4 py-4">
                    <code className="text-xs px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground font-mono">
                      {st.slug}
                    </code>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{st.country}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        st.status === 'Active'
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-muted-foreground">{st.orgsUsing}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {st.status === 'Active' ? (
                        <button className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="text-muted-foreground hover:text-emerald-500 transition-colors">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl p-6 shadow-2xl bg-card border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">New School Type</h2>
                <p className="text-xs mt-0.5 text-muted-foreground">Add a new school classification</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Studio School"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md text-sm outline-none bg-background border border-border text-foreground transition-colors focus-within:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this school type..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md text-sm outline-none resize-none bg-background border border-border text-foreground transition-colors focus-within:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Country</label>
                <Select defaultValue="UK">
                  <SelectTrigger className="w-full h-10 text-sm outline-none bg-background border border-border text-foreground">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground">
                    <SelectItem value="UK">UK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-md text-sm font-semibold transition-opacity bg-primary text-primary-foreground hover:opacity-90 mt-2"
              >
                Create School Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchoolTypes;
