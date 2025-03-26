import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { Globe, Menu, X, Moon, Sun, Search, Building, Calendar, User } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function Navigation() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "bg-white/95 backdrop-blur-md shadow-sm" // Always white background
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-8 py-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
            Wanderlux
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <NavLink to="/" label="Home" isActive={location.pathname === "/"} />
            <NavLink to="/hotels" label="All Hotels" isActive={location.pathname === "/hotels"} />
            
            {user?.publicMetadata?.role === "admin" && (
              <>
                <NavLink 
                  to="/hotels/create" 
                  label="Create Hotel" 
                  isActive={location.pathname === "/hotels/create"} 
                />
                <NavLink 
                  to="/admin/bookings" 
                  label="Manage Bookings" 
                  isActive={location.pathname === "/admin/bookings"} 
                />
              </>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <SignedIn>
            <Button 
              size="sm"
              asChild
              className="rounded-full bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Link to="/account">My Bookings</Link>
            </Button>
            
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          
          <SignedOut>
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <Link to="/sign-in">Log In</Link>
            </Button>
            <Button 
              asChild
              size="sm"
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
            >
              <Link to="/sign-up">Sign Up</Link>
            </Button>
          </SignedOut>
        </div>

        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-700"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white text-gray-900 shadow-lg">
          <div className="flex flex-col space-y-3 p-4">
            <MobileNavLink to="/" label="Home" />
            <MobileNavLink to="/hotels" label="All Hotels" />
            
            <SignedIn>
              <MobileNavLink to="/account" label="My Bookings" />
            </SignedIn>
            
            {user?.publicMetadata?.role === "admin" && (
              <>
                <MobileNavLink to="/hotels/create" label="Create Hotel" />
                <MobileNavLink to="/admin/bookings" label="Manage Bookings" />
              </>
            )}
            
            <div className="pt-3 border-t border-gray-200 mt-2">
              <SignedOut>
                <div className="flex flex-col space-y-3">
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/sign-in">Log In</Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link to="/sign-up">Sign Up</Link>
                  </Button>
                </div>
              </SignedOut>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label, isActive }) {
  return (
    <Link
      to={to}
      className={cn(
        "text-sm font-medium transition-colors relative",
        isActive 
          ? "text-sky-600" 
          : "text-gray-700 hover:text-sky-600" // Dark gray text with blue hover
      )}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded" />
      )}
    </Link>
  );
}

function MobileNavLink({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "text-base py-2 px-2 rounded-md transition-colors",
        isActive 
          ? "bg-sky-50 text-sky-600 font-medium" 
          : "hover:bg-gray-50"
      )}
    >
      {label}
    </Link>
  );
}

export default Navigation;