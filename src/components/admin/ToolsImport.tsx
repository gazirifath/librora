import { useState, useRef } from "react";
import { Upload, FileUp, AlertCircle, CheckCircle2, Globe, FileJson, Table2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BookRow {
  title: string;
  slug: string;
  author?: string;
  summary?: string;
  category?: string;
  cover_url?: string;
  download_url?: string;
  affiliate_url?: string;
  reading_time?: string;
  status?: string;
  key_lessons?: string;
  [key: string]: any;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const parseCSV = (text: string): BookRow[] => {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += char; }
    }
    values.push(current.trim());
    const row: any = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
};

const ToolsImport = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<BookRow[]>([]);
  const [fileType, setFileType] = useState<"csv" | "json" | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const handleFile = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const text = await file.text();

    try {
      let rows: BookRow[];
      if (file.name.endsWith(".json")) {
        setFileType("json");
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        setFileType("csv");
        rows = parseCSV(text);
      }

      // Normalize field names
      rows = rows.map((r) => ({
        ...r,
        title: r.title || r.Title || r.name || r.Name || "",
        slug: r.slug || slugify(r.title || r.Title || r.name || r.Name || ""),
        author: r.author || r.Author || "",
        summary: r.summary || r.Summary || r.description || r.Description || "",
        status: r.status || "draft",
      }));

      setPreview(rows.slice(0, 50));
      setResult(null);
      toast.success(`${rows.length} book(s) found in file`);
    } catch (err: any) {
      toast.error("Failed to parse file: " + err.message);
    }
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setFetchingUrl(true);
    try {
      // Try fetching the URL as JSON or CSV
      const res = await fetch(urlInput.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      let rows: BookRow[];
      try {
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : [parsed];
        setFileType("json");
      } catch {
        rows = parseCSV(text);
        setFileType("csv");
      }

      rows = rows.map((r) => ({
        ...r,
        title: r.title || r.Title || r.name || r.Name || "",
        slug: r.slug || slugify(r.title || r.Title || r.name || r.Name || ""),
        author: r.author || r.Author || "",
        summary: r.summary || r.Summary || r.description || r.Description || "",
        status: r.status || "draft",
      }));

      setPreview(rows.slice(0, 50));
      setResult(null);
      toast.success(`${rows.length} book(s) found from URL`);
    } catch (err: any) {
      toast.error("Failed to fetch URL: " + err.message);
    }
    setFetchingUrl(false);
  };

  const importBooks = async () => {
    if (!preview.length) return;
    setImporting(true);
    const res: ImportResult = { total: preview.length, success: 0, failed: 0, errors: [] };

    // Fetch existing categories to map by name
    const { data: cats } = await supabase.from("categories").select("id, name");
    const catMap = new Map<string, string>();
    cats?.forEach((c: any) => catMap.set(c.name.toLowerCase(), c.id));

    for (const book of preview) {
      try {
        if (!book.title?.trim()) {
          res.failed++;
          res.errors.push(`Skipped: empty title`);
          continue;
        }

        // Check if slug already exists
        const { data: existing } = await supabase.from("posts").select("id").eq("slug", book.slug).maybeSingle();
        if (existing) {
          res.failed++;
          res.errors.push(`"${book.title}" — slug "${book.slug}" already exists`);
          continue;
        }

        let categoryId: string | null = null;
        if (book.category) {
          const key = book.category.toLowerCase();
          if (catMap.has(key)) {
            categoryId = catMap.get(key)!;
          } else {
            // Create new category
            const catSlug = slugify(book.category);
            const { data: newCat, error: catErr } = await supabase
              .from("categories")
              .insert({ name: book.category, slug: catSlug })
              .select("id")
              .single();
            if (!catErr && newCat) {
              catMap.set(key, newCat.id);
              categoryId = newCat.id;
            }
          }
        }

        const keyLessons = book.key_lessons
          ? (typeof book.key_lessons === "string" ? book.key_lessons.split("|").map((l: string) => l.trim()).filter(Boolean) : book.key_lessons)
          : [];

        const { error } = await supabase.from("posts").insert({
          title: book.title.trim(),
          slug: book.slug,
          author: book.author || "",
          summary: book.summary || "",
          cover_url: book.cover_url || "",
          download_url: book.download_url || "",
          affiliate_url: book.affiliate_url || "",
          reading_time: book.reading_time || "5 min",
          status: book.status || "draft",
          category_id: categoryId,
          key_lessons: keyLessons,
        });
        if (error) throw error;
        res.success++;
      } catch (err: any) {
        res.failed++;
        res.errors.push(`"${book.title}" — ${err.message}`);
      }
    }

    setResult(res);
    setImporting(false);
    qc.invalidateQueries({ queryKey: ["posts"] });
    if (res.success > 0) toast.success(`${res.success} book(s) imported successfully`);
    if (res.failed > 0) toast.error(`${res.failed} book(s) failed`);
  };

  const clearPreview = () => {
    setPreview([]);
    setResult(null);
    setFileType(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Import Books</h1>

      {/* Import methods */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* File upload */}
        <div
          className="rounded-lg border-2 border-dashed border-border bg-card p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files); }}
        >
          <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Upload CSV or JSON</p>
          <p className="text-xs text-muted-foreground mb-3">Drag & drop or click to select</p>
          <label className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" /> Select File
            <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={(e) => handleFile(e.target.files)} />
          </label>
        </div>

        {/* URL import */}
        <div className="rounded-lg border border-border bg-card p-8">
          <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1 text-center">Import from URL</p>
          <p className="text-xs text-muted-foreground mb-3 text-center">Paste a URL to a CSV or JSON file</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/books.json"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={handleFetchUrl}
              disabled={fetchingUrl || !urlInput.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {fetchingUrl ? "Fetching..." : "Fetch"}
            </button>
          </div>
        </div>
      </div>

      {/* CSV/JSON Template */}
      <div className="rounded-lg border border-border bg-card p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-2">Expected fields:</p>
        <div className="flex flex-wrap gap-2">
          {["title*", "slug", "author", "summary", "category", "cover_url", "download_url", "affiliate_url", "reading_time", "status", "key_lessons (pipe-separated)"].map((f) => (
            <span key={f} className={`text-xs px-2 py-1 rounded-full ${f.includes("*") ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground"}`}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`rounded-lg border p-4 mb-6 ${result.failed > 0 ? "border-destructive/50 bg-destructive/5" : "border-green-500/50 bg-green-50 dark:bg-green-950/20"}`}>
          <div className="flex items-start gap-3">
            {result.failed > 0 ? <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />}
            <div>
              <p className="text-sm font-medium text-foreground">
                Imported {result.success} of {result.total} books. {result.failed > 0 && `${result.failed} failed.`}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.errors.slice(0, 10).map((e, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {e}</li>
                  ))}
                  {result.errors.length > 10 && <li className="text-xs text-muted-foreground">... and {result.errors.length - 10} more</li>}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              {fileType === "json" ? <FileJson className="h-4 w-4 text-primary" /> : <Table2 className="h-4 w-4 text-primary" />}
              <span className="text-sm font-medium text-foreground">{preview.length} book(s) ready to import</span>
            </div>
            <div className="flex gap-2">
              <button onClick={clearPreview} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                Clear
              </button>
              <button
                onClick={importBooks}
                disabled={importing}
                className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {importing ? "Importing..." : "Import All"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Author</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((b, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 text-foreground font-medium max-w-xs truncate">{b.title || <span className="text-destructive">Missing</span>}</td>
                    <td className="px-3 py-2 text-foreground">{b.author || "—"}</td>
                    <td className="px-3 py-2">{b.category ? <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{b.category}</span> : "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {b.status || "draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default ToolsImport;
