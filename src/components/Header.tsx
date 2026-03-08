import { Link } from "react-router-dom";
import { Leaf, Facebook, Instagram, Linkedin } from "lucide-react";
import { useSettings } from "@/hooks/useAdminData";

const Header = () => {
  const { data: settings } = useSettings();

  const socialLinks = [
    { key: "social_facebook", icon: Facebook, label: "Facebook" },
    { key: "social_instagram", icon: Instagram, label: "Instagram" },
    { key: "social_linkedin", icon: Linkedin, label: "LinkedIn" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-xl font-heading font-bold text-foreground">Librora</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About Us
          </Link>
          <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </nav>
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
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
