import { useState } from "react";
import { Download, FileDown, Globe, FileJson, Table2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ToolsExport = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchAllData = async () => {
    const [
      { data: posts },
      { data: categories },
      { data: tags },
      { data: postTags },
      { data: pages },
      { data: media },
      { data: settings },
    ] = await Promise.all([
      supabase.from("posts").select("*, categories(name, slug)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("tags").select("*").order("name"),
      supabase.from("post_tags").select("post_id, tag_id, tags(name, slug)"),
      supabase.from("pages").select("*").order("title"),
      supabase.from("media").select("*").order("uploaded_at", { ascending: false }),
      supabase.from("site_settings").select("*"),
    ]);
    return { posts: posts || [], categories: categories || [], tags: tags || [], postTags: postTags || [], pages: pages || [], media: media || [], settings: settings || [] };
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = async () => {
    setExporting("json");
    try {
      const data = await fetchAllData();
      // Build tag map per post
      const tagMap = new Map<string, string[]>();
      data.postTags.forEach((pt: any) => {
        const list = tagMap.get(pt.post_id) || [];
        list.push(pt.tags?.name || "");
        tagMap.set(pt.post_id, list);
      });
      const exportData = {
        exported_at: new Date().toISOString(),
        site_settings: Object.fromEntries(data.settings.map((s: any) => [s.key, s.value])),
        categories: data.categories,
        tags: data.tags,
        books: data.posts.map((p: any) => ({ ...p, tags: tagMap.get(p.id) || [] })),
        pages: data.pages,
        media: data.media,
      };
      downloadFile(JSON.stringify(exportData, null, 2), `librora-export-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
      toast.success("JSON export downloaded");
    } catch (err: any) {
      toast.error(err.message);
    }
    setExporting(null);
  };

  const exportCSV = async () => {
    setExporting("csv");
    try {
      const data = await fetchAllData();
      const tagMap = new Map<string, string[]>();
      data.postTags.forEach((pt: any) => {
        const list = tagMap.get(pt.post_id) || [];
        list.push(pt.tags?.name || "");
        tagMap.set(pt.post_id, list);
      });
      const headers = ["title", "slug", "author", "summary", "status", "category", "tags", "cover_url", "download_url", "affiliate_url", "reading_time", "download_count", "key_lessons", "created_at"];
      const rows = data.posts.map((p: any) => [
        csvEscape(p.title), csvEscape(p.slug), csvEscape(p.author), csvEscape(p.summary || ""),
        p.status, csvEscape(p.categories?.name || ""), csvEscape((tagMap.get(p.id) || []).join("|")),
        csvEscape(p.cover_url || ""), csvEscape(p.download_url || ""), csvEscape(p.affiliate_url || ""),
        p.reading_time || "", p.download_count || 0,
        csvEscape((p.key_lessons || []).join("|")), p.created_at,
      ]);
      const csv = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
      downloadFile(csv, `librora-books-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
      toast.success("CSV export downloaded");
    } catch (err: any) {
      toast.error(err.message);
    }
    setExporting(null);
  };

  const exportWXR = async () => {
    setExporting("wxr");
    try {
      const data = await fetchAllData();
      const tagMap = new Map<string, any[]>();
      data.postTags.forEach((pt: any) => {
        const list = tagMap.get(pt.post_id) || [];
        list.push(pt.tags);
        tagMap.set(pt.post_id, list);
      });

      const now = new Date().toUTCString();
      const siteTitle = data.settings.find((s: any) => s.key === "site_title")?.value || "Librora";
      const siteUrl = window.location.origin;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
  <title>${escXml(siteTitle)}</title>
  <link>${siteUrl}</link>
  <description>Exported from Librora</description>
  <pubDate>${now}</pubDate>
  <language>en</language>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>${siteUrl}</wp:base_site_url>
  <wp:base_blog_url>${siteUrl}</wp:base_blog_url>
`;

      // Categories
      data.categories.forEach((c: any) => {
        xml += `
  <wp:category>
    <wp:term_id>${escXml(c.id)}</wp:term_id>
    <wp:category_nicename><![CDATA[${c.slug}]]></wp:category_nicename>
    <wp:cat_name><![CDATA[${c.name}]]></wp:cat_name>
    <wp:category_description><![CDATA[${c.description || ""}]]></wp:category_description>
  </wp:category>`;
      });

      // Tags
      data.tags.forEach((t: any) => {
        xml += `
  <wp:tag>
    <wp:term_id>${escXml(t.id)}</wp:term_id>
    <wp:tag_slug><![CDATA[${t.slug}]]></wp:tag_slug>
    <wp:tag_name><![CDATA[${t.name}]]></wp:tag_name>
    <wp:tag_description><![CDATA[${t.description || ""}]]></wp:tag_description>
  </wp:tag>`;
      });

      // Books as posts
      data.posts.forEach((p: any) => {
        const postTags = tagMap.get(p.id) || [];
        const postDate = new Date(p.created_at).toISOString().replace("T", " ").replace("Z", "");
        const wpStatus = p.status === "published" ? "publish" : "draft";

        xml += `
  <item>
    <title>${escXml(p.title)}</title>
    <link>${siteUrl}/${p.slug}</link>
    <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
    <dc:creator><![CDATA[${p.author || "admin"}]]></dc:creator>
    <description></description>
    <content:encoded><![CDATA[${buildPostContent(p)}]]></content:encoded>
    <excerpt:encoded><![CDATA[${p.summary || ""}]]></excerpt:encoded>
    <wp:post_id>${escXml(p.id)}</wp:post_id>
    <wp:post_date>${postDate}</wp:post_date>
    <wp:post_date_gmt>${postDate}</wp:post_date_gmt>
    <wp:post_name><![CDATA[${p.slug}]]></wp:post_name>
    <wp:status>${wpStatus}</wp:status>
    <wp:post_type>post</wp:post_type>`;

        if (p.categories?.name) {
          xml += `
    <category domain="category" nicename="${escXml(p.categories?.slug || "")}"><![CDATA[${p.categories.name}]]></category>`;
        }
        postTags.forEach((t: any) => {
          if (t?.name) {
            xml += `
    <category domain="post_tag" nicename="${escXml(t.slug || "")}"><![CDATA[${t.name}]]></category>`;
          }
        });

        // Custom fields
        const metas: [string, string][] = [
          ["reading_time", p.reading_time || ""],
          ["download_url", p.download_url || ""],
          ["affiliate_url", p.affiliate_url || ""],
          ["download_count", String(p.download_count || 0)],
          ["cover_url", p.cover_url || ""],
          ["cover_alt_text", p.cover_alt_text || ""],
          ["cover_caption", p.cover_caption || ""],
        ];
        if (p.key_lessons?.length) metas.push(["key_lessons", JSON.stringify(p.key_lessons)]);
        if (p.faq) metas.push(["faq", JSON.stringify(p.faq)]);

        metas.forEach(([key, val]) => {
          if (val) {
            xml += `
    <wp:postmeta>
      <wp:meta_key>${key}</wp:meta_key>
      <wp:meta_value><![CDATA[${val}]]></wp:meta_value>
    </wp:postmeta>`;
          }
        });

        xml += `
  </item>`;
      });

      // Pages
      data.pages.forEach((pg: any) => {
        const pgDate = new Date(pg.created_at).toISOString().replace("T", " ").replace("Z", "");
        const wpStatus = pg.status === "published" ? "publish" : "draft";
        xml += `
  <item>
    <title>${escXml(pg.title)}</title>
    <link>${siteUrl}/${pg.slug}</link>
    <pubDate>${new Date(pg.created_at).toUTCString()}</pubDate>
    <dc:creator><![CDATA[admin]]></dc:creator>
    <content:encoded><![CDATA[${pg.content || ""}]]></content:encoded>
    <wp:post_id>${escXml(pg.id)}</wp:post_id>
    <wp:post_date>${pgDate}</wp:post_date>
    <wp:post_date_gmt>${pgDate}</wp:post_date_gmt>
    <wp:post_name><![CDATA[${pg.slug}]]></wp:post_name>
    <wp:status>${wpStatus}</wp:status>
    <wp:post_type>page</wp:post_type>
  </item>`;
      });

      // Media as attachments
      data.media.forEach((m: any) => {
        const mDate = new Date(m.uploaded_at).toISOString().replace("T", " ").replace("Z", "");
        xml += `
  <item>
    <title>${escXml(m.filename)}</title>
    <link>${escXml(m.url)}</link>
    <pubDate>${new Date(m.uploaded_at).toUTCString()}</pubDate>
    <dc:creator><![CDATA[admin]]></dc:creator>
    <wp:post_id>${escXml(m.id)}</wp:post_id>
    <wp:post_date>${mDate}</wp:post_date>
    <wp:post_name><![CDATA[${m.filename}]]></wp:post_name>
    <wp:status>inherit</wp:status>
    <wp:post_type>attachment</wp:post_type>
    <wp:attachment_url>${escXml(m.url)}</wp:attachment_url>
    <wp:postmeta>
      <wp:meta_key>_wp_attached_file</wp:meta_key>
      <wp:meta_value><![CDATA[${m.filename}]]></wp:meta_value>
    </wp:postmeta>
  </item>`;
      });

      xml += `
</channel>
</rss>`;

      downloadFile(xml, `librora-export-${new Date().toISOString().slice(0, 10)}.xml`, "application/xml");
      toast.success("WordPress WXR export downloaded");
    } catch (err: any) {
      toast.error(err.message);
    }
    setExporting(null);
  };

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Export</h1>
      <p className="text-sm text-muted-foreground mb-6">Export your entire site — books, pages, categories, tags, media & settings. The WordPress XML can be imported directly into any WordPress site.</p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* WordPress WXR */}
        <ExportCard
          icon={Globe}
          title="WordPress (WXR/XML)"
          description="Full export compatible with WordPress Importer. Includes books as posts, pages, categories, tags, media attachments, and custom fields."
          buttonLabel="Export WXR"
          loading={exporting === "wxr"}
          onClick={exportWXR}
          recommended
        />

        {/* JSON */}
        <ExportCard
          icon={FileJson}
          title="JSON"
          description="Complete site data in JSON format. Includes all books, pages, categories, tags, media, and settings. Ideal for re-importing into Librora."
          buttonLabel="Export JSON"
          loading={exporting === "json"}
          onClick={exportJSON}
        />

        {/* CSV */}
        <ExportCard
          icon={Table2}
          title="CSV (Books only)"
          description="Spreadsheet-friendly export of all books with title, author, category, tags, URLs, and metadata. Open in Excel or Google Sheets."
          buttonLabel="Export CSV"
          loading={exporting === "csv"}
          onClick={exportCSV}
        />
      </div>

      {/* What's included */}
      <div className="mt-8 rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading font-bold text-foreground mb-3">What's included in each export</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Content</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">WXR/XML</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">JSON</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">CSV</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Books (posts)", true, true, true],
                ["Categories", true, true, false],
                ["Tags", true, true, false],
                ["Pages", true, true, false],
                ["Media attachments", true, true, false],
                ["Site settings", false, true, false],
                ["Custom fields (FAQ, lessons)", true, true, false],
                ["WordPress compatible", true, false, false],
              ].map(([label, wxr, json, csv], i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-foreground">{label as string}</td>
                  <td className="px-3 py-2 text-center">{wxr ? "✓" : "—"}</td>
                  <td className="px-3 py-2 text-center">{json ? "✓" : "—"}</td>
                  <td className="px-3 py-2 text-center">{csv ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const ExportCard = ({
  icon: Icon, title, description, buttonLabel, loading, onClick, recommended,
}: {
  icon: React.ElementType; title: string; description: string; buttonLabel: string;
  loading: boolean; onClick: () => void; recommended?: boolean;
}) => (
  <div className={`rounded-lg border bg-card p-6 flex flex-col ${recommended ? "border-primary ring-1 ring-primary/20" : "border-border"}`}>
    {recommended && (
      <span className="text-xs font-medium text-primary mb-2">★ Recommended</span>
    )}
    <Icon className="h-8 w-8 text-primary mb-3" />
    <h3 className="font-heading font-bold text-foreground mb-1">{title}</h3>
    <p className="text-xs text-muted-foreground mb-4 flex-1">{description}</p>
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 w-full"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? "Exporting..." : buttonLabel}
    </button>
  </div>
);

// Helpers
const escXml = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const csvEscape = (s: string) => {
  const str = String(s);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const buildPostContent = (p: any): string => {
  let content = "";
  if (p.summary) content += `<p>${p.summary}</p>\n\n`;
  if (p.key_lessons?.length) {
    content += `<h2>Key Lessons</h2>\n<ul>\n`;
    p.key_lessons.forEach((l: string) => { content += `<li>${l}</li>\n`; });
    content += `</ul>\n\n`;
  }
  if (p.faq && Array.isArray(p.faq) && p.faq.length) {
    content += `<h2>FAQ</h2>\n`;
    p.faq.forEach((f: any) => {
      content += `<h3>${f.question || ""}</h3>\n<p>${f.answer || ""}</p>\n`;
    });
  }
  return content;
};

export default ToolsExport;
