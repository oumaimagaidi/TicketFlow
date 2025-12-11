import { Badge } from '@/components/ui/badge';
import { TicketCategory } from '@/types/ticket';

interface TicketCategoryBadgeProps {
  category: TicketCategory;
}

export function TicketCategoryBadge({ category }: TicketCategoryBadgeProps) {
  const variantMap: Record<TicketCategory, 'technical' | 'financial' | 'product'> = {
    'Technical': 'technical',
    'Financial': 'financial',
    'Product': 'product',
  };

  return (
    <Badge variant={variantMap[category]}>
      {category}
    </Badge>
  );
}
