import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText, PlusCircle, FolderOpen, Tags, Image, Library,
  FilePlus, LayoutDashboard, Users, UserPlus, UserCircle,
  Wrench, Upload, Download, Settings, Pencil, BookOpen,
  MessageSquare, ImageIcon, LinkIcon, Shield, LogOut, Leaf,
  ChevronDown, ChevronRight, Webhook, BarChart3, Mail
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Automation", icon: Webhook, path: "/admin/automation" },
  { label: "Newsletter", icon: Mail, path: "/admin/newsletter" },
  {
    label: "Books", icon: FileText, children: [
      { label: "All Books", path: "/admin/posts" },
      { label: "Add Book", path: "/admin/posts/new" },
      { label: "Categories", path: "/admin/posts/categories" },
      { label: "Tags", path: "/admin/posts/tags" },
    ]
  },
  {
    label: "Media", icon: Image, children: [
      { label: "Library", path: "/admin/media" },
      { label: "Add Media File", path: "/admin/media/new" },
    ]
  },
  {
    label: "Pages", icon: LayoutDashboard, children: [
      { label: "All Pages", path: "/admin/pages" },
      { label: "Add Page", path: "/admin/pages/new" },
    ]
  },
  {
    label: "Users", icon: Users, children: [
      { label: "All Users", path: "/admin/users" },
      { label: "Add User", path: "/admin/users/new" },
      { label: "Profile", path: "/admin/users/profile" },
    ]
  },
  {
    label: "Tools", icon: Wrench, children: [
      { label: "Import", path: "/admin/tools/import" },
      { label: "Export", path: "/admin/tools/export" },
    ]
  },
  {
    label: "Settings", icon: Settings, children: [
      { label: "General", path: "/admin/settings/general" },
      { label: "Media", path: "/admin/settings/media" },
      { label: "Permalinks", path: "/admin/settings/permalinks" },
      { label: "Privacy", path: "/admin/settings/privacy" },
      { label: "Social Media", path: "/admin/settings/social" },
    ]
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.children?.some(c => location.pathname === c.path)) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-56 min-h-screen bg-[hsl(var(--leaf-dark))] text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-white/80" />
          <span className="font-heading font-bold text-sm">Librora Admin</span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.path && !item.children ? (
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/10",
                  isActive(item.path) && "bg-white/15 border-l-[3px] border-white"
                )}
              >
                <item.icon className="h-4 w-4 opacity-70" />
                <span>{item.label}</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/10",
                    item.children?.some(c => isActive(c.path)) && "bg-white/10"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 opacity-70" />
                    <span>{item.label}</span>
                  </span>
                  {openMenus[item.label] ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>
                {openMenus[item.label] && item.children && (
                  <div className="bg-black/15">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "block pl-11 pr-4 py-2 text-xs transition-colors hover:bg-white/10",
                          isActive(child.path)
                            ? "text-white bg-white/10 border-l-[3px] border-white"
                            : "text-white/70"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-xs text-white/50 truncate mb-2">{user?.email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
