import { Mail, Phone, MessageCircle } from "lucide-react";
import CopyButton from "./CopyButton.jsx";
import { CONTACT } from "../lib/content.js";

export default function ContactView() {
  return (
    <div className="view-inner">
      <div className="page-head">
        <h1>Contact</h1>
        <p>Ways to reach out.</p>
      </div>

      <div className="card">
        <h2>Hire / Collaborate</h2>
        <p>Open to internships and freelance web/app development work.</p>
        <div className="contact-row">
          <Mail size={14} /> {CONTACT.email}
          <CopyButton text={CONTACT.email} />
        </div>
        <div className="contact-row">
          <Phone size={14} /> {CONTACT.phone}
          <CopyButton text={CONTACT.phoneRaw} />
        </div>
        <div className="links">
          <a className="link-item" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
            <MessageCircle size={14} /> Message on WhatsApp
          </a>
        </div>
      </div>

      <div className="foot-note">© {new Date().getFullYear()} Shashwat Pandey</div>
    </div>
  );
}