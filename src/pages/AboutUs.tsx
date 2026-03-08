import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Target, Heart, Users } from "lucide-react";
import { usePageBySlug } from "@/hooks/usePageContent";
import DOMPurify from "dompurify";

const defaultContent = {
  hero: { title: "About Librora", description: "We believe knowledge should be accessible to everyone. Librora curates the world's best book summaries so you can learn faster and read smarter." },
  cards: [
    { title: "Our Mission", text: "To distill the wisdom of great books into concise, actionable summaries that empower people to grow personally and professionally." },
    { title: "Our Vision", text: "A world where everyone has access to the key insights from the most impactful books, regardless of time or resources." },
    { title: "Our Values", text: "Quality over quantity. We carefully select and summarize each book to ensure every summary delivers real value to our readers." },
  ],
  team: { title: "Our Team", description: "Librora is built by a passionate team of readers, writers, and tech enthusiasts who share a love for learning and personal development." },
};

const cardIcons = [Target, BookOpen, Heart];

function parseAboutContent(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const heroSection = doc.querySelector("section.hero");
    const hero = {
      title: heroSection?.querySelector("h1")?.textContent || defaultContent.hero.title,
      description: heroSection?.querySelector("p")?.textContent || defaultContent.hero.description,
    };

    const cardElements = doc.querySelectorAll("section.cards .card");
    const cards = cardElements.length > 0
      ? Array.from(cardElements).map((card, i) => ({
          title: card.querySelector("h3")?.textContent || defaultContent.cards[i]?.title || "",
          text: card.querySelector("p")?.textContent || defaultContent.cards[i]?.text || "",
        }))
      : defaultContent.cards;

    const teamSection = doc.querySelector("section.team");
    const team = {
      title: teamSection?.querySelector("h2")?.textContent || defaultContent.team.title,
      description: teamSection?.querySelector("p")?.textContent || defaultContent.team.description,
    };

    return { hero, cards, team };
  } catch {
    return defaultContent;
  }
}

const AboutUs = () => {
  const { data: page, isLoading } = usePageBySlug("about");
  const content = page?.content ? parseAboutContent(page.content) : defaultContent;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary/5 py-16 md:py-24">
          <div className="container max-w-4xl text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              {content.hero.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.hero.description}
            </p>
          </div>
        </section>

        {/* Mission / Vision / Values */}
        <section className="container max-w-5xl py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.cards.map((card, i) => {
              const Icon = cardIcons[i] || Target;
              return (
                <div key={i} className="rounded-xl border border-border bg-card p-8 text-center">
                  <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-muted/30 py-16">
          <div className="container max-w-4xl text-center">
            <Users className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{content.team.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{content.team.description}</p>
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
};

export default AboutUs;
