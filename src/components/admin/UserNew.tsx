const UserNew = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Add New User</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-lg">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Email</label>
        <input type="email" placeholder="user@example.com" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Password</label>
        <input type="password" placeholder="••••••••" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Role</label>
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Admin</option>
          <option>Editor</option>
          <option>Author</option>
        </select>
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Add User
      </button>
    </div>
  </>
);
export default UserNew;
