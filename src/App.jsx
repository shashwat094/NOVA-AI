import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Send, Bot, User, Zap, Terminal, Github, 
  Volume2, VolumeX, Sparkles, Code, Layout, 
  Cpu, Activity, Shield, Image as ImageIcon,
  Command, Copy, Check, Trash2, ExternalLink
} from 'lucide-react';

// --- NEURAL ENGINE: BACKGROUND ANIMATION ---
const NeuralEngine = ({ active }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    
    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * (active ? 4 : 0.8);
        this.vy = (Math.random() - 0.5) * (active ? 4 : 0.8);
        this.size = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = active ? 'rgba(0, 242, 255, 0.4)' : 'rgba(0, 242, 255, 0.1)';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    const init = () => { particles = Array.from({ length: 85 }, () => new Particle()); };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.update(); p.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.strokeStyle = active ? `rgba(0, 242, 255, ${0.2 - dist/150})` : `rgba(0, 242, 255, ${0.05 - dist/150})`;
            ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    };
    resize(); init(); animate();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [active]);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

// --- MAIN APPLICATION ---
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [mode, setMode] = useState('chat'); // 'chat' or 'image'
  const [muted, setMuted] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  // Audio Haptics (Web Audio API)
  const playBlip = (freq) => {
    if (muted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) { /* Audio blocked by browser */ }
  };

  useEffect(() => { 
    setTimeout(() => { setIsBooting(false); playBlip(880); }, 2500); 
  }, []);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    playBlip(600);
    const userMsg = { role: 'user', content: input, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'chat' ? '/api/chat' : '/api/image';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'chat' ? { messages: [...messages, userMsg] } : { prompt: input })
      });
      
      const data = await response.json();
      
      if (mode === 'chat') {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text, type: 'text' }]);
      } else {
        // Image logic
        const imgMarkdown = `![Generated Image](data:${data.mimeType};base64,${data.image})\n\n*${data.caption}*`;
        setMessages(prev => [...prev, { role: 'assistant', content: imgMarkdown, type: 'image', rawImage: `data:${data.mimeType};base64,${data.image}` }]);
      }
      playBlip(Mode === 'chat' ? 440 : 520);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "!! ERROR: NEURAL_LINK_BROKEN !! Check API Configuration.", type: 'text' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isBooting) {
    return (
      <div className="boot-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="boot-content">
          <div className="glitch-text" data-text="NOVA_SYSTEMS">NOVA_SYSTEMS</div>
          <div className="boot-loader"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="boot-progress" /></div>
          <div className="boot-logs">
            <p>> KERNEL_INIT: OK</p>
            <p>> NEURAL_CANVAS: READY</p>
            <p>> SHASHWAT_CONTEXT: LOADED</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="nova-os">
      <NeuralEngine active={isLoading} />
      
      {/* SIDEBAR */}
      <aside className="os-sidebar">
        <div className="brand">
          <div className="brand-orb"></div>
          <h1>NOVA <span className="version">v2.5</span></h1>
        </div>

        <nav className="nav-group">
          <label>INTERFACE</label>
          <button className={mode === 'chat' ? 'active' : ''} onClick={() => setMode('chat')}>
            <Terminal size={18} /> Neural Chat
          </button>
          <button className={mode === 'image' ? 'active' : ''} onClick={() => setMode('image')}>
            <ImageIcon size={18} /> Neuro-Forge
          </button>
        </nav>

        <div className="system-stats">
          <label>SYSTEM STATUS</label>
          <div className="stat-row">
            <span>CORE_TEMP</span>
            <div className="bar"><div className="fill" style={{ width: '40%' }}></div></div>
          </div>
          <div className="stat-row">
            <span>NEURAL_LOAD</span>
            <div className="bar"><div className="fill" style={{ width: isLoading ? '90%' : '15%', transition: '1s' }}></div></div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button onClick={() => setMuted(!muted)} className="icon-btn">
            {muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
          </button>
          <button onClick={() => setMessages([])} className="icon-btn"><Trash2 size={18}/></button>
          <button onClick={() => window.open('https://github.com/shashwat094')} className="icon-btn"><Github size={18}/></button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="os-main">
        <header className="os-header">
          <div className="header-left">
            <Activity size={16} className="pulse" />
            <span>SESSION_ACTIVE // {mode.toUpperCase()}_MODE</span>
          </div>
          <div className="header-right">
            <Shield size={16} /> <span>ENCRYPTED_LINK</span>
          </div>
        </header>

        <div className="chat-viewport">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="welcome">
                <div className="hero-icon"><Zap size={40} fill="#00f2ff" /></div>
                <h2>How can I assist your code today?</h2>
                <p>I am the specialized agent for Shashwat Pandey's ecosystem. I can debug your React hooks, explain projects like ChitrakootDhamTour, or generate cinematic imagery.</p>
                <div className="quick-actions">
                  <button onClick={() => { setInput("Tell me about Shashwat's work"); handleSend(); }}>Who is Shashwat?</button>
                  <button onClick={() => { setInput("Generate a cyberpunk city skyline"); setMode('image'); }}>Try Neuro-Forge</button>
                </div>
              </motion.div>
            ) : (
              messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={i} 
                  className={`message-row ${m.role}`}
                >
                  <div className="msg-avatar">
                    {m.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className="msg-content">
                    <div className="msg-bubble">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    <div className="msg-actions">
                      <span className="timestamp">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <button onClick={() => copyText(m.content, i)}>
                        {copiedIndex === i ? <Check size={12}/> : <Copy size={12}/>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message-row assistant">
                <div className="msg-avatar"><Bot size={18} /></div>
                <div className="loading-shimmer">SYNTHESIZING_RESPONSE...</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <footer className="os-input-area">
          <div className="input-wrapper">
            <Command size={18} className="cmd-icon" />
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={mode === 'chat' ? "Execute command..." : "Describe image to forge..."}
            />
            <button className="send-btn" onClick={handleSend} disabled={isLoading}>
              {isLoading ? <div className="spinner"></div> : <Send size={18} />}
            </button>
          </div>
        </footer>
      </main>

      <style jsx>{`
        .nova-os { display: flex; height: 100vh; background: #020305; color: #fff; font-family: 'Space Grotesk', sans-serif; overflow: hidden; }
        
        /* Sidebar */
        .os-sidebar { width: 280px; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); border-right: 1px solid rgba(0,242,255,0.1); padding: 2rem 1.5rem; display: flex; flex-direction: column; z-index: 10; }
        .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 3rem; }
        .brand-orb { width: 14px; height: 14px; background: #00f2ff; border-radius: 50%; box-shadow: 0 0 15px #00f2ff; }
        .brand h1 { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
        .version { font-size: 10px; color: #555; vertical-align: super; }
        
        .nav-group label, .system-stats label { font-size: 10px; color: #444; letter-spacing: 1px; display: block; margin-bottom: 1rem; }
        .nav-group { flex: 1; }
        .nav-group button { width: 100%; text-align: left; background: none; border: none; color: #888; padding: 12px; border-radius: 8px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; margin-bottom: 5px; }
        .nav-group button.active { background: rgba(0,242,255,0.05); color: #00f2ff; }
        
        .stat-row { margin-bottom: 15px; font-size: 11px; color: #666; font-family: 'JetBrains Mono'; }
        .bar { height: 2px; background: rgba(255,255,255,0.05); margin-top: 5px; }
        .fill { height: 100%; background: #00f2ff; }
        
        .sidebar-footer { display: flex; gap: 10px; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .icon-btn { background: none; border: none; color: #444; cursor: pointer; transition: 0.3s; }
        .icon-btn:hover { color: #00f2ff; }

        /* Main Viewport */
        .os-main { flex: 1; display: flex; flex-direction: column; z-index: 1; position: relative; }
        .os-header { padding: 1.5rem 3rem; display: flex; justify-content: space-between; font-size: 11px; font-family: 'JetBrains Mono'; color: #444; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .pulse { color: #00f2ff; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.3 } 50% { opacity: 1 } 100% { opacity: 0.3 } }

        .chat-viewport { flex: 1; overflow-y: auto; padding: 3rem 15%; scrollbar-width: none; }
        .welcome { text-align: center; margin-top: 10vh; }
        .hero-icon { width: 80px; height: 80px; background: rgba(0,242,255,0.05); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; border: 1px solid rgba(0,242,255,0.1); }
        .welcome h2 { font-size: 28px; margin-bottom: 1rem; }
        .welcome p { color: #888; line-height: 1.6; max-width: 500px; margin: 0 auto 2rem; }
        .quick-actions { display: flex; gap: 10px; justify-content: center; }
        .quick-actions button { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: 0.3s; }
        .quick-actions button:hover { border-color: #00f2ff; color: #00f2ff; }

        .message-row { display: flex; gap: 20px; margin-bottom: 3rem; }
        .message-row.user { flex-direction: row-reverse; }
        .msg-avatar { width: 36px; height: 36px; background: rgba(0,242,255,0.05); border: 1px solid rgba(0,242,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #00f2ff; }
        .msg-bubble { background: rgba(255,255,255,0.02); padding: 1.2rem; border-radius: 4px 16px 16px 16px; border-left: 2px solid #333; line-height: 1.7; color: #ccc; font-size: 15px; }
        .user .msg-bubble { border-left: none; border-right: 2px solid #00f2ff; border-radius: 16px 4px 16px 16px; background: rgba(0,242,255,0.02); color: #fff; }
        .msg-actions { display: flex; align-items: center; gap: 15px; margin-top: 10px; font-size: 10px; color: #444; }
        .msg-actions button { background: none; border: none; color: #444; cursor: pointer; }

        .loading-shimmer { font-size: 11px; font-family: 'JetBrains Mono'; color: #00f2ff; opacity: 0.6; }

        .os-input-area { padding: 2rem 15%; }
        .input-wrapper { background: rgba(10, 15, 20, 0.8); border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 15px; display: flex; align-items: center; padding: 5px 20px; backdrop-filter: blur(10px); }
        .input-wrapper input { flex: 1; background: none; border: none; padding: 1.2rem; color: #fff; outline: none; font-family: 'JetBrains Mono'; }
        .send-btn { background: #00f2ff; color: #000; border: none; padding: 10px; border-radius: 10px; cursor: pointer; transition: 0.3s; }
        .send-btn:hover { box-shadow: 0 0 15px #00f2ff; transform: scale(1.05); }

        /* Boot Screen */
        .boot-screen { height: 100vh; background: #000; display: flex; align-items: center; justify-content: center; }
        .boot-content { width: 300px; text-align: center; }
        .glitch-text { font-size: 24px; font-weight: 700; color: #00f2ff; letter-spacing: 5px; margin-bottom: 2rem; position: relative; }
        .boot-loader { height: 2px; background: rgba(0,242,255,0.1); margin-bottom: 1.5rem; }
        .boot-progress { height: 100%; background: #00f2ff; }
        .boot-logs { font-family: 'JetBrains Mono'; font-size: 10px; color: #444; text-align: left; }

        .spinner { width: 18px; height: 18px; border: 2px solid #000; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}