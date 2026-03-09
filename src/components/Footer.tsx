import { Link } from "react-router-dom";
import { Leaf, Facebook, Instagram, Linkedin } from "lucide-react";
import { useSettings } from "@/hooks/useAdminData";
import NewsletterCTA from "./NewsletterCTA";

const Footer = () => {
  const { data: settings } = useSettings();

  const socialLinks = [
    { key: "social_facebook", icon: Facebook, label: "Facebook" },
    { key: "social_instagram", icon: Instagram, label: "Instagram" },
    { key: "social_linkedin", icon: Linkedin, label: "LinkedIn" },
  ];

  return (
    <>
      <NewsletterCTA />
    <footer className="border-t border-border bg-card py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-lg font-heading font-bold">Librora</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              PDF book downloads that save you time. Access the world's best books and read offline.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ key, icon: Icon, label }) => {
                const url = settings?.[key];
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm">Browse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-foreground transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/affiliate-disclosure" className="hover:text-foreground transition-colors">Affiliate Disclosure</Link></li>
              <li><Link to="/dmca" className="hover:text-foreground transition-colors">DMCA</Link></li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-preferences"))}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Manage Cookies
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Librora. All rights reserved.
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
