import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CookiePolicy = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 container py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Cookie Policy</h1>
      <div className="prose prose-sm text-foreground/85 space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>This Cookie Policy explains how Librora uses cookies and similar technologies when you visit our website.</p>

        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your browsing experience.</p>

        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">How We Use Cookies</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., authentication, security).</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site so we can improve it.</li>
          <li><strong>Advertising Cookies:</strong> Used by third-party services like Google AdSense to display relevant ads.</li>
        </ul>

        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Disabling certain cookies may affect website functionality.</p>

        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Third-Party Cookies</h2>
        <p>Some cookies are placed by third-party services that appear on our pages, including Google Analytics and Google AdSense. We do not control these cookies.</p>

        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Contact</h2>
        <p>For questions about our cookie policy, contact us at privacy@librora.store.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default CookiePolicy;
