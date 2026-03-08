import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

const Users = () => (
  <>
    <div className="flex items-center justify-between mb-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">All Users</h1>
      <Link to="/admin/users/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        <UserPlus className="h-4 w-4" /> Add New
      </Link>
    </div>
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border last:border-0">
            <td className="px-4 py-3 font-medium text-foreground">rifath.swe@gmail.com</td>
            <td className="px-4 py-3">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
            </td>
            <td className="px-4 py-3">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </>
);
export default Users;
