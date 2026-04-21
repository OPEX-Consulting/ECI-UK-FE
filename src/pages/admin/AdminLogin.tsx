import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight, 
  ShieldCheck, Loader2, Moon, Sun 
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/landing/Navbar';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { loginAdmin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await loginAdmin(formData);
      
      if (result.success) {
        toast.success('Successfully connected to dashboard');
        navigate('/admin/dashboard');
      } else {
        toast.error(result.error || 'Authentication failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background transition-colors duration-500 relative overflow-hidden">
      <Navbar />
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1986')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 md:bg-black/50"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-20 right-8 z-20">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 rounded-xl bg-card border border-border shadow-sm hover:scale-110 active:scale-95 transition-all text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="w-full max-w-[440px] z-20 mt-20 px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 group hover:rotate-6 transition-transform">
            <ShieldCheck className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tighter mb-2">
            ECI Admin
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-1">Welcome back</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
              >
                Remember this device for 30 days
              </label>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Connect to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
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

export default AdminLogin;
