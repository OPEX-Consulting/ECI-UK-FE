import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import edusafeLogo from "@/assets/edusafe-logo.jpg";
import Navbar from "@/components/landing/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on role — re-read from context via the login result
      // We need to read the stored user since context hasn't re-rendered yet
      const stored = localStorage.getItem('regtech_current_user');
      const loggedInUser = stored ? JSON.parse(stored) : null;
      if (loggedInUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background transition-colors duration-500">
      <Navbar />
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1986')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 md:bg-black/50 dark:bg-black/80 transition-colors"></div>
      </div>

      <div className="relative z-10 w-full mt-10 max-w-md space-y-6">
        {/* Branding Title Only */}
        <div className="flex flex-col items-center space-y-3">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-white mb-2">
              Compliance Intelligence
            </h1>
            <p className="text-white/70 text-sm">
              Incident Reporting & Compliance Management
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg bg-card border-border transition-colors">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10 bg-background border-border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or management
                  </span>
                </div>
              </div>

              <Link
                to="/admin/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-sm font-bold text-primary group"
              >
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Login as Admin
              </Link>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials Info */}
        {/* <Card className="bg-secondary/50 border border-border backdrop-blur-sm transition-colors">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-foreground mb-2">
              Demo Accounts (use any password):
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Platform Admin:</span>{" "}
                emmanuel.adedeji@eci.co.uk
              </p>
              <p>
                <span className="font-medium text-foreground">Principal:</span>{" "}
                samuel.john@opexconsult.co.uk
              </p>
              <p>
                <span className="font-medium text-foreground">Officer:</span>{" "}
                sammyjay708@gmail.com
              </p>
              <p>
                <span className="font-medium text-foreground">Staff:</span>{" "}
                john96samuel@gmail.com
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default Login;
