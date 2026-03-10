import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  active: boolean;
  isDropIn: boolean;
  autoUpdate: boolean;
}

const defaultPlugins: Plugin[] = [
  { id: "1", name: "SEO Optimizer", description: "Automatically generates meta tags, sitemaps, and structured data for better search rankings.", version: "2.4.1", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "2", name: "Image Compressor", description: "Compresses uploaded images on the fly to reduce page load times.", version: "1.8.0", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "3", name: "Analytics Tracker", description: "Tracks page views, downloads, and user engagement metrics.", version: "3.1.2", author: "Librora", active: true, isDropIn: true, autoUpdate: false },
  { id: "4", name: "Email Collector", description: "Displays email capture popups and manages collected subscriber emails.", version: "1.5.0", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "5", name: "Social Sharing", description: "Adds social media share buttons to book pages.", version: "2.0.3", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "6", name: "Cookie Consent", description: "Displays GDPR-compliant cookie consent banners with preference management.", version: "1.2.0", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "7", name: "Rich Text Editor", description: "Tiptap-based WYSIWYG editor for pages and post content.", version: "3.0.1", author: "Librora", active: true, isDropIn: true, autoUpdate: false },
  { id: "8", name: "Sitemap Generator", description: "Automatically generates XML sitemaps for search engine indexing.", version: "1.1.0", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "9", name: "Lazy Loader", description: "Lazy loads images and media for improved page performance.", version: "1.3.2", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "10", name: "Schema Markup", description: "Adds JSON-LD structured data for books, reviews, and FAQs.", version: "2.1.0", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "11", name: "Newsletter Manager", description: "Manages newsletter subscriptions and automated email campaigns.", version: "1.6.1", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
  { id: "12", name: "Daily Reporter", description: "Generates daily summary reports of site activity and metrics.", version: "1.0.4", author: "Librora", active: true, isDropIn: false, autoUpdate: false },
];

type FilterType = "all" | "active" | "inactive" | "dropins" | "autoupdates";

const Plugins = () => {
  const [plugins, setPlugins] = useState<Plugin[]>(defaultPlugins);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [bulkAction, setBulkAction] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = plugins.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return matchSearch && p.active;
    if (filter === "inactive") return matchSearch && !p.active;
    if (filter === "dropins") return matchSearch && p.isDropIn;
    if (filter === "autoupdates") return matchSearch && !p.autoUpdate;
    return matchSearch;
  });

  const counts = {
    all: plugins.length,
    active: plugins.filter((p) => p.active).length,
    inactive: plugins.filter((p) => !p.active).length,
    dropins: plugins.filter((p) => p.isDropIn).length,
    autoupdates: plugins.filter((p) => !p.autoUpdate).length,
  };

  const toggleActive = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    const plugin = plugins.find((p) => p.id === id);
    toast.success(`${plugin?.name} ${plugin?.active ? "deactivated" : "activated"}`);
  };

  const toggleAutoUpdate = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, autoUpdate: !p.autoUpdate } : p))
    );
    toast.success("Auto-update setting changed");
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const applyBulk = () => {
    if (!bulkAction || selected.size === 0) return;
    setPlugins((prev) =>
      prev.map((p) => {
        if (!selected.has(p.id)) return p;
        if (bulkAction === "activate") return { ...p, active: true };
        if (bulkAction === "deactivate") return { ...p, active: false };
        if (bulkAction === "enable-auto") return { ...p, autoUpdate: true };
        if (bulkAction === "disable-auto") return { ...p, autoUpdate: false };
        return p;
      })
    );
    toast.success(`Bulk action applied to ${selected.size} plugins`);
    setSelected(new Set());
    setBulkAction("");
  };

  const filterBtn = (key: FilterType, label: string) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={`text-sm transition-colors ${filter === key ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
    >
      {label} ({counts[key]})
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Plugins</h1>
          <p className="text-sm text-muted-foreground">Manage installed plugins and extensions</p>
        </div>
        <Button size="sm" onClick={() => toast.info("Plugin marketplace coming soon!")}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Plugin
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 text-sm border-b border-border pb-3">
        {filterBtn("all", "All")}
        <span className="text-muted-foreground">|</span>
        {filterBtn("active", "Active")}
        <span className="text-muted-foreground">|</span>
        {filterBtn("inactive", "Inactive")}
        <span className="text-muted-foreground">|</span>
        {filterBtn("dropins", "Drop-ins")}
        <span className="text-muted-foreground">|</span>
        {filterBtn("autoupdates", "Auto-updates Disabled")}
      </div>

      {/* Bulk + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Bulk actions</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="enable-auto">Enable Auto-updates</option>
            <option value="disable-auto">Disable Auto-updates</option>
          </select>
          <Button variant="outline" size="sm" onClick={applyBulk}>Apply</Button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search installed plugins"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Items count */}
      <p className="text-xs text-muted-foreground">{filtered.length} items</p>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-input"
                />
              </TableHead>
              <TableHead>Plugin</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-32 text-center hidden sm:table-cell">Automatic Updates</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((plugin) => (
              <TableRow key={plugin.id} className={plugin.active ? "" : "opacity-60"}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.has(plugin.id)}
                    onChange={() => toggleSelect(plugin.id)}
                    className="rounded border-input"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium text-foreground">{plugin.name}</span>
                    {plugin.isDropIn && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">Drop-in</Badge>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      v{plugin.version} | By {plugin.author}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => toggleActive(plugin.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        {plugin.active ? "Deactivate" : "Activate"}
                      </button>
                      <span className="text-muted-foreground text-xs">|</span>
                      <button
                        onClick={() => toast.info("Plugin settings coming soon!")}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs">
                  {plugin.description}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={plugin.active ? "default" : "outline"} className="text-[10px]">
                    {plugin.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">
                  <Switch
                    checked={plugin.autoUpdate}
                    onCheckedChange={() => toggleAutoUpdate(plugin.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No plugins found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Plugins;
