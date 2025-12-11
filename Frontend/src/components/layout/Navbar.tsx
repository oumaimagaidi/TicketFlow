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
import { 
  TicketIcon, 
  LogOut, 
  User, 
  Plus, 
  List, 
  Shield, 
  Home,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLinks = () => (
    <>
      <Link to="/tickets" onClick={() => setIsMobileMenuOpen(false)}>
        <Button 
          variant={isActive('/tickets') ? 'secondary' : 'ghost'} 
          size="sm"
          className="gap-2 h-10 rounded-lg transition-all duration-200 group"
        >
          <div className={`p-1.5 rounded-md ${isActive('/tickets') ? 'bg-primary/20' : 'bg-transparent group-hover:bg-primary/10'}`}>
            <List className="h-4 w-4" />
          </div>
          <span>Tickets</span>
          {isActive('/tickets') && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </Button>
      </Link>
      <Link to="/tickets/new" onClick={() => setIsMobileMenuOpen(false)}>
        <Button 
          variant={isActive('/tickets/new') ? 'default' : 'outline'} 
          size="sm"
          className="gap-2 h-10 rounded-lg transition-all duration-200 group hover:shadow-lg hover:scale-[1.02]"
        >
          <div className={`p-1.5 rounded-md ${isActive('/tickets/new') ? 'bg-white/20' : 'bg-primary/10'}`}>
            <Plus className="h-4 w-4" />
          </div>
          <span>New Ticket</span>
        </Button>
      </Link>
    </>
  );

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'border-b border-border/50 bg-card/90 backdrop-blur-xl shadow-sm' : 'border-b border-border/30 bg-card/80 backdrop-blur-lg'}`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <Link to="/tickets" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow group-hover:scale-105 transition-transform duration-300">
                  <TicketIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  TicketHub
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wider">SUPPORT SYSTEM</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <NavLinks />
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
           

            {/* Admin Badge */}
            {isAdmin && (
              <div className="hidden sm:block">
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 rounded-full border-primary/20 bg-primary/5 text-primary">
                  <Shield className="h-3 w-3" />
                  <span className="text-xs font-semibold">Admin</span>
                </Badge>
              </div>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="gap-2.5 h-10 px-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="absolute -inset-1 bg-primary/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 rounded-xl shadow-xl border p-2 animate-in slide-in-from-top-5"
              >
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">{user?.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </span>
                      {isAdmin && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary font-medium">Administrator</span>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="p-3 rounded-lg cursor-pointer hover:bg-accent focus:bg-accent transition-colors">
                  
                 
                </DropdownMenuItem>
                
                <DropdownMenuItem className="p-3 rounded-lg cursor-pointer hover:bg-accent focus:bg-accent transition-colors">
                 
                </DropdownMenuItem>
                
                {isAdmin && (
                  <DropdownMenuItem className="p-3 rounded-lg cursor-pointer hover:bg-primary/10 focus:bg-primary/10 transition-colors">
                    <Activity className="mr-3 h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-primary">Admin Panel</span>
                      <span className="text-xs text-primary/70">System administration</span>
                    </div>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={logout} 
                  className="p-3 rounded-lg cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive focus:text-destructive transition-colors group"
                >
                  <LogOut className="mr-3 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  <div className="flex flex-col">
                    <span>Sign out</span>
                    <span className="text-xs text-destructive/70">Logout from your account</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl animate-in slide-in-from-top-2">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Badge variant="secondary" className="gap-1.5 py-1 px-3 rounded-full">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <NavLinks />
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-accent/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}