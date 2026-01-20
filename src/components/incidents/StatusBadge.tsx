import { IncidentStatus } from '@/types/incident';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

const statusConfig: Record<IncidentStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-status-draft/10 text-status-draft border-status-draft/20',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-status-submitted/10 text-status-submitted border-status-submitted/20',
  },
  'under-review': {
    label: 'Under Review',
    className: 'bg-status-under-review/10 text-status-under-review border-status-under-review/20',
  },
  'info-requested': {
    label: 'Info Requested',
    className: 'bg-status-info-requested/10 text-status-info-requested border-status-info-requested/20',
  },
  finalized: {
    label: 'Finalized',
    className: 'bg-status-finalized/10 text-status-finalized border-status-finalized/20',
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
