import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-lg font-heading font-bold">Librora</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              High-quality book summaries that save you time. Read the key ideas from the world's best books in minutes.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm">Browse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-foreground transition-colors">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/affiliate-disclosure" className="hover:text-foreground transition-colors">Affiliate Disclosure</Link></li>
              <li><Link to="/dmca" className="hover:text-foreground transition-colors">DMCA</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Librora. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
