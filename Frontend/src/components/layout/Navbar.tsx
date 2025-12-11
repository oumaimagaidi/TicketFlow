import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TicketIcon, LogOut, User, Plus, List, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/tickets" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow group-hover:scale-105 transition-transform">
              <TicketIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">TicketHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/tickets">
              <Button 
                variant={isActive('/tickets') ? 'secondary' : 'ghost'} 
                size="sm"
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Tickets
              </Button>
            </Link>
            <Link to="/tickets/new">
              <Button 
                variant={isActive('/tickets/new') ? 'secondary' : 'ghost'} 
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Badge variant="default" className="gap-1.5 py-1 px-3">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline font-medium">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span>{user?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
