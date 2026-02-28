import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 container py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-foreground/85 space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>At Librora, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Information We Collect</h2>
        <p>We collect your email address when you download a book summary. We also collect anonymous usage data through analytics tools to improve our service.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">How We Use Your Information</h2>
        <p>Your email is used to deliver the requested book summary and, if you opt in, to send weekly newsletter updates. We never sell your personal data to third parties.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Cookies & Advertising</h2>
        <p>We use Google AdSense to display advertisements, which may use cookies to serve personalized ads. You can manage cookie preferences through your browser settings.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Contact</h2>
        <p>For privacy inquiries, contact us at privacy@librora.store.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
