import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Plus, Upload, Trash2, X } from "lucide-react";
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
  fileName?: string;
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

  // Add Plugin dialog
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVersion, setNewVersion] = useState("1.0.0");
  const [newAuthor, setNewAuthor] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const deletePlugin = (id: string) => {
    const plugin = plugins.find((p) => p.id === id);
    setPlugins((prev) => prev.filter((p) => p.id !== id));
    toast.success(`${plugin?.name} deleted`);
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
    if (bulkAction === "delete") {
      setPlugins((prev) => prev.filter((p) => !selected.has(p.id)));
      toast.success(`${selected.size} plugins deleted`);
    } else {
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
    }
    setSelected(new Set());
    setBulkAction("");
  };

  const handleAddPlugin = () => {
    if (!newName.trim()) {
      toast.error("Plugin name is required");
      return;
    }
    if (!uploadedFile) {
      toast.error("Please upload a plugin file (.zip or .js)");
      return;
    }
    const newPlugin: Plugin = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: newDesc.trim() || "Custom uploaded plugin",
      version: newVersion.trim() || "1.0.0",
      author: newAuthor.trim() || "Custom",
      active: true,
      isDropIn: false,
      autoUpdate: false,
      fileName: uploadedFile.name,
    };
    setPlugins((prev) => [newPlugin, ...prev]);
    toast.success(`${newPlugin.name} installed and activated`);
    resetAddForm();
  };

  const resetAddForm = () => {
    setShowAdd(false);
    setNewName("");
    setNewDesc("");
    setNewVersion("1.0.0");
    setNewAuthor("");
    setUploadedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const valid = [".zip", ".js", ".ts", ".json"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!valid.includes(ext)) {
        toast.error("Only .zip, .js, .ts, or .json files are accepted");
        return;
      }
      setUploadedFile(file);
      if (!newName) {
        setNewName(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      }
    }
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
        <Button size="sm" onClick={() => setShowAdd(true)}>
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
            <option value="delete">Delete</option>
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
                    {plugin.fileName && (
                      <Badge variant="outline" className="ml-2 text-[10px]">Uploaded</Badge>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      v{plugin.version} | By {plugin.author}
                      {plugin.fileName && <> | File: {plugin.fileName}</>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => toggleActive(plugin.id)} className="text-xs text-primary hover:underline">
                        {plugin.active ? "Deactivate" : "Activate"}
                      </button>
                      <span className="text-muted-foreground text-xs">|</span>
                      <button onClick={() => deletePlugin(plugin.id)} className="text-xs text-destructive hover:underline">
                        Delete
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

      {/* Add Plugin Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Plugin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* File Upload */}
            <div>
              <Label>Plugin File *</Label>
              <input type="file" ref={fileRef} accept=".zip,.js,.ts,.json" onChange={handleFileChange} className="hidden" />
              {uploadedFile ? (
                <div className="mt-1.5 flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/30">
                  <Upload className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm truncate flex-1">{uploadedFile.name}</span>
                  <span className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => setUploadedFile(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-1.5 w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload .zip, .js, .ts, or .json</span>
                </button>
              )}
            </div>
            <div>
              <Label>Plugin Name *</Label>
              <Input className="mt-1.5" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My Custom Plugin" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1.5" rows={2} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What does this plugin do?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Version</Label>
                <Input className="mt-1.5" value={newVersion} onChange={(e) => setNewVersion(e.target.value)} placeholder="1.0.0" />
              </div>
              <div>
                <Label>Author</Label>
                <Input className="mt-1.5" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} placeholder="Author name" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAddForm}>Cancel</Button>
            <Button onClick={handleAddPlugin}>
              <Upload className="h-4 w-4 mr-1.5" /> Install Plugin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plugins;
