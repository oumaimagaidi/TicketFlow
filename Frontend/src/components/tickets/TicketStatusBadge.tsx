import { Badge } from '@/components/ui/badge';
import { TicketStatus } from '@/types/ticket';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const variantMap: Record<TicketStatus, 'new' | 'underReview' | 'resolved'> = {
    'New': 'new',
    'Under Review': 'underReview',
    'Resolved': 'resolved',
  };

  return (
    <Badge variant={variantMap[status]}>
      {status}
    </Badge>
  );
}
