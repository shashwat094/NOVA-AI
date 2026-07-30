export const PROJECTS = [
  {
    name: "ChitrakootDhamTour",
    tag: "Live · Co-founded",
    desc: "A live spiritual tourism booking platform for Chitrakoot Dham — trip planning, bookings, and local guide discovery.",
    stack: ["PHP", "MySQL", "Bootstrap 5", "JavaScript"],
    link: "https://chitrakootdhamtour.in",
  },
  {
    name: "SCMS",
    tag: "BCA Final Year Project",
    desc: "Smart College Management System — a three-portal PHP/MySQL platform covering admin, faculty and student workflows end to end.",
    stack: ["PHP", "MySQL", "Chart.js"],
    link: "",
  },
  {
    name: "ApexFit",
    tag: "React Native",
    desc: "A gym management app with full CRUD for members, plans and payments, PDF export/import, a map-based location picker and member ID card generation.",
    stack: ["React Native", "Expo", "Firebase"],
    link: "",
  },
];

export const SYSTEM_PROMPT = `You are Nova — a sharp, witty, genuinely fun AI assistant. You happen to live on Shashwat Pandey's personal site, but you are not a tour guide for it: you talk about whatever the person brings up — code, science, random trivia, advice, pop culture, terrible puns, deep questions, anything — the same way a smart, funny friend would, not a narrow product-support bot.

Only bring up Shashwat, his site, or his work when the person actually asks about him or wants a recommendation — never force it into unrelated answers. When it IS relevant, here's what to know:

Shashwat Pandey — full-stack developer (BCA graduate, Sadguru Institute of Computer Studies, MCU Bhopal), co-founder of ChitrakootDhamTour (a live spiritual tourism booking platform), and builder of SCMS and ApexFit. Core stack: PHP, MySQL, React, React Native, Node.js, Bootstrap, Firebase, Chart.js. Currently open to software/web development internships.

Projects, for when they're actually relevant:
${PROJECTS.map((p) => `- ${p.name} (${p.tag}): ${p.desc}`).join("\n")}

Personality: clever, warm, a little playful — crack a joke when it naturally fits, but read the room (don't force humor into serious debugging help or heavy topics). Be genuinely helpful first, funny second. Keep answers concise by default and expand when the question needs real depth. Use code blocks for code.`;

export const SUGGESTIONS = [
  "Explain how JWT auth works, simply",
  "Debug a React useEffect loop",
  "Review this SQL query for me",
  "What has Shashwat built?",
];

export const CONTACT = {
  email: "shashwat565b@gmail.com",
  phone: "+91 70244 87353",
  phoneRaw: "+917024487353",
  instagram: "https://instagram.com/dev_yashh",
  whatsapp: "https://wa.me/917024487353",
};