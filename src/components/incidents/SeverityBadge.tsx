import { IncidentSeverity } from '@/types/incident';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  className?: string;
}

const severityConfig: Record<IncidentSeverity, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-severity-low/10 text-severity-low border-severity-low/20',
  },
  medium: {
    label: 'Medium',
    className: 'bg-severity-medium/10 text-severity-medium border-severity-medium/20',
  },
  high: {
    label: 'High',
    className: 'bg-severity-high/10 text-severity-high border-severity-high/20',
  },
  critical: {
    label: 'Critical',
    className: 'bg-severity-critical/10 text-severity-critical border-severity-critical/20',
  },
};

export const SeverityBadge = ({ severity, className }: SeverityBadgeProps) => {
  const config = severityConfig[severity];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
