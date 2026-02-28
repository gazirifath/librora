export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  summary: string;
  keyLessons: string[];
  faq: { question: string; answer: string }[];
  affiliateUrl: string;
  downloadCount: number;
  dateAdded: string;
  readingTime: string;
}

export interface CollectedEmail {
  id: string;
  email: string;
  bookSlug: string;
  bookTitle: string;
  category: string;
  date: string;
}

export const categories = [
  "Self-Help",
  "Business",
  "Psychology",
  "Productivity",
  "Finance",
  "Leadership",
  "Health",
  "Philosophy",
];

export const books: Book[] = [
  {
    id: "1",
    slug: "atomic-habits-summary",
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl: "",
    category: "Self-Help",
    summary: `Atomic Habits by James Clear is a comprehensive guide to building good habits and breaking bad ones. The book introduces a practical framework for improving every day by focusing on small, incremental changes that compound over time into remarkable results.

Clear argues that habits are the compound interest of self-improvement. Getting 1% better every day counts for a lot in the long run. The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.

The book presents the Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying. These four simple rules serve as a framework you can use to build better habits and break bad ones.

The first law, "Make it Obvious," suggests using implementation intentions and habit stacking to make your habits more visible. The second law, "Make it Attractive," involves using temptation bundling and joining a culture where your desired behavior is normal.

The third law, "Make it Easy," emphasizes reducing friction for good habits and increasing friction for bad ones. The two-minute rule suggests that when starting a new habit, it should take less than two minutes to do. The fourth law, "Make it Satisfying," uses immediate rewards to reinforce good behavior.

Clear also discusses the importance of environment design in shaping behavior. By redesigning your environment, you can make the cues of good habits more obvious and the cues of bad habits invisible. He emphasizes that motivation is overrated and that environment often matters more.

The book explains the concept of habit tracking and how it can provide visual proof of your progress. Never miss twice is one of the key principles — if you miss one day, try to get back on track as quickly as possible.

One of the most powerful ideas in the book is identity-based habits. Instead of focusing on goals, focus on changing your identity. Every action you take is a vote for the type of person you wish to become. The most practical way to change who you are is to change what you do.

Clear provides numerous real-world examples from athletes, artists, physicians, comedians, and scientists who have used the science of small habits to remain productive. The book has sold over 15 million copies worldwide and has been translated into more than 50 languages.

The key takeaway is that remarkable results don't require dramatic action. They require consistent effort and the patience to trust the process. Success is the product of daily habits, not once-in-a-lifetime transformations.`,
    keyLessons: [
      "Habits are the compound interest of self-improvement",
      "Focus on systems, not goals",
      "The Four Laws: Make it Obvious, Attractive, Easy, Satisfying",
      "Environment design is more powerful than motivation",
      "Never miss a habit twice in a row",
      "Identity-based habits create lasting change",
    ],
    faq: [
      { question: "How long does it take to build a habit?", answer: "Research suggests it takes an average of 66 days for a new behavior to become automatic, though it can range from 18 to 254 days depending on the complexity of the habit." },
      { question: "What is the 1% rule?", answer: "The 1% rule suggests that getting just 1% better each day leads to being 37 times better over a year through the power of compounding." },
      { question: "What are the Four Laws of Behavior Change?", answer: "Make it Obvious, Make it Attractive, Make it Easy, and Make it Satisfying — a framework for building good habits and breaking bad ones." },
    ],
    affiliateUrl: "https://amazon.com/dp/0735211299?tag=librora-20",
    downloadCount: 12453,
    dateAdded: "2024-01-15",
    readingTime: "8 min read",
  },
  {
    id: "2",
    slug: "deep-work-summary",
    title: "Deep Work",
    author: "Cal Newport",
    coverUrl: "",
    category: "Productivity",
    summary: `Deep Work by Cal Newport explores the ability to focus without distraction on cognitively demanding tasks. Newport argues that deep work is becoming increasingly rare and increasingly valuable in our economy, making it a superpower for those who cultivate it.

Newport defines deep work as professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit. These efforts create new value, improve your skill, and are hard to replicate. In contrast, shallow work consists of non-cognitively demanding logistical tasks that are often performed while distracted.

The book presents two core abilities for thriving in the new economy: the ability to quickly master hard things, and the ability to produce at an elite level in terms of both quality and speed. Both of these abilities depend on your capacity to perform deep work.

Newport outlines four rules for cultivating deep work. Rule 1 is to work deeply by choosing a philosophy that fits your life. Rule 2 is to embrace boredom rather than constantly seeking stimulation. Rule 3 is to quit social media or at least be highly selective about your digital tools. Rule 4 is to drain the shallows by ruthlessly reducing shallow obligations.

The book discusses various deep work philosophies: the monastic approach (eliminating all distractions), the bimodal approach (dedicating specific periods to deep work), the rhythmic approach (making deep work a daily habit), and the journalistic approach (fitting deep work wherever you can).

Newport provides practical strategies including scheduling every minute of your day, using productive meditation during physical activities, and practicing deliberate focus. He emphasizes the importance of having a shutdown ritual at the end of each workday.

The key insight is that in an age of distraction, the ability to concentrate is becoming a competitive advantage. Those who can master the art of deep work will thrive, while those who can't will struggle to keep up.`,
    keyLessons: [
      "Deep work is rare and valuable in the modern economy",
      "Choose a deep work philosophy that fits your life",
      "Embrace boredom to strengthen your focus muscle",
      "Be selective about digital tools and social media",
      "Schedule every minute of your workday",
      "Implement a shutdown ritual for daily closure",
    ],
    faq: [
      { question: "What is deep work?", answer: "Deep work is professional activity performed in a state of distraction-free concentration that pushes your cognitive capabilities to their limit." },
      { question: "What are the four rules of deep work?", answer: "Work Deeply, Embrace Boredom, Quit Social Media, and Drain the Shallows." },
    ],
    affiliateUrl: "https://amazon.com/dp/1455586692?tag=librora-20",
    downloadCount: 8932,
    dateAdded: "2024-02-20",
    readingTime: "7 min read",
  },
  {
    id: "3",
    slug: "thinking-fast-and-slow-summary",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverUrl: "",
    category: "Psychology",
    summary: `Thinking, Fast and Slow by Daniel Kahneman presents a groundbreaking exploration of the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.

Kahneman, a Nobel Prize winner in Economics, reveals where we can and cannot trust our intuitions and how we can tap into the benefits of slow thinking. The book explores cognitive biases, heuristics, and the many ways our thinking can go wrong.

The anchoring effect, availability heuristic, loss aversion, and the planning fallacy are just a few of the mental shortcuts and biases Kahneman explores. He shows how these cognitive patterns affect everything from playing the stock market to planning our next vacation.

One key concept is the distinction between the experiencing self and the remembering self. Our memories of experiences are shaped by peaks and endings rather than the duration of the experience, which Kahneman calls the "peak-end rule."

The book provides deep insights into decision-making, showing how framing effects can change our choices and how overconfidence leads to poor decisions in business and personal life.`,
    keyLessons: [
      "System 1 (fast) and System 2 (slow) drive all thinking",
      "Cognitive biases affect every decision we make",
      "Loss aversion makes losses feel twice as painful as gains",
      "The experiencing self differs from the remembering self",
      "Anchoring effects influence our judgments significantly",
      "Overconfidence is one of the most damaging biases",
    ],
    faq: [
      { question: "What are System 1 and System 2?", answer: "System 1 operates automatically and quickly with little effort. System 2 allocates attention to effortful mental activities." },
      { question: "What is loss aversion?", answer: "Loss aversion is the tendency to prefer avoiding losses over acquiring equivalent gains — losses feel about twice as painful as gains feel good." },
    ],
    affiliateUrl: "https://amazon.com/dp/0374533555?tag=librora-20",
    downloadCount: 10234,
    dateAdded: "2024-03-10",
    readingTime: "9 min read",
  },
  {
    id: "4",
    slug: "rich-dad-poor-dad-summary",
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    coverUrl: "",
    category: "Finance",
    summary: `Rich Dad Poor Dad by Robert Kiyosaki tells the story of growing up with two father figures — his biological father (poor dad) who was highly educated but financially struggling, and his best friend's father (rich dad) who was a self-made millionaire.

The book challenges the conventional wisdom about money — that a high-paying job equals financial success. Kiyosaki argues that financial education is more important than formal education and that the rich don't work for money — they make money work for them.

Key concepts include the difference between assets and liabilities, the importance of financial literacy, and building passive income streams. Kiyosaki emphasizes that your house is not an asset but a liability, and that true wealth comes from investments that generate income.

The book advocates for entrepreneurship and investing over traditional employment, encouraging readers to overcome fear, develop financial intelligence, and take calculated risks to achieve financial independence.`,
    keyLessons: [
      "The rich don't work for money — money works for them",
      "Know the difference between assets and liabilities",
      "Financial education is more important than formal education",
      "Your house is a liability, not an asset",
      "Build passive income streams for financial freedom",
      "Overcome fear and take calculated financial risks",
    ],
    faq: [
      { question: "What is the main lesson of Rich Dad Poor Dad?", answer: "The main lesson is that financial literacy and making money work for you through investments and assets is more important than earning a high salary." },
    ],
    affiliateUrl: "https://amazon.com/dp/1612680194?tag=librora-20",
    downloadCount: 15678,
    dateAdded: "2024-01-05",
    readingTime: "7 min read",
  },
  {
    id: "5",
    slug: "the-psychology-of-money-summary",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    coverUrl: "",
    category: "Finance",
    summary: `The Psychology of Money by Morgan Housel explores the strange ways people think about money and teaches you how to make better sense of one of life's most important topics. Through 19 short stories, Housel explores the ways in which people think about money.

The book argues that doing well with money has little to do with how smart you are and a lot to do with how you behave. Financial success is not a hard science — it's a soft skill where how you behave matters more than what you know.

Key themes include the power of compounding, the importance of room for error in financial planning, the difference between getting wealthy and staying wealthy, and why reasonable financial decisions often trump rational ones. Housel uses fascinating real-world examples to illustrate how luck and risk are so similar that they're often impossible to distinguish.`,
    keyLessons: [
      "Financial success is about behavior, not intelligence",
      "Compounding is the most powerful force in finance",
      "Getting wealthy and staying wealthy require different skills",
      "Always leave room for error in your financial plans",
      "Reasonable beats rational in financial decisions",
      "Luck and risk are two sides of the same coin",
    ],
    faq: [
      { question: "What makes this book different from other finance books?", answer: "It focuses on the psychological and behavioral aspects of money rather than technical strategies, making it accessible to everyone regardless of financial background." },
    ],
    affiliateUrl: "https://amazon.com/dp/0857197681?tag=librora-20",
    downloadCount: 11234,
    dateAdded: "2024-02-01",
    readingTime: "6 min read",
  },
  {
    id: "6",
    slug: "the-7-habits-summary",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    coverUrl: "",
    category: "Leadership",
    summary: `The 7 Habits of Highly Effective People by Stephen R. Covey is one of the most influential self-help books ever written. It presents a principle-centered approach for solving personal and professional problems through developing character rather than personality.

The seven habits are organized in a maturity continuum from dependence to independence to interdependence. The first three habits focus on self-mastery: Be Proactive, Begin with the End in Mind, and Put First Things First. Habits 4-6 focus on interdependence: Think Win-Win, Seek First to Understand Then to Be Understood, and Synergize. Habit 7 is Sharpen the Saw — continuous self-renewal.

Covey emphasizes that true effectiveness comes from aligning your actions with timeless principles like fairness, integrity, and human dignity. The book has sold over 40 million copies worldwide and remains essential reading for anyone seeking personal and professional growth.`,
    keyLessons: [
      "Be proactive — take responsibility for your life",
      "Begin with the end in mind — define your mission",
      "Put first things first — prioritize what matters most",
      "Think win-win in all interactions",
      "Seek first to understand, then to be understood",
      "Continuously sharpen the saw through self-renewal",
    ],
    faq: [
      { question: "What is the maturity continuum?", answer: "It's the progression from dependence (you take care of me) to independence (I take care of myself) to interdependence (we can do something greater together)." },
    ],
    affiliateUrl: "https://amazon.com/dp/1982137274?tag=librora-20",
    downloadCount: 9876,
    dateAdded: "2024-03-01",
    readingTime: "8 min read",
  },
];

