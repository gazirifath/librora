import { useAuth } from "@/hooks/useAuth";

const UserProfile = () => {
  const { user } = useAuth();
  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Profile</h1>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-lg">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Email</label>
          <input type="email" value={user?.email || ""} readOnly className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Display Name</label>
          <input type="text" placeholder="Your name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">New Password</label>
          <input type="password" placeholder="Leave blank to keep current" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Update Profile
        </button>
      </div>
    </>
  );
};
export default UserProfile;
