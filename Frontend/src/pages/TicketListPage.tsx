import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { TicketPagination } from '@/components/tickets/TicketPagination';
import { Button } from '@/components/ui/button';
import { TicketCategory, TicketStatus } from '@/types/ticket';
import { 
  Plus, 
  TicketIcon, 
  FileX, 
  RefreshCw, 
  Loader2, 
  Filter, 
  Search, 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  User,
  Shield,
  MessageSquare,
  FileText,
  Users,
  Target,
  Zap
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export default function TicketListPage() {
  const { getUserTickets, loading, fetchTickets } = useTickets();
  const { user, isAdmin } = useAuth();
  const tickets = getUserTickets();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate statistics - Only for admin
  const adminStats = useMemo(() => {
    if (!isAdmin) return null;
    
    const total = tickets.length;
    const newTickets = tickets.filter(t => t.status === 'New').length;
    const underReview = tickets.filter(t => t.status === 'Under Review').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    
    const highPriority = tickets.filter(t => t.priority === 'High' || t.priority === 'Urgent').length;
    
    // Calculate average days since creation
    const avgDaysOpen = tickets.length > 0 
      ? Math.round(tickets.reduce((acc, t) => {
          const createdAt = new Date(t.createdAt);
          const now = new Date();
          const daysOpen = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return acc + daysOpen;
        }, 0) / tickets.length * 10) / 10
      : 0;

    const uniqueUsers = new Set(tickets.map(t => t.createdBy)).size;

    return { 
      total, 
      new: newTickets, 
      underReview, 
      resolved, 
      highPriority, 
      avgDaysOpen,
      uniqueUsers
    };
  }, [tickets, isAdmin]);

  const userStats = useMemo(() => {
    if (isAdmin) return null;
    
    const userTickets = tickets;
    const total = userTickets.length;
    const newTickets = userTickets.filter(t => t.status === 'New').length;
    const underReview = userTickets.filter(t => t.status === 'Under Review').length;
    const resolved = userTickets.filter(t => t.status === 'Resolved').length;

    return { 
      total, 
      new: newTickets, 
      underReview, 
      resolved 
    };
  }, [tickets, isAdmin]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.createdByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
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

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 animate-fade-in">
        <div className="animate-spin">
          <Loader2 className="h-12 w-12 text-primary" />
        </div>
        <p className="text-lg font-medium text-foreground">Loading your tickets...</p>
        <p className="text-sm text-muted-foreground">Fetching the latest data from our servers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl gradient-primary shadow-glow">
              {isAdmin ? (
                <Shield className="h-6 w-6 text-white" />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                {isAdmin ? 'Admin Dashboard' : 'My Tickets'}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <span>{user?.name}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                <span>{user?.email}</span>
              </p>
            </div>
          </div>
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
            <Button className="gap-2 gradient-primary text-white shadow-md hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {isAdmin && adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/20 border border-primary/20">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-20">
              <TicketIcon className="h-20 w-20 text-primary" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Total Tickets</p>
                <p className="text-3xl font-bold text-primary">{adminStats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                <TicketIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="relative z-10 mt-4 pt-4 border-t border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-primary/80">{adminStats.new} New</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-red-500/20 border border-red-200 dark:border-red-800/30">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-20">
              <AlertCircle className="h-20 w-20 text-red-500" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">High Priority</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{adminStats.highPriority}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/20 backdrop-blur-sm">
                <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="relative z-10 mt-4 pt-4 border-t border-red-200 dark:border-red-800/30">
              <p className="text-sm text-red-600/80 dark:text-red-400/80">Requires immediate attention</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/20 border border-amber-200 dark:border-amber-800/30">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-20">
              <Clock className="h-20 w-20 text-amber-500" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Avg. Response Time</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{adminStats.avgDaysOpen}d</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/20 backdrop-blur-sm">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="relative z-10 mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/30">
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">Days since creation</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/20 border border-emerald-200 dark:border-emerald-800/30">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-20">
              <CheckCircle className="h-20 w-20 text-emerald-500" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Resolved</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{adminStats.resolved}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/20 backdrop-blur-sm">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="relative z-10 mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-emerald-600/80 dark:text-emerald-400/80">{Math.round((adminStats.resolved / adminStats.total) * 100)}% completion rate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Quick Stats */}
      {!isAdmin && userStats && (
        <div className="bg-card rounded-xl p-5 border animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Your Support Summary</h3>
              <p className="text-sm text-muted-foreground">Overview of your ticket history</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/5">
              <p className="text-2xl font-bold text-primary">{userStats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Tickets</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/5">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.new}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting Response</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/5">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{userStats.underReview}</p>
              <p className="text-xs text-muted-foreground mt-1">In Review</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-500/5">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{userStats.resolved}</p>
              <p className="text-xs text-muted-foreground mt-1">Resolved</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Filter Tickets</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

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

        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
              <Search className="h-3 w-3" />
              <span>{filteredTickets.length} of {tickets.length} tickets match</span>
            </div>
          </div>
        )}
      </div>

      {paginatedTickets.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {isAdmin ? 'All Tickets' : 'Your Tickets'} ({filteredTickets.length})
            </h3>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedTickets.map((ticket, index) => (
              <div 
                key={ticket.id} 
                className="animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TicketCard ticket={ticket} />
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="animate-fade-in">
              <TicketPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-scale-in">
          <div className="relative mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
              {hasActiveFilters ? (
                <FileX className="h-10 w-10 text-muted-foreground" />
              ) : (
                <FileText className="h-10 w-10 text-primary" />
              )}
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {hasActiveFilters ? 'No matching tickets found' : 'No tickets yet'}
          </h3>
          
          <p className="text-muted-foreground max-w-sm mb-6">
            {hasActiveFilters 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first support request.'}
          </p>
          
          <div className="flex gap-3">
            {hasActiveFilters ? (
              <Button onClick={handleClearFilters} className="gap-2">
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            ) : (
              <Link to="/tickets/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Ticket
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {isAdmin && adminStats && tickets.length > 0 && (
        <div className="mt-8 pt-6 border-t animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Detailed Statistics
            </h3>
            <div className="text-sm text-muted-foreground">
              Updated in real-time
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-primary/5 via-primary/2 to-primary/10 border border-primary/20">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
                <BarChart3 className="h-24 w-24 text-primary" />
              </div>
              <div className="relative z-10">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Status Distribution
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">New Tickets</span>
                      <span className="font-medium text-primary">{adminStats.new} ({Math.round((adminStats.new / adminStats.total) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(adminStats.new / adminStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Under Review</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">{adminStats.underReview} ({Math.round((adminStats.underReview / adminStats.total) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-amber-500/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(adminStats.underReview / adminStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Resolved</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{adminStats.resolved} ({Math.round((adminStats.resolved / adminStats.total) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-emerald-500/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(adminStats.resolved / adminStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-purple-500/5 via-purple-500/2 to-purple-500/10 border border-purple-200 dark:border-purple-800/30">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
                <Target className="h-24 w-24 text-purple-500" />
              </div>
              <div className="relative z-10">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Performance Metrics
                </h4>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                        {Math.round((adminStats.resolved / adminStats.total) * 100)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/20">
                      <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
                      <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{adminStats.avgDaysOpen}d</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/20">
                      <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Users</p>
                      <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{adminStats.uniqueUsers}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Link to="/tickets/new">
          <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-transform">
            <Plus className="h-6 w-6 text-white" />
          </div>
        </Link>
      </div>
    </div>
  );
}