// In-memory email store (would be database in production)
let collectedEmails: CollectedEmail[] = [
  { id: "1", email: "reader1@example.com", bookSlug: "atomic-habits-summary", bookTitle: "Atomic Habits", category: "Self-Help", date: "2024-12-01" },
  { id: "2", email: "reader2@example.com", bookSlug: "deep-work-summary", bookTitle: "Deep Work", category: "Productivity", date: "2024-12-02" },
  { id: "3", email: "learner@example.com", bookSlug: "atomic-habits-summary", bookTitle: "Atomic Habits", category: "Self-Help", date: "2024-12-03" },
  { id: "4", email: "bookworm@example.com", bookSlug: "rich-dad-poor-dad-summary", bookTitle: "Rich Dad Poor Dad", category: "Finance", date: "2024-12-04" },
  { id: "5", email: "student@example.com", bookSlug: "the-psychology-of-money-summary", bookTitle: "The Psychology of Money", category: "Finance", date: "2024-12-05" },
  { id: "6", email: "growth@example.com", bookSlug: "the-7-habits-summary", bookTitle: "The 7 Habits", category: "Leadership", date: "2024-12-06" },
  { id: "7", email: "focused@example.com", bookSlug: "deep-work-summary", bookTitle: "Deep Work", category: "Productivity", date: "2024-12-07" },
  { id: "8", email: "mindful@example.com", bookSlug: "thinking-fast-and-slow-summary", bookTitle: "Thinking, Fast and Slow", category: "Psychology", date: "2024-12-08" },
  { id: "9", email: "achiever@example.com", bookSlug: "atomic-habits-summary", bookTitle: "Atomic Habits", category: "Self-Help", date: "2024-12-09" },
  { id: "10", email: "ceo@example.com", bookSlug: "the-7-habits-summary", bookTitle: "The 7 Habits", category: "Leadership", date: "2024-12-10" },
  { id: "11", email: "today1@example.com", bookSlug: "atomic-habits-summary", bookTitle: "Atomic Habits", category: "Self-Help", date: new Date().toISOString().split('T')[0] },
  { id: "12", email: "today2@example.com", bookSlug: "deep-work-summary", bookTitle: "Deep Work", category: "Productivity", date: new Date().toISOString().split('T')[0] },
];

export function getEmails(): CollectedEmail[] {
  return collectedEmails;
}

export function addEmail(email: string, bookSlug: string): boolean {
  const book = books.find(b => b.slug === bookSlug);
  if (!book) return false;
  
  // Check duplicate
  if (collectedEmails.some(e => e.email === email && e.bookSlug === bookSlug)) return false;
  
  const newEmail: CollectedEmail = {
    id: String(collectedEmails.length + 1),
    email,
    bookSlug,
    bookTitle: book.title,
    category: book.category,
    date: new Date().toISOString().split('T')[0],
  };
  
  collectedEmails = [...collectedEmails, newEmail];
  
  // Increment download counter
  book.downloadCount += 1;
  
  return true;
}

export function exportEmailsCSV(emails: CollectedEmail[]): string {
  const header = "Email,Book,Category,Date\n";
  const rows = emails.map(e => `${e.email},${e.bookTitle},${e.category},${e.date}`).join("\n");
  return header + rows;
}
