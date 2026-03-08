import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Target, Heart, Users } from "lucide-react";

const AboutUs = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container max-w-4xl text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">About Librora</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe knowledge should be accessible to everyone. Librora curates the world's best book summaries so you can learn faster and read smarter.
          </p>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="container max-w-5xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Target className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Our Mission</h3>
            <p className="text-sm text-muted-foreground">
              To distill the wisdom of great books into concise, actionable summaries that empower people to grow personally and professionally.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Our Vision</h3>
            <p className="text-sm text-muted-foreground">
              A world where everyone has access to the key insights from the most impactful books, regardless of time or resources.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Our Values</h3>
            <p className="text-sm text-muted-foreground">
              Quality over quantity. We carefully select and summarize each book to ensure every summary delivers real value to our readers.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 py-16">
        <div className="container max-w-4xl text-center">
          <Users className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Librora is built by a passionate team of readers, writers, and tech enthusiasts who share a love for learning and personal development.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: "Editorial Team", desc: "Curating and summarizing the best books across all categories." },
              { name: "Design Team", desc: "Creating a beautiful, intuitive reading experience for you." },
              { name: "Tech Team", desc: "Building and maintaining the platform you love using." },
            ].map((member) => (
              <div key={member.name} className="rounded-lg border border-border bg-card p-6">
                <h4 className="font-heading font-semibold text-foreground mb-1">{member.name}</h4>
                <p className="text-xs text-muted-foreground">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default AboutUs;
