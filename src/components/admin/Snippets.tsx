import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, Code, Trash2, Pencil, Copy, Check,
  BarChart3, Globe, Tag, MousePointerClick, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SnippetPlacement = "head" | "body_start" | "body_end";
type SnippetType = "google_analytics" | "gtm" | "search_console" | "google_ads" | "facebook_pixel" | "custom";

interface Snippet {
  id: string;
  name: string;
  type: SnippetType;
  code: string;
  placement: SnippetPlacement;
  active: boolean;
  description: string;
  created_at: string;
}

const snippetTypeInfo: Record<SnippetType, { label: string; icon: React.ElementType; color: string; template: string; placementDefault: SnippetPlacement }> = {
  google_analytics: {
    label: "Google Analytics",
    icon: BarChart3,
    color: "text-orange-500",
    placementDefault: "head",
    template: `<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`,
  },
  gtm: {
    label: "Google Tag Manager",
    icon: Tag,
    color: "text-blue-500",
    placementDefault: "head",
    template: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->`,
  },
  search_console: {
    label: "Google Search Console",
    icon: Globe,
    color: "text-green-500",
    placementDefault: "head",
    template: `<!-- Google Search Console Verification -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />`,
  },
  google_ads: {
    label: "Google Ads",
    icon: Megaphone,
    color: "text-yellow-500",
    placementDefault: "head",
    template: `<!-- Google Ads Conversion Tracking -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXXX');
</script>`,
  },
  facebook_pixel: {
    label: "Facebook Pixel",
    icon: MousePointerClick,
    color: "text-indigo-500",
    placementDefault: "head",
    template: `<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
<!-- End Facebook Pixel Code -->`,
  },
  custom: {
    label: "Custom Code",
    icon: Code,
    color: "text-muted-foreground",
    placementDefault: "head",
    template: `<!-- Custom code snippet -->
<script>
  // Your custom code here
</script>`,
  },
};

const placementLabels: Record<SnippetPlacement, string> = {
  head: "Inside <head>",
  body_start: "After <body> opening",
  body_end: "Before </body> closing",
};

// Use site_settings to persist snippets as JSON
const SNIPPETS_KEY = "code_snippets";

const useSnippets = () => {
  return useQuery({
    queryKey: ["snippets"],
    queryFn: async (): Promise<Snippet[]> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", SNIPPETS_KEY)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      if (!data?.value) return [];
      try {
        return JSON.parse(data.value);
      } catch {
        return [];
      }
    },
  });
};

const useSaveSnippets = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (snippets: Snippet[]) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: SNIPPETS_KEY, value: JSON.stringify(snippets) }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["snippets"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

const Snippets = () => {
  const { data: snippets = [], isLoading } = useSnippets();
  const saveSnippets = useSaveSnippets();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<SnippetType>("google_analytics");
  const [code, setCode] = useState("");
  const [placement, setPlacement] = useState<SnippetPlacement>("head");
  const [description, setDescription] = useState("");

  const filtered = snippets.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      snippetTypeInfo[s.type].label.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = snippets.filter((s) => s.active).length;

  const openAddDialog = (snippetType?: SnippetType) => {
    const t = snippetType || "google_analytics";
    setType(t);
    setCode(snippetTypeInfo[t].template);
    setPlacement(snippetTypeInfo[t].placementDefault);
    setName(snippetTypeInfo[t].label);
    setDescription("");
    setEditId(null);
    setShowAdd(true);
  };

  const openEditDialog = (snippet: Snippet) => {
    setType(snippet.type);
    setCode(snippet.code);
    setPlacement(snippet.placement);
    setName(snippet.name);
    setDescription(snippet.description);
    setEditId(snippet.id);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!name.trim() || !code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    let updated: Snippet[];
    if (editId) {
      updated = snippets.map((s) =>
        s.id === editId ? { ...s, name: name.trim(), type, code: code.trim(), placement, description: description.trim() } : s
      );
    } else {
      const newSnippet: Snippet = {
        id: crypto.randomUUID(),
        name: name.trim(),
        type,
        code: code.trim(),
        placement,
        active: true,
        description: description.trim(),
        created_at: new Date().toISOString(),
      };
      updated = [newSnippet, ...snippets];
    }
    saveSnippets.mutate(updated);
    toast.success(editId ? "Snippet updated" : "Snippet added");
    setShowAdd(false);
  };

  const toggleActive = (id: string) => {
    const updated = snippets.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    saveSnippets.mutate(updated);
    const snippet = snippets.find((s) => s.id === id);
    toast.success(`${snippet?.name} ${snippet?.active ? "disabled" : "enabled"}`);
  };

  const deleteSnippet = (id: string) => {
    const snippet = snippets.find((s) => s.id === id);
    saveSnippets.mutate(snippets.filter((s) => s.id !== id));
    toast.success(`${snippet?.name} deleted`);
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTypeChange = (newType: SnippetType) => {
    setType(newType);
    if (!editId) {
      setCode(snippetTypeInfo[newType].template);
      setPlacement(snippetTypeInfo[newType].placementDefault);
      setName(snippetTypeInfo[newType].label);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Snippets</h1>
          <p className="text-sm text-muted-foreground">
            Add tracking codes, analytics, and custom scripts to your site
          </p>
        </div>
        <Button size="sm" onClick={() => openAddDialog()}>
          <Plus className="h-4 w-4 mr-1.5" /> Add New
        </Button>
      </div>

      {/* Quick-add cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.entries(snippetTypeInfo) as [SnippetType, typeof snippetTypeInfo[SnippetType]][]).map(
          ([key, info]) => {
            const Icon = info.icon;
            return (
              <button
                key={key}
                onClick={() => openAddDialog(key)}
                className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-center"
              >
                <Icon className={`h-6 w-6 ${info.color}`} />
                <span className="text-xs font-medium text-foreground leading-tight">{info.label}</span>
              </button>
            );
          }
        )}
      </div>

      {/* Stats + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            All ({snippets.length})
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-primary font-medium">Active ({activeCount})</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Snippets Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Code className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-2">
              {snippets.length === 0 ? "No snippets yet" : "No snippets match your search"}
            </p>
            <Button size="sm" variant="outline" onClick={() => openAddDialog()}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Your First Snippet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Placement</TableHead>
                <TableHead className="w-20 text-center">Status</TableHead>
                <TableHead className="w-28 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((snippet) => {
                const info = snippetTypeInfo[snippet.type];
                const Icon = info.icon;
                return (
                  <TableRow key={snippet.id} className={snippet.active ? "" : "opacity-60"}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${info.color} shrink-0`} />
                        <div>
                          <span className="font-medium text-foreground text-sm">{snippet.name}</span>
                          {snippet.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{snippet.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-[10px]">{info.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {placementLabels[snippet.placement]}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={snippet.active}
                        onCheckedChange={() => toggleActive(snippet.id)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => copyCode(snippet.id, snippet.code)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                          title="Copy code"
                        >
                          {copied === snippet.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => openEditDialog(snippet)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSnippet(snippet.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Snippet" : "Add New Snippet"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Snippet Type</Label>
                <Select value={type} onValueChange={(v) => handleTypeChange(v as SnippetType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(snippetTypeInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <info.icon className={`h-3.5 w-3.5 ${info.color}`} />
                          {info.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Placement</Label>
                <Select value={placement} onValueChange={(v) => setPlacement(v as SnippetPlacement)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(placementLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Name *</Label>
              <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Tracking Code" />
            </div>
            <div>
              <Label>Description</Label>
              <Input className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this snippet does..." />
            </div>
            <div>
              <Label>Code *</Label>
              <Textarea
                className="mt-1.5 font-mono text-xs leading-relaxed min-h-[200px]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="<script>...</script>"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste your tracking code, meta tags, or custom script here. Replace placeholder IDs with your actual values.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveSnippets.isPending}>
              <Code className="h-4 w-4 mr-1.5" />
              {editId ? "Update Snippet" : "Add Snippet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Snippets;
