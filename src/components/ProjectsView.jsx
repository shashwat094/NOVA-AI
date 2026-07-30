import { ExternalLink } from "lucide-react";
import { PROJECTS } from "../lib/content.js";

export default function ProjectsView() {
  return (
    <div className="view-inner">
      <div className="page-head">
        <h1>Projects</h1>
        <p>A selection of recent work.</p>
      </div>

      <div className="project-list">
        {PROJECTS.map((p, i) => (
          <article className="project" key={p.name} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="project-top">
              <h3>{p.name}</h3>
              <span className="project-tag">{p.tag}</span>
            </div>
            <p>{p.desc}</p>
            <div className="tags">
              {p.stack.map((s) => (
                <span className="tag" key={s}>
                  {s}
                </span>
              ))}
            </div>
            {p.link && (
              <a className="project-link" href={p.link} target="_blank" rel="noreferrer">
                Visit site <ExternalLink size={12} />
              </a>
            )}
          </article>
        ))}
      </div>

      <div className="foot-note">© {new Date().getFullYear()} Shashwat Pandey</div>
    </div>
  );
}