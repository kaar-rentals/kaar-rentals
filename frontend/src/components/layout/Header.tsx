import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/layout/ThemeToggle';
import BrandLogoLink from '@/components/layout/BrandLogo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const baseNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Cars', href: '/cars' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const authenticatedNav = user
    ? [{ name: 'Profile', href: '/profile/me' }]
    : [];

  const navigation = [...baseNavigation, ...authenticatedNav];

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-16 h-16 md:min-h-20 md:h-20 py-1">
          <BrandLogoLink variant="header" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile/me">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <User className="h-4 w-4 mr-2" />
                    My Cars
                  </Button>
                </Link>
                <Link to="/list-car">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    List Your Car
                  </Button>
                </Link>
                <Button onClick={logout} variant="outline">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/list-car">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    List Your Car
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,20rem)] p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col px-4 py-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center min-h-11 px-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="px-4 pb-6 pt-2 space-y-2 border-t border-border mt-auto">
                  {user ? (
                    <>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block" onClick={closeMenu}>
                          <Button variant="outline" className="w-full min-h-11">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Link to="/profile/me" className="block" onClick={closeMenu}>
                        <Button variant="outline" className="w-full min-h-11">
                          <User className="h-4 w-4 mr-2" />
                          My Cars
                        </Button>
                      </Link>
                      <Link to="/list-car" className="block" onClick={closeMenu}>
                        <Button variant="outline" className="w-full min-h-11">
                          List Your Car
                        </Button>
                      </Link>
                      <Button onClick={handleLogout} variant="outline" className="w-full min-h-11">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/list-car" className="block" onClick={closeMenu}>
                        <Button variant="outline" className="w-full min-h-11">
                          List Your Car
                        </Button>
                      </Link>
                      <Link to="/auth" className="block" onClick={closeMenu}>
                        <Button className="w-full min-h-11 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
