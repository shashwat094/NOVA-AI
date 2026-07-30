import { Mail, MessageCircle, AtSign } from "lucide-react";
import { CONTACT } from "../lib/content.js";

const CAPABILITIES = [
  "Wide-ranging conversations — not limited to site FAQs",
  "Debugging and reviewing code across common web stacks",
  "Explaining technical and non-technical concepts clearly",
  "Answering questions about Shashwat's projects on request",
];

export default function AboutView() {
  return (
    <div className="view-inner">
      <div className="page-head">
        <h1>About</h1>
        <p>Who built Nova, and what it's for.</p>
      </div>

      <div className="card">
        <div className="profile">
          <div className="avatar">
            <img
              src="img.jpeg"
              alt="Shashwat Pandey"
            />
          </div>

          <div>
            <h3>Shashwat Pandey</h3>
            <div className="role">Developer · Satna, MP</div>

            <span className="pill">
              <span className="dot" />
              Open to internships
            </span>
          </div>
        </div>

        <p>
          Developer and BCA graduate from Sadguru Institute of Computer Studies,
          affiliated with Makhanlal Chaturvedi National University, Bhopal
          (2023–2026).
        </p>

        <p>
          Currently open to software and web development internship opportunities.
        </p>

        <div className="tags">
          {["PHP", "MySQL", "React", "React Native", "Node.js", "Firebase"].map(
            (tech) => (
              <span className="tag" key={tech}>
                {tech}
              </span>
            )
          )}
        </div>

        <div className="links">
          <a
            className="link-item"
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <AtSign size={14} />
            Instagram
          </a>

          <a
            className="link-item"
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>

          <a
            className="link-item"
            href={`mailto:${CONTACT.email}`}
          >
            <Mail size={14} />
            {CONTACT.email}
          </a>
        </div>
      </div>

      <div className="card">
        <h2>About Nova</h2>

        <p>
          Nova is a general-purpose AI assistant that happens to live on this
          site — not a narrow FAQ bot. Ask about code, ideas, trivia, advice,
          or whatever's on your mind. It also knows Shashwat's work in detail
          whenever that's what you want.
        </p>

        <div className="bullets">
          {CAPABILITIES.map((capability) => (
            <div className="bullet" key={capability}>
              {capability}
            </div>
          ))}
        </div>
      </div>

      <div className="foot-note">
        © {new Date().getFullYear()} Shashwat Pandey
      </div>
    </div>
  );
}
