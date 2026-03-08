import { useState } from "react";
import { X, Leaf, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailPopupProps {
  bookSlug: string;
  bookTitle: string;
  bookCategory?: string;
  postId?: string;
  downloadUrl?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmailPopup = ({ bookSlug, bookTitle, bookCategory, postId, downloadUrl, isOpen, onClose }: EmailPopupProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Save email to database
      await supabase.from("collected_emails").insert({
        email,
        post_id: postId || null,
        post_title: bookTitle,
        category: bookCategory || "",
      });

      // Log download
      await supabase.from("download_logs").insert({
        post_id: postId || null,
        post_title: bookTitle,
      });

      // Increment download count
      if (postId) {
        const { data: post } = await supabase.from("posts").select("download_count").eq("id", postId).maybeSingle();
        if (post) {
          await supabase.from("posts").update({ download_count: (post.download_count || 0) + 1 }).eq("id", postId);
        }
      }

      toast.success("Download link sent to your email!");
      setSuccess(true);

      // If there's a download URL, open it
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      }

      setTimeout(() => {
        setEmail("");
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md mx-4 rounded-xl border border-border bg-background p-8 shadow-book animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <Leaf className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-foreground">Check Your Email!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              The download link for "{bookTitle}" has been sent.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <Leaf className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-heading text-xl font-bold text-foreground">
                Download "{bookTitle}"
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email to get a free PDF download and access all books including new releases.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg gradient-gold py-3 text-sm font-semibold text-accent-foreground shadow-gold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? "Sending..." : "Get Free PDF"}
              </button>
            </form>
            <p className="text-[11px] text-muted-foreground text-center mt-4">
              We respect your privacy. No spam, unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailPopup;
