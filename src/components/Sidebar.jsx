import {
  FolderGit2,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  UserCircle2,
  MailCheck,
} from "lucide-react";

const NAV = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "about", label: "About", icon: UserCircle2 },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function Sidebar({
  open,
  view,
  onSelectView,
  sessions,
  activeSessionId,
  onNewChat,
  onOpenSession,
  onDeleteSession,
  user,
  authLoading,
  menuOpen,
  onToggleMenu,
  onSignIn,
  onSignOut,
  onResendVerification,
}) {
  const initials = (user?.displayName || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark">N</div>
        <div>
          <div className="brand-name">Nova</div>
          <div className="brand-sub">AI assistant</div>
        </div>
      </div>

      <button className="ghost-btn" type="button" onClick={onNewChat}>
        <Plus size={15} /> New chat
      </button>

      <div className="sidebar-scroll">
        <nav className="nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => onSelectView(item.id)}
            >
              <item.icon size={15} /> {item.label}
            </button>
          ))}
        </nav>

        <div>
          <div className="sidebar-label">History</div>
          {!user && <div className="empty-note">Log in to save conversations.</div>}
          {user && sessions.length === 0 && (
            <div className="empty-note">No saved conversations yet.</div>
          )}
          <div className="history">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`history-row ${activeSessionId === s.id ? "active" : ""}`}
              >
                <button
                  className="history-open"
                  type="button"
                  onClick={() => onOpenSession(s)}
                  title={s.title}
                >
                  <MessageSquare size={13} />
                  <span className="history-title">{s.title || "New chat"}</span>
                </button>
                <button
                  className="history-delete"
                  type="button"
                  aria-label={`Delete ${s.title || "conversation"}`}
                  onClick={() => onDeleteSession(s.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        {authLoading ? (
          <div className="empty-note">Checking session…</div>
        ) : user ? (
          <div className="account">
            {menuOpen && (
              <div className="menu">
                {!user.emailVerified && user.email && (
                  <button className="menu-item" type="button" onClick={onResendVerification}>
                    <MailCheck size={14} /> Resend verification
                  </button>
                )}
                <button className="menu-item danger" type="button" onClick={onSignOut}>
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
            <button className="account-btn" type="button" onClick={onToggleMenu}>
              <div className="avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                ) : (
                  initials
                )}
              </div>
              <div className="account-meta">
                <div className="account-name">{user.displayName || "Signed in"}</div>
                <div className="account-sub">{user.email}</div>
              </div>
            </button>
          </div>
        ) : (
          <button className="ghost-btn" type="button" onClick={onSignIn}>
            <UserCircle2 size={15} /> Log in
          </button>
        )}
      </div>
    </aside>
  );
}