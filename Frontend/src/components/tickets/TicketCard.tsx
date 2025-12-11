import { Link } from 'react-router-dom';
import { Ticket } from '@/types/ticket';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketCategoryBadge } from './TicketCategoryBadge';
import { Calendar, User, Paperclip, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link to={`/tickets/${ticket.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">#{ticket.id}</span>
                <TicketCategoryBadge category={ticket.category} />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {ticket.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <TicketStatusBadge status={ticket.status} />
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {ticket.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {ticket.createdByName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            {ticket.attachment && (
              <span className="flex items-center gap-1 text-primary">
                <Paperclip className="h-3.5 w-3.5" />
                Attached
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
