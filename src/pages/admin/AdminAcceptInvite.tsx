import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { acceptAdminInvite } from "@/services/organisation";
import { toast } from "sonner";
import { toHumanReadableError } from "@/lib/errorMessages";

const AdminAcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const allRulesMet = rules.every((r) => r.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing invitation token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!allRulesMet) {
      setError("Please satisfy all password requirements");
      return;
    }

    setIsLoading(true);

    try {
      await acceptAdminInvite(token, password);
      toast.success("Account activated successfully. Please log in.");
      navigate("/admin/login");
    } catch (err: any) {
      setError(toHumanReadableError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background transition-colors duration-500 relative overflow-hidden">
      <Navbar />
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1986')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 md:bg-black/50 dark:bg-black/80 transition-colors"></div>
      </div>

      <div className="w-full max-w-[440px] z-20 mt-20 px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 group hover:rotate-6 transition-transform">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tighter mb-2 text-white">
            Accept Invitation
          </h1>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl backdrop-blur-sm transition-colors duration-500">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-1 text-foreground">
              Set your password
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
              Activate your admin account
            </p>
          </div>

          {!token && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">
                Invalid or missing invitation token.
              </span>
            </div>
          )}

          {token && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {password && (
                <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-2 text-xs transition-all duration-300">
                  <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    PASSWORD REQUIREMENTS
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                    {rules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {rule.met ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        )}
                        <span
                          className={
                            rule.met
                              ? "text-emerald-500 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
                      {password === confirmPassword ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                      <span
                        className={
                          password === confirmPassword
                            ? "text-emerald-500 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        Passwords match
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !allRulesMet || password !== confirmPassword}
                className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Activate Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground font-medium">
          Protected by enterprise-grade 256-bit encryption. <br />
          <span className="text-[10px] mt-2 block opacity-50 uppercase tracking-widest">
            © 2024 ECI UK. All rights reserved.
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdminAcceptInvite;
