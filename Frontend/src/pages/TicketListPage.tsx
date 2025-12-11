import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { TicketPagination } from '@/components/tickets/TicketPagination';
import { Button } from '@/components/ui/button';
import { TicketCategory, TicketStatus } from '@/types/ticket';
import { Plus, TicketIcon, FileX, RefreshCw, Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export default function TicketListPage() {
  const { getUserTickets, loading, fetchTickets } = useTickets();
  const { isAdmin } = useAuth();
  const tickets = getUserTickets();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.createdByName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tickets, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || statusFilter !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: TicketCategory | 'all') => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: TicketStatus | 'all') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {isAdmin ? 'All Tickets' : 'My Tickets'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? `Manage and review ${filteredTickets.length} support tickets`
              : `You have ${filteredTickets.length} ticket${filteredTickets.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Link to="/tickets/new">
            <Button className="gap-2 shadow-md hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <TicketFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Ticket Grid */}
      {paginatedTickets.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
          
          {/* Pagination */}
          <TicketPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            {hasActiveFilters ? (
              <FileX className="h-8 w-8 text-muted-foreground" />
            ) : (
              <TicketIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {hasActiveFilters ? 'No tickets found' : 'No tickets yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your filters or search terms'
              : 'Create your first support ticket to get started'}
          </p>
          {!hasActiveFilters && (
            <Link to="/tickets/new">
              <Button>Create Ticket</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}