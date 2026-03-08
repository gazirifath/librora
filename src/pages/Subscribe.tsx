import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Gift, Newspaper, Sparkles, CheckCircle, ArrowRight, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const benefits = [
  { icon: BookOpen, title: "Premium PDF Books", desc: "Curated book PDFs delivered straight to your inbox every week." },
  { icon: Gift, title: "Exclusive Offers", desc: "Get early access to deals on the best books before anyone else." },
  { icon: Newspaper, title: "Summaries & News", desc: "Stay updated with concise book summaries and industry news." },
  { icon: Sparkles, title: "New Releases", desc: "Be the first to know about newly released and upcoming books." },
];

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email });
      if (error) {
        if (error.code === "23505") toast.info("You're already subscribed!");
        else throw error;
      } else {
        toast.success("You're in! Welcome to the Librora weekly list 📚");
      }
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero with subscribe form */}
        <section className="bg-primary/5 py-16 md:py-24">
          <div className="container max-w-3xl text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Subscribe to Our Newsletter
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of book lovers who receive weekly PDF books, exclusive offers, summaries, and the latest book news — completely free.
            </p>

            {/* Big subscribe form */}
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full rounded-xl border border-border bg-background px-5 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl gradient-hero px-8 py-5 text-lg font-bold text-primary-foreground shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-3 disabled:opacity-60"
              >
                <Mail className="h-5 w-5" />
                {loading ? "Subscribing..." : "Subscribe Now — It's Free"}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
              <p className="text-xs text-muted-foreground">No spam, ever. Unsubscribe anytime with one click.</p>
            </form>
          </div>
        </section>

        {/* What you get */}
        <section className="container max-w-5xl py-16">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-10">
            What You'll Get Every Week
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-border bg-card p-6">
                <div className="shrink-0 mt-0.5">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why subscribe */}
        <section className="bg-muted/30 py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              Why Readers Love Librora
            </h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              {[
                "100% free — no credit card required",
                "Hand-picked books by our editorial team",
                "Unsubscribe anytime with one click",
                "No spam, ever — we respect your inbox",
                "New content delivered every single week",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Subscribe;