import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Home,
  Package,
  Sparkles,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (isAuthenticated) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (error) {
        // Ignore errors in layout
      }
    };
    loadUser();
  }, []);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotifications', user?.id],
    queryFn: async () => {
      const notifications = await base44.entities.Notification.filter({ user_id: user.id, is_read: false });
      return notifications.length;
    },
    enabled: !!user,
    refetchInterval: 10000,
    initialData: 0
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  const isAdmin = user?.is_admin || user?.role === 'admin';

  // Don't show layout on login/signup/admin login pages
  if (['Login', 'Signup', 'AdminLogin'].includes(currentPageName)) {
    return children;
  }

  // Admin layout
  if (currentPageName === 'AdminDashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <nav className="bg-black/30 backdrop-blur border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/AdminDashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-lg">Admin Portal</span>
                  <p className="text-xs text-gray-300">Campus Lost & Found</p>
                </div>
              </Link>

              {user && (
                <div className="flex items-center gap-4">
                  <span className="text-gray-300 text-sm hidden md:inline">{user.full_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </nav>
        {children}
      </div>
    );
  }

  // Student layout
  const navLinks = [
    { name: 'Home', icon: Home, path: 'Home' },
    { name: 'My Items', icon: Package, path: 'MyItems' },
    { name: 'Matches', icon: Sparkles, path: 'Matches' },
    { name: 'Notifications', icon: Bell, path: 'Notifications', badge: unreadCount }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/Home" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 text-lg">Campus Lost & Found</span>
                <p className="text-xs text-gray-500">GVPCE</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = currentPageName === link.path;
                return (
                  <Link key={link.path} to={`/${link.path}`}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={`relative ${isActive ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white' : ''}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {link.name}
                      {link.badge > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5">
                          {link.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            {user && (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 text-gray-600" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = currentPageName === link.path;
                return (
                  <Link
                    key={link.path}
                    to={`/${link.path}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={`w-full justify-start ${isActive ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white' : ''}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {link.name}
                      {link.badge > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs">
                          {link.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
              
              {user && (
                <>
                  <div className="pt-4 pb-2 border-t">
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2024 Campus Lost & Found System - GVPCE</p>
            <p className="mt-1">Powered by AI • Designed for Students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
