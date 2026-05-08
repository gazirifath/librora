import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Code, Trash2, Pencil, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { validateSnippet, validateSnippetList, SNIPPET_LIMITS } from "@/lib/snippetValidation";

type SnippetPlacement = "head" | "body_start" | "body_end";

type Snippet = {
  id: string;
  name: string;
  type: "custom";
  code: string;
  placement: SnippetPlacement;
  active: boolean;
  description: string;
  created_at: string;
};

const placementLabels: Record<SnippetPlacement, string> = {
  head: "Inside <head>",
  body_start: "After <body> opening",
  body_end: "Before </body> closing",
};

const SNIPPETS_KEY = "code_snippets";

const defaultTemplate = `<!-- Custom code snippet -->
<script>
  // Your custom code here
</script>`;

const normalizePlacement = (value: unknown): SnippetPlacement => {
  if (value === "body_start" || value === "body_end") return value;
  return "head";
};

const normalizeSnippet = (raw: any): Snippet => ({
  id: typeof raw?.id === "string" && raw.id ? raw.id : crypto.randomUUID(),
  name: typeof raw?.name === "string" && raw.name ? raw.name : "Custom Snippet",
  type: "custom",
  code: typeof raw?.code === "string" ? raw.code : "",
  placement: normalizePlacement(raw?.placement),
  active: raw?.active !== false,
  description: typeof raw?.description === "string" ? raw.description : "",
  created_at: typeof raw?.created_at === "string" ? raw.created_at : new Date().toISOString(),
});

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
        const parsed = JSON.parse(data.value);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(normalizeSnippet);
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

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [placement, setPlacement] = useState<SnippetPlacement>("head");
  const [description, setDescription] = useState("");

  const filtered = snippets.filter((snippet) => {
    const q = search.toLowerCase();
    return (
      snippet.name.toLowerCase().includes(q) ||
      snippet.description.toLowerCase().includes(q) ||
      snippet.code.toLowerCase().includes(q)
    );
  });

  const activeCount = snippets.filter((snippet) => snippet.active).length;

  const openAddDialog = () => {
    setName("Custom Snippet");
    setCode(defaultTemplate);
    setPlacement("head");
    setDescription("");
    setEditId(null);
    setShowAdd(true);
  };

  const openEditDialog = (snippet: Snippet) => {
    setName(snippet.name);
    setCode(snippet.code);
    setPlacement(snippet.placement);
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
      updated = snippets.map((snippet) =>
        snippet.id === editId
          ? {
              ...snippet,
              name: name.trim(),
              code: code.trim(),
              placement,
              description: description.trim(),
            }
          : snippet
      );
    } else {
      updated = [
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          type: "custom",
          code: code.trim(),
          placement,
          active: true,
          description: description.trim(),
          created_at: new Date().toISOString(),
        },
        ...snippets,
      ];
    }

    saveSnippets.mutate(updated);
    toast.success(editId ? "Snippet updated" : "Snippet added");
    setShowAdd(false);
  };

  const toggleActive = (id: string) => {
    const updated = snippets.map((snippet) =>
      snippet.id === id ? { ...snippet, active: !snippet.active } : snippet
    );

    saveSnippets.mutate(updated);

    const snippet = snippets.find((item) => item.id === id);
    toast.success(`${snippet?.name} ${snippet?.active ? "disabled" : "enabled"}`);
  };

  const deleteSnippet = (id: string) => {
    const snippet = snippets.find((item) => item.id === id);
    saveSnippets.mutate(snippets.filter((item) => item.id !== id));
    toast.success(`${snippet?.name} deleted`);
  };

  const copyCode = (id: string, snippetCode: string) => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">All Snippets</h1>
          <p className="text-sm text-muted-foreground">Add custom tracking and script code to your site.</p>
        </div>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1.5" /> Add New
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">All ({snippets.length})</span>
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
            <Button size="sm" variant="outline" onClick={openAddDialog}>
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
              {filtered.map((snippet) => (
                <TableRow key={snippet.id} className={snippet.active ? "" : "opacity-60"}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <span className="font-medium text-foreground text-sm">{snippet.name}</span>
                        {snippet.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{snippet.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="text-[10px]">Custom</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {placementLabels[snippet.placement]}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={snippet.active} onCheckedChange={() => toggleActive(snippet.id)} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => copyCode(snippet.id, snippet.code)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                        title="Copy code"
                      >
                        {copied === snippet.id ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Snippet" : "Add New Snippet"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Snippet Type</Label>
              <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-sm text-foreground">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span>Custom Code</span>
              </div>
            </div>

            <div>
              <Label>Placement</Label>
              <Select value={placement} onValueChange={(value) => setPlacement(value as SnippetPlacement)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(placementLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Name *</Label>
              <Input
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Tracking Code"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                className="mt-1.5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this snippet does..."
              />
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
                Paste your custom script, tracking code, or meta tags here.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
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
