import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "./AdminLogin";
import AdminSidebar from "@/components/AdminSidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import useRealtimeSync from "@/hooks/useRealtimeSync";
import AdminDashboardHome from "@/components/admin/DashboardHome";
import AdminPosts from "@/components/admin/Posts";
import AdminPostNew from "@/components/admin/PostNew";
import AdminPostCategories from "@/components/admin/PostCategories";
import AdminPostTags from "@/components/admin/PostTags";
import AdminMedia from "@/components/admin/Media";
import AdminMediaNew from "@/components/admin/MediaNew";
import AdminMediaEdit from "@/components/admin/MediaEdit";
import AdminPages from "@/components/admin/Pages";
import AdminPageNew from "@/components/admin/PageNew";
import AdminUsers from "@/components/admin/Users";
import AdminUserNew from "@/components/admin/UserNew";
import AdminUserProfile from "@/components/admin/UserProfile";
import AdminToolsImport from "@/components/admin/ToolsImport";
import AdminToolsExport from "@/components/admin/ToolsExport";
import AdminSettingsGeneral from "@/components/admin/SettingsGeneral";
import AdminSettingsWriting from "@/components/admin/SettingsWriting";
import AdminSettingsReading from "@/components/admin/SettingsReading";
import AdminSettingsDiscussion from "@/components/admin/SettingsDiscussion";
import AdminSettingsMedia from "@/components/admin/SettingsMedia";
import AdminSettingsPermalinks from "@/components/admin/SettingsPermalinks";
import AdminSettingsPrivacy from "@/components/admin/SettingsPrivacy";
import AdminSettingsSocial from "@/components/admin/SettingsSocial";
import AdminDailyReports from "@/components/admin/DailyReports";
import AdminAutomation from "@/components/admin/AutomationSettings";
import AdminAnalytics from "@/components/admin/Analytics";
import AdminNewsletter from "@/components/admin/NewsletterSubscribers";
import AdminPlugins from "@/components/admin/Plugins";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  useRealtimeSync();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <Routes>
            <Route index element={<AdminDashboardHome />} />
            <Route path="reports" element={<AdminDailyReports />} />
            <Route path="automation" element={<AdminAutomation />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="plugins" element={<AdminPlugins />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="posts/new" element={<AdminPostNew />} />
            <Route path="posts/edit/:id" element={<AdminPostNew />} />
            <Route path="posts/categories" element={<AdminPostCategories />} />
            <Route path="posts/tags" element={<AdminPostTags />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="media/new" element={<AdminMediaNew />} />
            <Route path="media/edit/:id" element={<AdminMediaEdit />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/new" element={<AdminPageNew />} />
            <Route path="pages/edit/:id" element={<AdminPageNew />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/new" element={<AdminUserNew />} />
            <Route path="users/profile" element={<AdminUserProfile />} />
            <Route path="tools/import" element={<AdminToolsImport />} />
            <Route path="tools/export" element={<AdminToolsExport />} />
            <Route path="settings/general" element={<AdminSettingsGeneral />} />
            <Route path="settings/media" element={<AdminSettingsMedia />} />
            <Route path="settings/permalinks" element={<AdminSettingsPermalinks />} />
            <Route path="settings/privacy" element={<AdminSettingsPrivacy />} />
            <Route path="settings/social" element={<AdminSettingsSocial />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
