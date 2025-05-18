
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, User, Search } from "lucide-react";
import Logo from "@/components/shared/Logo";

/**
 * Header component that appears on all authenticated pages
 * Contains the navigation menu, search, and user controls
 */
const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authenticated navigation links
  const navLinks = [
    { name: "Home", path: "/dashboard" },
    { name: "Explore Clubs", path: "/explore" },
    { name: "My Clubs", path: "/my-clubs" },
    { name: "Calendar", path: "/calendar" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="app-container flex items-center justify-between h-16">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <Logo className="h-10 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-ucscBlue font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Section - Search & User Controls */}
        <div className="flex items-center space-x-4">
          {/* Search Button (Desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link to="/settings" className="w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/" className="w-full">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-3 text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/search"
              className="px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
