import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Building2 } from 'lucide-react';

const OrganizationSetup = () => {
  const { state, updateOrganization, nextStep } = useOnboarding();
  const navigate = useNavigate();
  const [name, setName] = useState(state.organization.name);
  const [domain, setDomain] = useState(state.organization.domain || state.email.split('@')[1] || '');
  const [country, setCountry] = useState(state.organization.country);
  const [region, setRegion] = useState(state.organization.region || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !domain || !country) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    // Simulate API call to create organization
    setTimeout(() => {
      setIsLoading(false);
      updateOrganization({ name, domain, country, region });
      nextStep();
      navigate('/onboarding/compliance');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Organization Setup</h1>
        <p className="text-muted-foreground">
          Tell us about your educational institution
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School / Organization Details</CardTitle>
          <CardDescription>
            This information will be used to configure your compliance environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="e.g. St. Mary's Academy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Official Domain</Label>
              <div className="relative">
                <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="domain"
                  placeholder="school.edu"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="pl-8"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll verify this domain later to ensure official ownership.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry} disabled={isLoading}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region / Local Authority</Label>
                <Input
                  id="region"
                  placeholder="e.g. London"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to Compliance Wizard'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSetup;
