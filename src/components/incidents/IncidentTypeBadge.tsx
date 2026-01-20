import { IncidentType } from '@/types/incident';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, Users, Heart } from 'lucide-react';

interface IncidentTypeBadgeProps {
  type: IncidentType;
  className?: string;
  showIcon?: boolean;
}

const typeConfig: Record<IncidentType, { 
  label: string; 
  className: string;
  icon: typeof Shield;
}> = {
  safeguarding: {
    label: 'Safeguarding',
    className: 'bg-incident-safeguarding-bg text-incident-safeguarding border-incident-safeguarding/20',
    icon: Shield,
  },
  behavioral: {
    label: 'Behavioral',
    className: 'bg-incident-behavioral-bg text-incident-behavioral border-incident-behavioral/20',
    icon: Users,
  },
  'health-safety': {
    label: 'Health & Safety',
    className: 'bg-incident-health-safety-bg text-incident-health-safety border-incident-health-safety/20',
    icon: Heart,
  },
};

export const IncidentTypeBadge = ({ type, className, showIcon = true }: IncidentTypeBadgeProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={cn('gap-1.5', config.className, className)}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
};
