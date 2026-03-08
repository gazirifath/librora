import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("Subscribed! Welcome to Librora.");
    setEmail("");
  };

  return (
    <section className="py-16 gradient-hero">
      <div className="container text-center">
        <Mail className="h-8 w-8 text-primary-foreground mx-auto mb-4" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">
          Get Weekly PDF Books
        </h2>
        <p className="text-primary-foreground/75 mt-2 max-w-md mx-auto text-sm">
          Join thousands of readers. New PDF books delivered to your inbox every week.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
          />
          <button
            type="submit"
            className="rounded-lg gradient-gold px-6 py-3 text-sm font-semibold text-accent-foreground shadow-gold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Subscribe <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterCTA;
