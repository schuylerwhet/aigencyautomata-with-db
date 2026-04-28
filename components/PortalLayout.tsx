import React, { ReactNode } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ReceiptText,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  UserCircle,
  Radar,
  Contact
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { cn } from '../src/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface PortalLayoutProps {
  children: ReactNode;
  type: 'admin' | 'client';
}

const adminSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Clients', href: '/admin/clients', icon: Users },
  { label: 'CRM', href: '/admin/crm', icon: Contact },
  { label: 'Invoices', href: '/admin/invoices', icon: ReceiptText },
  { label: 'Reddit Agent', href: '/admin/reddit-agent', icon: Radar },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const clientSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/client', icon: LayoutDashboard },
  { label: 'My Projects', href: '/client/projects', icon: FolderKanban },
  { label: 'Invoices', href: '/client/invoices', icon: ReceiptText },
  { label: 'Messages', href: '/client/messages', icon: Users },
  { label: 'Profile', href: '/client/profile', icon: UserCircle },
];

const PortalLayout: React.FC<PortalLayoutProps> = ({ children, type }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarItems = type === 'admin' ? adminSidebarItems : clientSidebarItems;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white font-mono selection:bg-red-600">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-black border-r border-white/10 transition-all duration-300 flex flex-col z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link to="/" className={cn("text-red-600 font-bold tracking-tighter truncate", isSidebarOpen ? "text-xl" : "text-sm")}>
            {isSidebarOpen ? "AIGENCY." : "A."}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === (type === 'admin' ? '/admin' : '/client')}
              className={({ isActive }) => cn(
                "flex items-center px-6 py-3 text-sm transition-all duration-200 group relative",
                isActive ? "text-white bg-white/5" : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />}
                  <item.icon size={20} className={cn("mr-4", isActive ? "text-red-600" : "group-hover:text-red-600")} />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          {isSidebarOpen && (
            <div className="px-2 py-2 mb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Logged in as</p>
              <p className="text-xs truncate font-bold text-gray-300">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-600/10",
              !isSidebarOpen && "px-2"
            )}
          >
            <LogOut size={20} className={isSidebarOpen ? "mr-4" : ""} />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <h1 className="text-sm font-bold uppercase tracking-widest text-gray-300">
              {type.toUpperCase()} PORTAL
            </h1>
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-xs text-red-600 font-mono">SYSTEM_ID: {user?.id?.slice(0, 8)}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold">{user?.displayName || user?.email?.split('@')[0]}</span>
              <span className="text-[10px] text-red-600 uppercase tracking-tighter">Status: ONLINE</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-600 text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;