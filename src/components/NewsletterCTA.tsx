import { useState } from "react";
import { Mail, ArrowRight, BookOpen, Gift, Newspaper, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const features = [
  { icon: BookOpen, label: "Premium Book PDFs" },
  { icon: Gift, label: "Exclusive Offers" },
  { icon: Newspaper, label: "Book Summaries & News" },
  { icon: Sparkles, label: "Newly Released Books" },
];

const NewsletterCTA = () => {
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
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
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
    <section className="py-12 md:py-20 gradient-hero relative overflow-hidden">
      {/* Decorative background elements — hidden on small screens */}
      <div className="absolute inset-0 opacity-[0.04] hidden sm:block">
        <div className="absolute top-6 left-[10%] h-24 w-24 rounded-full border-2 border-primary-foreground" />
        <div className="absolute bottom-8 right-[15%] h-16 w-16 rounded-full border-2 border-primary-foreground" />
        <div className="absolute top-1/2 left-[5%] h-12 w-12 rotate-45 border-2 border-primary-foreground" />
      </div>

      <div className="container relative z-10 text-center px-5 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 px-3 py-1 sm:px-4 sm:py-1.5 mb-4 md:mb-5">
          <Mail className="h-4 w-4 text-primary-foreground/80" />
          <span className="text-xs font-medium tracking-wide uppercase text-primary-foreground/80">
            Free Weekly Newsletter
          </span>
        </div>

        <h2 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-primary-foreground leading-tight">
          Get Weekly PDF Books
        </h2>
        <p className="text-primary-foreground/70 mt-3 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          Join thousands of readers. Premium book PDFs, exclusive offers, summaries & the latest book news — delivered to your inbox every week.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {features.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/8 border border-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground/75"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>

        {/* Subscribe form */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 transition-shadow"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg gradient-gold px-6 py-3 text-sm font-semibold text-accent-foreground shadow-gold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Subscribing..." : (
              <>Subscribe Free <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-primary-foreground/45">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default NewsletterCTA;
