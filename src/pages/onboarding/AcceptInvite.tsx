import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { schoolAuthService } from "@/services/school/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toHumanReadableError } from "@/lib/errorMessages";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const allRulesMet = rules.every((r) => r.met);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation token.");
    }
  }, [token]);

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
      await schoolAuthService.acceptInvite({
        token,
        password,
        confirm_password: confirmPassword,
      });

      // Update auth context state using checkSession
      await checkSession();
      
      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (err: any) {
      setError(toHumanReadableError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid or missing invitation token.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Accept Invitation
          </h1>
          <p className="text-muted-foreground">
            Set your password to activate your account
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="pr-10"
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="pr-10"
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              {password && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 text-xs transition-all duration-300">
                  <p className="font-semibold text-slate-500 mb-1">PASSWORD REQUIREMENTS</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rules.map((rule, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        {rule.met ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        )}
                        <span className={rule.met ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-slate-400"}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center space-x-2 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                      {password === confirmPassword ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      )}
                      <span className={password === confirmPassword ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-slate-400"}>
                        Passwords match
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isLoading || !allRulesMet || password !== confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    Activate Account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvite;
