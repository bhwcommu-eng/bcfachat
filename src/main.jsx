import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bookmark, Cake, Camera, Check, ChevronDown,
  ChevronLeft, CircleHelp, Compass, Ellipsis, Film, Flame, Heart, HeartHandshake,
  ImagePlus, LogOut, MessageCircle, MessagesSquare, Music2, PawPrint, Pencil,
  Plus, RefreshCw, Ruler, Scale, Send, Settings2, ShieldCheck, Sparkles, Trash2,
  UserRound, UsersRound, X, Zap, Dumbbell, Gamepad2, SlidersHorizontal, LockKeyhole,
  Eye, EyeOff, CalendarDays, CameraOff, ArrowUpRight
} from 'lucide-react';
import { api, isOnlineMode } from './backend';
import './style.css';

const interestFields = [
  { key: 'animals', label: 'สัตว์', icon: PawPrint, placeholder: 'เช่น แมว, สุนัข, กระต่าย' },
  { key: 'music', label: 'เพลง', icon: Music2, placeholder: 'เช่น indie pop, T-pop, jazz' },
  { key: 'sports', label: 'กีฬา', icon: Dumbbell, placeholder: 'เช่น แบดมินตัน, ว่ายน้ำ' },
  { key: 'movies', label: 'หนัง', icon: Film, placeholder: 'เช่น โรแมนติก, ไซไฟ, สยองขวัญ' },
  { key: 'hobbies', label: 'งานอดิเรก', icon: Gamepad2, placeholder: 'เช่น วาดรูป, อ่านหนังสือ, คาเฟ่' },
];
const themeOptions = [
  { id: 'sky', name: 'Sky', color: '#dceeff' }, { id: 'lilac', name: 'Lilac', color: '#e8e3ff' },
  { id: 'peach', name: 'Peach', color: '#ffe7de' }, { id: 'mint', name: 'Mint', color: '#dcf5eb' },
  { id: 'cream', name: 'Cream', color: '#f6f0e5' }, { id: 'midnight', name: 'Night', color: '#d9e2f2' },
];
const tabs = [
  { id: 'discover', label: 'ค้นหา', Icon: Compass }, { id: 'likes', label: 'ถูกใจ', Icon: Heart },
  { id: 'matches', label: 'แมตช์', Icon: HeartHandshake }, { id: 'chats', label: 'แชท', Icon: MessagesSquare },
  { id: 'profile', label: 'โปรไฟล์', Icon: UserRound },
];

function Brand() {
  return <div className="brand-lockup"><div className="brand-mark"><Heart size={19} strokeWidth={2.6} fill="currentColor" /></div><div className="brand-word">BCFA<span>CHAT</span></div></div>;
}
function initials(person) {
  const label = person?.name_english || person?.username || 'B';
  return label.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'B';
}
function Avatar({ person, size = 'md', showOnline = false }) {
  const photo = person?.photo_urls?.[0];
  return <div className={`avatar avatar-${size} theme-${person?.theme || 'sky'}`}>
    {photo ? <img src={photo} alt={person?.name_english || 'profile'} /> : <><div className="avatar-orbit orbit-a" /><div className="avatar-orbit orbit-b" /><span>{initials(person)}</span></>}
    {showOnline && <i className="online-dot" />}
  </div>;
}
function NavButton({ item, active, onClick, count }) {
  const Icon = item.Icon;
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick} aria-label={item.label}>
    <span className="nav-icon-wrap"><Icon size={21} strokeWidth={active ? 2.5 : 1.9} />{count > 0 && <i className="nav-count">{count > 9 ? '9+' : count}</i>}</span>
    <span>{item.label}</span>
  </button>;
}
function EmptyState({ icon: Icon = Heart, title, description, action, onAction }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={25} /></div><h3>{title}</h3><p>{description}</p>{action && <button className="btn btn-primary" onClick={onAction}>{action}</button>}</div>;
}
function Field({ label, children, hint, className = '' }) {
  return <label className={`field ${className}`}><span className="field-label">{label}</span>{children}{hint && <small className="field-hint">{hint}</small>}</label>;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState(() => localStorage.getItem('bcfachat_remembered_username') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setError('');
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,20}$/.test(cleanUsername)) { setError('Username ใช้ a–z, 0–9, จุด ขีด และขีดล่าง ความยาว 3–20 ตัว'); return; }
    if (password.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
    if (mode === 'register' && password !== confirmPassword) { setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน'); return; }
    setBusy(true);
    try {
      const user = mode === 'register' ? await api.register(cleanUsername, password) : await api.login(cleanUsername, password);
      if (remember) localStorage.setItem('bcfachat_remembered_username', cleanUsername);
      else localStorage.removeItem('bcfachat_remembered_username');
      onAuthenticated(user);
    } catch (err) { setError(err?.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'); }
    finally { setBusy(false); }
  };
  return <div className="auth-shell">
    <header className="auth-header"><Brand /><span className="auth-header-label">A space for real connections</span></header>
    <div className="auth-layout">
      <section className="auth-copy">
        <div className="eyebrow"><Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE</div>
        <h1>เจอคนที่<br /><span>คลิกกันจริง ๆ</span></h1>
        <p>พื้นที่สำหรับคนที่อยากรู้จักใครสักคน ผ่านความสนใจ บทสนทนา และจังหวะที่พอดี</p>
        <div className="auth-art" aria-hidden="true">
          <div className="art-circle circle-one" /><div className="art-circle circle-two" />
          <div className="art-profile profile-left"><div className="art-face face-one">A</div><div className="art-lines"><b /><i /></div></div>
          <div className="art-profile profile-right"><div className="art-face face-two">M</div><div className="art-lines"><b /><i /></div></div>
          <div className="art-heart"><Heart size={27} fill="currentColor" /></div>
          <div className="art-tag"><span className="live-dot" /> good things take a little swipe</div>
        </div>
        <div className="auth-points"><span><ShieldCheck size={16} /> โปรไฟล์ของคุณ</span><span><MessageCircle size={16} /> แชทส่วนตัว</span><span><HeartHandshake size={16} /> แมตช์สองทาง</span></div>
      </section>
      <section className="auth-card">
        <div className="auth-card-heading"><div className="auth-badge"><Heart size={21} /></div><div><h2>{mode === 'login' ? 'ยินดีต้อนรับกลับ' : 'เริ่มต้นที่ BCFACHAT'}</h2><p>{mode === 'login' ? 'เข้าสู่ระบบเพื่อไปต่อจากที่คุยไว้' : 'สร้างบัญชีของคุณ ใช้ username เดิมกลับมาได้เสมอ'}</p></div></div>
        <div className="auth-switch"><button className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError(''); }}>เข้าสู่ระบบ</button><button className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setError(''); }}>สมัครสมาชิก</button></div>
        <form className="auth-form" onSubmit={submit}>
          <Field label="USERNAME"><div className="input-shell"><UserRound size={17} /><input value={username} onChange={e => setUsername(e.target.value)} placeholder="your.username" autoComplete="username" required maxLength={20} /></div></Field>
          <Field label="รหัสผ่าน" hint="อย่างน้อย 8 ตัวอักษร"><div className="input-shell"><LockKeyhole size={17} /><input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="กรอกรหัสผ่าน" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} /><button className="input-icon-button" type="button" aria-label="แสดงรหัสผ่าน" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></Field>
          {mode === 'register' && <Field label="ยืนยันรหัสผ่าน"><div className="input-shell"><LockKeyhole size={17} /><input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="กรอกรหัสผ่านอีกครั้ง" required minLength={8} autoComplete="new-password" /></div></Field>}
          <label className="remember-row"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /><span className="custom-check"><Check size={12} /></span><span>จดจำ username บนอุปกรณ์นี้</span></label>
          {error && <div className="form-error"><CircleHelp size={16} />{error}</div>}
          <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>{busy ? <span className="spinner" /> : <>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'} <ArrowRight size={17} /></>}</button>
        </form>
        <p className="auth-terms">การใช้งานหมายถึงคุณยืนยันว่ามีอายุ <strong>18 ปีขึ้นไป</strong> และจะให้เกียรติสมาชิกคนอื่น</p>
      </section>
    </div>
    <footer className="auth-footer"><span>© 2026 BCFACHAT</span><span>Made for meaningful connections</span></footer>
  </div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [candidates, setCandidates] = useState([]);
  const [likes, setLikes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageBusy, setPageBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [newMatch, setNewMatch] = useState(null);
  const [detailPerson, setDetailPerson] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterLine, setFilterLine] = useState('All');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [editingProfile, setEditingProfile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const pointerStart = useRef(null);
  const chatEndRef = useRef(null);
  const chatFileRef = useRef(null);
  const profileFileRef = useRef(null);

  const notify = useCallback((message) => { setToast(message); window.setTimeout(() => setToast(''), 3200); }, []);

  const loadSocial = useCallback(async (currentUser = user) => {
    if (!currentUser) return;
    try {
      const [nextCandidates, nextLikes, nextMatches] = await Promise.all([api.getCandidates(currentUser), api.getLikes(currentUser), api.getMatches(currentUser)]);
      setCandidates(nextCandidates); setLikes(nextLikes); setMatches(nextMatches);
      setCardIndex(0);
      if (selectedMatch) {
        const updatedMatch = nextMatches.find(m => m.id === selectedMatch.id);
        if (updatedMatch) setSelectedMatch(updatedMatch);
      }
    } catch (err) { notify(`โหลดข้อมูลไม่สำเร็จ:${err.message || 'กรุณาตรวจสอบ Supabase'}`); }
  }, [user, selectedMatch, notify]);

  useEffect(() => {
    api.getSession().then(async (current) => {
      if (current) setUser(current);
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const p = await api.getProfile(user);
        if (!active) return;
        setProfile(p); setEditingProfile({ ...p, interests: { ...(p.interests || {}) }, photo_urls: [...(p.photo_urls || [])] });
        await loadSocial(user);
      } catch (err) { if (active) notify(`เปิดโปรไฟล์ไม่สำเร็จ: ${err.message || 'ลองอีกครั้ง'}`); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  // The account ID is the intended reload boundary.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!selectedMatch || activeTab !== 'chats') return;
    let active = true;
    api.getMessages(user, selectedMatch.id).then(ms => { if (active) setMessages(ms); }).catch(e => notify(`อ่านแชทไม่สำเร็จ: ${e.message}`));
    const unsubscribe = api.subscribeMessages(selectedMatch.id, async () => {
      try { const ms = await api.getMessages(user, selectedMatch.id); if (active) setMessages(ms); } catch { /* The next refresh will retry. */ }
    });
    return () => { active = false; unsubscribe?.(); };
  }, [selectedMatch?.id, activeTab, user?.id, notify]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, activeTab]);

  const filteredCandidates = useMemo(() => candidates.filter(person => Number(person.age || 18) >= Number(minAge) && Number(person.age || 18) <= Number(maxAge) && (filterLine === 'All' || person.play_line === filterLine)), [candidates, minAge, maxAge, filterLine]);
  const currentCard = filteredCandidates[cardIndex];
  const currentIndex = Math.max(0, cardIndex);

  const changeTab = (tab) => { setActiveTab(tab); if (tab !== 'chats') { setSelectedMatch(null); setMessages([]); } };
  const handleAuth = async (newUser) => { setLoading(true); setUser(newUser); };
  const logout = async () => { await api.logout(); setUser(null); setProfile(null); setCandidates([]); setLikes([]); setMatches([]); setMessages([]); setSelectedMatch(null); setActiveTab('discover'); setLoading(false); };

  const handleSwipe = async (liked) => {
    if (!currentCard || pageBusy) return;
    const target = currentCard;
    setPageBusy(true); setSwipeDirection(liked ? 'like' : 'pass');
    try {
      const result = await api.swipe(user, target, liked);
      window.setTimeout(async () => {
        setSwipeDirection('');
        await loadSocial(user);
        setPageBusy(false);
        if (result?.matched) {
          const refreshed = await api.getMatches(user);
          setMatches(refreshed);
          const found = refreshed.find(m => m.id === result.match_id) || refreshed.find(m => m.person?.id === target.id);
          setNewMatch(found || { id: result.match_id || `demo-${target.id}`, person: target, user_a: user.id, user_b: target.id });
        } else if (!liked) { /* keep the interaction quiet */ }
      }, 220);
    } catch (err) { setSwipeDirection(''); setPageBusy(false); notify(`บันทึกการปัดไม่สำเร็จ: ${err.message || 'ลองใหม่อีกครั้ง'}`); }
  };

  const openChat = async (match) => {
    setSelectedMatch(match); setActiveTab('chats');
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!selectedMatch || sending || (!chatText.trim() && !chatImage)) return;
    if (chatImage && chatImage.size > 5 * 1024 * 1024) { notify('รูปแชทต้องมีขนาดไม่เกิน 5 MB'); return; }
    setSending(true);
    try {
      const receiverId = selectedMatch.person?.id || (selectedMatch.user_a === user.id ? selectedMatch.user_b : selectedMatch.user_a);
      const sent = await api.sendMessage(user, selectedMatch, receiverId, chatText, chatImage);
      setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
      setChatText(''); setChatImage(null);
      if (chatFileRef.current) chatFileRef.current.value = '';
    } catch (err) { notify(`ส่งข้อความไม่สำเร็จ: ${err.message || 'ลองอีกครั้ง'}`); }
    finally { setSending(false); }
  };

  const saveProfile = async (e) => {
    e?.preventDefault();
    if (!editingProfile) return;
    const cleanName = String(editingProfile.name_english || '').trim();
    if (!/^[A-Za-z][A-Za-z .'-]{0,49}$/.test(cleanName)) { notify('ชื่อใช้ตัวอักษรภาษาอังกฤษเท่านั้น'); return; }
    if (Number(editingProfile.age) < 18 || Number(editingProfile.age) > 99) { notify('สมาชิกต้องมีอายุระหว่าง 18–99 ปี'); return; }
    setSavingProfile(true);
    try {
      const values = { ...editingProfile, name_english: cleanName, age: Number(editingProfile.age), weight: editingProfile.weight === '' ? null : Number(editingProfile.weight), height: editingProfile.height === '' ? null : Number(editingProfile.height), interests: editingProfile.interests || {}, photo_urls: editingProfile.photo_urls || [] };
      const saved = await api.saveProfile(user, values);
      setProfile(saved); setEditingProfile({ ...saved, interests: { ...(saved.interests || {}) }, photo_urls: [...(saved.photo_urls || [])] });
      notify('บันทึกโปรไฟล์แล้ว');
    } catch (err) { notify(`บันทึกไม่สำเร็จ: ${err.message || 'ลองอีกครั้ง'}`); }
    finally { setSavingProfile(false); }
  };

  const addProfilePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingProfile) return;
    if (!file.type.startsWith('image/')) { notify('เลือกไฟล์รูปภาพเท่านั้น'); return; }
    if (file.size > 8 * 1024 * 1024) { notify('รูปโปรไฟล์ต้องมีขนาดไม่เกิน 8 MB'); e.target.value = ''; return; }
    if ((editingProfile.photo_urls || []).length >= 6) { notify('เพิ่มรูปได้สูงสุด 6 รูป'); e.target.value = ''; return; }
    setUploadingPhoto(true);
    try {
      const url = await api.uploadProfilePhoto(user, file);
      const updated = { ...editingProfile, photo_urls: [...(editingProfile.photo_urls || []), url] };
      setEditingProfile(updated);
      const saved = await api.saveProfile(user, updated);
      setProfile(saved); setEditingProfile({ ...saved, interests: { ...(saved.interests || {}) }, photo_urls: [...(saved.photo_urls || [])] });
      notify('เพิ่มรูปลงโปรไฟล์แล้ว');
    } catch (err) { notify(`อัปโหลดรูปไม่สำเร็จ: ${err.message || 'ลองอีกครั้ง'}`); }
    finally { setUploadingPhoto(false); e.target.value = ''; }
  };

  const removePhoto = async (photoUrl) => {
    try {
      const photo_urls = await api.deleteProfilePhoto(user, photoUrl, editingProfile.photo_urls || []);
      const saved = await api.saveProfile(user, { ...editingProfile, photo_urls });
      setProfile(saved); setEditingProfile({ ...saved, interests: { ...(saved.interests || {}) }, photo_urls: [...(saved.photo_urls || [])] });
      notify('ลบรูปแล้ว');
    } catch (err) { notify(`ลบรูปไม่สำเร็จ: ${err.message}`); }
  };

  if (loading) return <div className="loading-screen"><div className="loading-brand"><div className="brand-mark"><Heart size={19} fill="currentColor" /></div><span>BCFACHAT</span></div><div className="spinner large-spinner" /><p>กำลังเตรียมพื้นที่ของคุณ…</p></div>;
  if (!user) return <AuthScreen onAuthenticated={handleAuth} />;
  if (!profile || !editingProfile) return <div className="loading-screen"><div className="spinner large-spinner" /><p>กำลังโหลดโปรไฟล์…</p></div>;

  return <div className="app-shell">
    <header className="app-header">
      <button className="mobile-brand-button" onClick={() => changeTab('discover')} aria-label="กลับหน้าค้นหา"><Brand /></button>
      <div className="desktop-brand"><Brand /><span className="header-divider" /><span className="tagline">find your kind of connection</span></div>
      <div className="header-tools"><div className={`connection-pill ${isOnlineMode ? 'connected' : 'demo'}`}><span className="connection-dot" />{isOnlineMode ? 'ONLINE' : 'DEMO MODE'}</div><button className="header-profile" onClick={() => changeTab('profile')} title="โปรไฟล์ของฉัน"><Avatar person={profile} size="xs" /></button><button className="header-logout" onClick={logout} title="ออกจากระบบ"><LogOut size={17} /></button></div>
    </header>
    {!isOnlineMode && <div className="demo-banner"><div><span className="demo-banner-dot" /><strong>โหมดทดลอง</strong><span>ข้อมูลเก็บในเบราว์เซอร์นี้ ยังไม่เห็นผู้เล่นคนอื่น</span></div><button onClick={() => notify('เชื่อมต่อ Supabase ตามขั้นตอนใน README เพื่อใช้งานออนไลน์จริง')}>ตั้งค่าออนไลน์ <ArrowUpRight size={14} /></button></div>}
    <div className="workspace">
      <aside className="sidebar">
        <div className="sidebar-user"><Avatar person={profile} size="lg" showOnline /><div className="sidebar-user-info"><strong>{profile.name_english || profile.username}</strong><span>@{profile.username}</span></div><button onClick={() => changeTab('profile')} aria-label="แก้ไขโปรไฟล์"><Pencil size={15} /></button></div>
        <div className="side-section-label">YOUR SPACE</div>
        <nav className="sidebar-nav">{tabs.map(item => <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => changeTab(item.id)} count={item.id === 'matches' ? matches.length : item.id === 'likes' ? likes.length : 0} />)}</nav>
        <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Sparkles size={17} /></div><div><strong>เป็นตัวเองได้เต็มที่</strong><p>บทสนทนาที่ดีเริ่มต้นจากความจริงใจ</p></div></div><div className="sidebar-footer"><ShieldCheck size={14} /> โปรดให้เกียรติและเคารพกันเสมอ</div></div>
      </aside>
      <main className={`main-content page-${activeTab}`}>
        {activeTab === 'discover' && <section className="discover-page">
          <div className="page-heading discover-heading"><div><span className="section-kicker">THE DISCOVERY</span><h1>คนที่น่าจะคลิกกัน <span className="heading-sparkle"><Sparkles size={20} fill="currentColor" /></span></h1><p>เริ่มจากความสนใจเล็ก ๆ แล้วปล่อยให้บทสนทนาพาไปต่อ</p></div><button className={`filter-button ${filtersOpen ? 'filter-active' : ''}`} onClick={() => setFiltersOpen(v => !v)}><SlidersHorizontal size={17} /> <span>ตัวกรอง</span></button></div>
          {filtersOpen && <div className="filter-panel"><div className="filter-panel-top"><strong>ปรับคนที่อยากเจอ</strong><button onClick={() => { setFilterLine('All'); setMinAge(18); setMaxAge(40); }} className="text-button">รีเซ็ต</button></div><div className="filter-fields"><Field label="สายที่เล่น"><select value={filterLine} onChange={e => { setFilterLine(e.target.value); setCardIndex(0); }}><option value="All">ทั้งหมด</option>{['BL','HL','GL','NoL','FZ'].map(l => <option key={l}>{l}</option>)}</select></Field><div className="age-range"><span className="field-label">ช่วงอายุ</span><div><label>{minAge} ปี<input type="range" min="18" max={maxAge} value={minAge} onChange={e => { setMinAge(Number(e.target.value)); setCardIndex(0); }} /></label><label>{maxAge} ปี<input type="range" min={minAge} max="60" value={maxAge} onChange={e => { setMaxAge(Number(e.target.value)); setCardIndex(0); }} /></label></div></div></div></div>}
          {currentCard ? <div className="discover-stage">
            <div className={`discover-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`} onPointerDown={e => { pointerStart.current = { x: e.clientX, y: e.clientY }; }} onPointerUp={e => { if (!pointerStart.current || showFullProfile || pageBusy) return; const dx = e.clientX - pointerStart.current.x; const dy = e.clientY - pointerStart.current.y; pointerStart.current = null; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.2) handleSwipe(dx > 0); }}>
              <div className={`discover-photo theme-${currentCard.theme || 'sky'}`}>
                {currentCard.photo_urls?.length ? <img src={currentCard.photo_urls[0]} alt={currentCard.name_english} draggable="false" /> : <div className="profile-art"><div className="profile-art-ring ring-one" /><div className="profile-art-ring ring-two" /><div className="profile-art-sun" /><div className="profile-art-initials">{initials(currentCard)}</div><div className="profile-art-caption">a story in progress</div></div>}
                <div className="photo-topline"><span className="verified-pill"><BadgeCheck size={13} /> PROFILE</span><span className="photo-counter"><Camera size={13} /> {(currentCard.photo_urls || []).length || 1}</span></div>
                <div className="photo-gradient" />
                <div className="photo-bottom-info"><div className="profile-name-line"><h2>{currentCard.name_english}, {currentCard.age}</h2><span className="online-status"><i /> เปิดใจรู้จัก</span></div><div className="profile-meta"><span><MapPinIcon /> BCFACHAT member</span>{currentCard.height && <span><Ruler size={13} /> {currentCard.height} cm</span>}</div></div>
                <button className="card-more" aria-label="ดูข้อมูลโปรไฟล์" onClick={e => { e.stopPropagation(); setShowFullProfile(v => !v); }}><Ellipsis size={21} /></button>
              </div>
              {showFullProfile ? <div className="discover-details expanded-details"><div className="detail-head"><div><span className="detail-kicker">A LITTLE ABOUT ME</span><p>{currentCard.bio || 'ยังไม่ได้เพิ่มแนะนำตัว'}</p></div><button onClick={() => setShowFullProfile(false)} className="close-detail"><X size={17} /></button></div><div className="detail-pills"><span>{currentCard.play_line}</span><span>{currentCard.status || 'Open to talk'}</span>{currentCard.weight && <span>{currentCard.weight} kg</span>}</div><div className="detail-interests">{interestFields.map(f => currentCard.interests?.[f.key] && <div key={f.key}><strong>{f.label}</strong><span>{currentCard.interests[f.key]}</span></div>)}</div></div> : <div className="discover-details"><p className="profile-bio">{currentCard.bio || 'ยังไม่ได้เขียนแนะนำตัว — ลองทักไปทำความรู้จักกันดู'}</p><div className="detail-pills"><span className="line-pill">{currentCard.play_line || 'NoL'}</span><span>{currentCard.status || 'Single'}</span>{currentCard.height && <span>{currentCard.height} cm</span>}</div><div className="interest-chips">{interestFields.filter(f => currentCard.interests?.[f.key]).slice(0, 3).map(f => <span key={f.key}>{f.label}: {currentCard.interests[f.key]}</span>)}</div></div>}
            </div>
            <div className="swipe-actions"><button className="swipe-action pass-action" aria-label="ปัดผ่าน" onClick={() => handleSwipe(false)} disabled={pageBusy}><X size={26} strokeWidth={2.6} /></button><button className="swipe-action boost-action" aria-label="ดูรายละเอียด" onClick={() => setShowFullProfile(v => !v)}><Sparkles size={18} /></button><button className="swipe-action like-action" aria-label="ถูกใจ" onClick={() => handleSwipe(true)} disabled={pageBusy}><Heart size={25} fill="currentColor" strokeWidth={2.3} /></button></div>
            <div className="swipe-hint"><span><ArrowLeft size={13} /> ปัดซ้ายเพื่อผ่าน</span><span>ปัดขวาเพื่อถูกใจ <ArrowRight size={13} /></span></div>
            <div className="deck-footer"><span>{currentIndex + 1} / {filteredCandidates.length}</span><span>โปรไฟล์ที่คุณยังไม่เคยปัด</span><button onClick={() => { setFiltersOpen(false); loadSocial(user); }} title="โหลดโปรไฟล์ใหม่"><RefreshCw size={14} /></button></div>
          </div> : <div className="discover-empty"><EmptyState icon={Compass} title={candidates.length ? 'ไม่มีคนตรงกับตัวกรองนี้' : 'คุณดูครบแล้วในตอนนี้'} description={candidates.length ? 'ลองขยายช่วงอายุหรือเปลี่ยนสายที่เล่นดูนะ' : 'กลับมาใหม่อีกครั้งเมื่อมีสมาชิกเพิ่ม หรือปรับตัวกรองของคุณ'} action={candidates.length ? 'ล้างตัวกรอง' : 'โหลดโปรไฟล์ใหม่'} onAction={() => { if (candidates.length) { setFilterLine('All'); setMinAge(18); setMaxAge(40); } else loadSocial(user); }} /></div>}
          <div className="trust-note"><ShieldCheck size={15} /><span>คุณเป็นคนเลือกเสมอ — แชทจะเริ่มได้เมื่อแมตช์กันแล้วเท่านั้น</span></div>
        </section>}

        {activeTab === 'likes' && <section className="collection-page"><div className="page-heading"><div><span className="section-kicker">YOUR PICKS</span><h1>คนที่คุณถูกใจ</h1><p>โปรไฟล์ที่คุณเลือกปัดขวา เก็บไว้ให้ย้อนกลับมาดู</p></div><div className="heading-count"><Heart size={16} /> {likes.length}</div></div>{likes.length ? <div className="people-grid">{likes.map(person => <article className="person-tile" key={person.id}><div className={`tile-photo theme-${person.theme || 'sky'}`}><Avatar person={person} size="tile" /><span className="tile-line">{person.play_line}</span></div><div className="tile-info"><h3>{person.name_english}, {person.age}</h3><span>@{person.username}</span><p>{person.bio || 'กำลังเปิดรับบทสนทนาดี ๆ'}</p><button className="btn btn-outline btn-full" onClick={() => setDetailPerson(person)}>ดูโปรไฟล์</button></div></article>)}</div> : <EmptyState icon={Heart} title="ยังไม่มีโปรไฟล์ที่ถูกใจ" description="เมื่อเจอคนที่สนใจในหน้าค้นหา กดหัวใจแล้วเขาจะปรากฏอยู่ที่นี่" action="ไปค้นหาคน" onAction={() => changeTab('discover')} />}</section>}

        {activeTab === 'matches' && <section className="collection-page"><div className="page-heading"><div><span className="section-kicker">IT'S A MATCH</span><h1>แมตช์ของคุณ</h1><p>เมื่อทั้งสองฝ่ายถูกใจกัน บทสนทนาก็เริ่มต้นได้</p></div><div className="heading-count"><HeartHandshake size={17} /> {matches.length}</div></div>{matches.length ? <div className="matches-list">{matches.map(match => <article key={match.id} className="match-row"><Avatar person={match.person} size="lg" /><div className="match-copy"><div className="match-name-line"><h3>{match.person.name_english}, {match.person.age}</h3><span className="match-pill"><Heart size={11} fill="currentColor" /> IT'S A MATCH</span></div><p>{match.person.bio || 'เริ่มต้นทักทายกันได้เลย'}</p><span className="match-username">@{match.person.username}</span></div><button className="btn btn-primary match-chat-btn" onClick={() => openChat(match)}><MessageCircle size={16} /> ส่งข้อความ</button></article>)}</div> : <EmptyState icon={HeartHandshake} title="แมตช์แรกของคุณอยู่ไม่ไกล" description="กดถูกใจคนที่สนใจ ถ้าอีกฝ่ายเลือกคุณกลับมา เราจะบันทึกแมตช์ไว้ที่นี่" action="ไปปัดทำความรู้จัก" onAction={() => changeTab('discover')} />}</section>}

        {activeTab === 'chats' && <section className={`chat-page ${selectedMatch ? 'chat-selected' : ''}`}>
          <aside className="chat-list-pane"><div className="chat-pane-heading"><div><span className="section-kicker">YOUR CONVERSATIONS</span><h1>ข้อความ</h1></div><span className="chat-count">{matches.length}</span></div><div className="chat-list">{matches.map(match => <button key={match.id} onClick={() => setSelectedMatch(match)} className={`chat-list-item ${selectedMatch?.id === match.id ? 'chosen' : ''}`}><Avatar person={match.person} size="md" /><span className="chat-list-copy"><strong>{match.person.name_english}</strong><small>{match.person.bio || 'เริ่มบทสนทนาของคุณ'}</small></span><ChevronLeft size={16} className="chat-chevron" /></button>)}{!matches.length && <div className="chat-list-empty"><div className="empty-icon small"><MessagesSquare size={21} /></div><strong>ยังไม่มีแชท</strong><span>แมตช์กับใครสักคน แล้วมาเริ่มคุยกันตรงนี้</span><button className="text-button" onClick={() => changeTab('discover')}>ไปค้นหา <ArrowRight size={13} /></button></div>}</div></aside>
          <div className="conversation-pane">{selectedMatch ? <>
            <div className="conversation-header"><button className="back-to-chats" onClick={() => setSelectedMatch(null)}><ArrowLeft size={18} /></button><Avatar person={selectedMatch.person} size="sm" showOnline /><div className="conversation-person"><strong>{selectedMatch.person?.name_english || 'BCFACHAT member'}</strong><span><i /> Matched with you</span></div><button className="chat-more" onClick={() => notify('แชทนี้บันทึกข้อความให้อัตโนมัติแล้ว')} title="รายละเอียด"><Ellipsis size={20} /></button></div>
            <div className="conversation-match-note"><div className="match-note-heart"><Heart size={15} fill="currentColor" /></div><span>คุณและ {selectedMatch.person?.name_english || 'สมาชิก'} ถูกใจกันแล้ว — ส่งข้อความแรกได้เลย</span></div>
            <div className="messages-scroll">{messages.length ? <div className="messages-inner">{messages.map((message, index) => <React.Fragment key={message.id}><div className={`message-row ${message.sender_id === user.id ? 'message-mine' : 'message-theirs'}`}><div className="message-bubble">{message.body && <p>{message.body}</p>}{(message.image_url || message.image_path?.startsWith('data:')) && <a href={message.image_url || message.image_path} target="_blank" rel="noreferrer"><img className="message-image" src={message.image_url || message.image_path} alt="ภาพที่ส่งในแชท" /></a>}<span className="message-time">{new Date(message.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span></div></div></React.Fragment>)}<div ref={chatEndRef} /></div> : <div className="chat-first-message"><div className="first-message-art"><Avatar person={selectedMatch.person} size="xl" /><span><Heart size={18} fill="currentColor" /></span></div><h3>เริ่มต้นจากคำว่า “สวัสดี”</h3><p>คุณไม่จำเป็นต้องคิดประโยคที่สมบูรณ์แบบ<br />แค่เป็นตัวเองก็พอแล้ว</p><button className="suggestion-chip" onClick={() => setChatText(`สวัสดี ${selectedMatch.person?.name_english || ''} ยินดีที่ได้แมตช์กันนะ :)`)}>“สวัสดี ยินดีที่ได้แมตช์กันนะ”</button></div>}</div>
            <form className="message-composer" onSubmit={sendMessage}>{chatImage && <div className="attachment-preview"><img src={URL.createObjectURL(chatImage)} alt="รูปที่แนบ" /><span>{chatImage.name}</span><button type="button" onClick={() => { setChatImage(null); if (chatFileRef.current) chatFileRef.current.value = ''; }} aria-label="ลบรูปที่แนบ"><X size={14} /></button></div>}<div className="composer-line"><input ref={chatFileRef} type="file" accept="image/*" hidden onChange={e => setChatImage(e.target.files?.[0] || null)} /><button type="button" className="attach-button" onClick={() => chatFileRef.current?.click()} aria-label="ส่งภาพ"><ImagePlus size={20} /></button><input className="message-input" value={chatText} onChange={e => setChatText(e.target.value)} placeholder="พิมพ์ข้อความ…" maxLength={2000} /><button className="send-button" type="submit" disabled={sending || (!chatText.trim() && !chatImage)} aria-label="ส่งข้อความ">{sending ? <span className="spinner" /> : <Send size={18} />}</button></div><div className="composer-hint"><LockKeyhole size={12} /> ข้อความและรูปจะถูกบันทึกไว้ในประวัติแชท</div></form>
          </> : <div className="choose-chat"><div className="choose-chat-art"><MessagesSquare size={31} /><div><Heart size={15} fill="currentColor" /></div></div><h2>บทสนทนาที่กำลังรอคุณอยู่</h2><p>เลือกแมตช์ทางซ้ายเพื่อเปิดประวัติแชท หรือไปพบคนใหม่ในหน้าค้นหา</p>{matches.length === 0 && <button className="btn btn-primary" onClick={() => changeTab('discover')}>ค้นหาคนใหม่ <ArrowRight size={16} /></button>}</div>}</div>
        </section>}

        {activeTab === 'profile' && <section className="profile-page"><div className="page-heading"><div><span className="section-kicker">YOUR IDENTITY</span><h1>โปรไฟล์ของฉัน</h1><p>รายละเอียดที่ดีช่วยให้คนที่ใช่รู้จักคุณมากขึ้น</p></div><button className="btn btn-outline preview-profile-btn" onClick={() => notify('โปรไฟล์ที่บันทึกไว้จะแสดงในหน้าค้นหาของสมาชิกคนอื่น')}><Eye size={16} /> ดูมุมมองโปรไฟล์</button></div>
          <div className="profile-layout"><form className="profile-form-card" onSubmit={saveProfile}>
            <div className="form-section-heading"><div><h2>รูปภาพของคุณ</h2><p>เลือกได้สูงสุด 6 รูป รูปแรกจะเป็นรูปหลัก</p></div><span className="section-step">01</span></div>
            <div className="photo-manager"><div className="photo-manager-main"><Avatar person={editingProfile} size="profile-preview" /><span className="photo-manager-label">รูปหลัก</span></div><div className="photo-manager-grid">{(editingProfile.photo_urls || []).map((url, idx) => <div className={`managed-photo ${idx === 0 ? 'is-primary' : ''}`} key={url}><img src={url} alt={`profile ${idx + 1}`} />{idx === 0 && <span>หลัก</span>}<button type="button" onClick={() => removePhoto(url)} aria-label="ลบรูป"><X size={13} /></button></div>)}{(editingProfile.photo_urls || []).length < 6 && <button type="button" className="add-photo-tile" onClick={() => profileFileRef.current?.click()} disabled={uploadingPhoto}>{uploadingPhoto ? <span className="spinner" /> : <><Plus size={19} /><span>เพิ่มรูป</span></>}</button>}<input ref={profileFileRef} hidden type="file" accept="image/*" onChange={addProfilePhoto} /></div></div>
            <div className="form-divider" />
            <div className="form-section-heading"><div><h2>ข้อมูลพื้นฐาน</h2><p>แนะนำให้กรอกข้อมูลตามจริง</p></div><span className="section-step">02</span></div>
            <div className="form-grid"><Field label="ชื่อ (ภาษาอังกฤษ)" className="field-span-2"><input required maxLength={50} value={editingProfile.name_english || ''} onChange={e => setEditingProfile(p => ({ ...p, name_english: e.target.value.replace(/[^A-Za-z .'-]/g, '') }))} placeholder="Your English name" /></Field><Field label="อายุ"><input required type="number" min="18" max="99" value={editingProfile.age ?? 18} onChange={e => setEditingProfile(p => ({ ...p, age: e.target.value }))} /></Field><Field label="วันเกิด"><input type="date" value={editingProfile.birthday || ''} onChange={e => setEditingProfile(p => ({ ...p, birthday: e.target.value }))} /></Field><Field label="น้ำหนัก (กก.)"><div className="unit-input"><input type="number" min="25" max="300" step="0.1" value={editingProfile.weight ?? ''} onChange={e => setEditingProfile(p => ({ ...p, weight: e.target.value }))} placeholder="—" /><span>kg</span></div></Field><Field label="ส่วนสูง (ซม.)"><div className="unit-input"><input type="number" min="80" max="250" step="0.1" value={editingProfile.height ?? ''} onChange={e => setEditingProfile(p => ({ ...p, height: e.target.value }))} placeholder="—" /><span>cm</span></div></Field><Field label="สถานะ"><select value={editingProfile.status || 'Single'} onChange={e => setEditingProfile(p => ({ ...p, status: e.target.value }))}><option>Single</option><option>Open to talk</option><option>Complicated</option><option>In a relationship</option></select></Field><Field label="สายที่เล่น"><select value={editingProfile.play_line || 'NoL'} onChange={e => setEditingProfile(p => ({ ...p, play_line: e.target.value }))}>{['BL','HL','GL','NoL','FZ'].map(l => <option key={l}>{l}</option>)}</select></Field></div>
            <div className="form-divider" />
            <div className="form-section-heading"><div><h2>สิ่งที่ชอบ</h2><p>ใส่คำสั้น ๆ หรือคั่นหลายอย่างด้วยเครื่องหมายจุลภาค</p></div><span className="section-step">03</span></div>
            <div className="interests-form">{interestFields.map(f => { const Icon = f.icon; return <Field key={f.key} label={<span className="interest-field-label"><Icon size={15} />{f.label}</span>}><input value={editingProfile.interests?.[f.key] || ''} onChange={e => setEditingProfile(p => ({ ...p, interests: { ...(p.interests || {}), [f.key]: e.target.value } }))} placeholder={f.placeholder} maxLength={160} /></Field>; })}</div>
            <Field label="แนะนำตัวสั้น ๆ"><textarea value={editingProfile.bio || ''} onChange={e => setEditingProfile(p => ({ ...p, bio: e.target.value }))} placeholder="เล่าอะไรเกี่ยวกับตัวเองที่อยากให้อีกฝ่ายรู้…" rows={3} maxLength={300} /><small className="field-hint align-right">{(editingProfile.bio || '').length}/300</small></Field>
            <div className="form-divider" />
            <div className="form-section-heading"><div><h2>ตกแต่งโปรไฟล์</h2><p>เลือกโทนสีที่เป็นคุณ</p></div><span className="section-step">04</span></div>
            <div className="theme-picker">{themeOptions.map(t => <button type="button" title={t.name} key={t.id} className={`theme-choice ${editingProfile.theme === t.id ? 'theme-selected' : ''}`} onClick={() => setEditingProfile(p => ({ ...p, theme: t.id }))}><span style={{ background: t.color }} />{t.name}{editingProfile.theme === t.id && <Check size={13} />}</button>)}</div>
            <div className="profile-form-footer"><span><ShieldCheck size={15} /> คุณแก้ไขข้อมูลได้ทุกเมื่อ</span><button className="btn btn-primary" type="submit" disabled={savingProfile}>{savingProfile ? <span className="spinner" /> : <><Check size={17} /> บันทึกโปรไฟล์</>}</button></div>
          </form>
          <aside className="profile-preview-column"><div className="preview-label"><Eye size={15} /> LIVE PREVIEW</div><article className={`preview-card theme-${editingProfile.theme || 'sky'}`}><div className="preview-photo">{editingProfile.photo_urls?.[0] ? <img src={editingProfile.photo_urls[0]} alt="รูปโปรไฟล์ตัวอย่าง" /> : <div className="preview-art"><div className="profile-art-ring ring-one" /><div className="profile-art-ring ring-two" /><div className="profile-art-sun" /><div className="profile-art-initials">{initials(editingProfile)}</div></div>}<span className="preview-brand-pill"><Heart size={11} fill="currentColor" /> BCFACHAT</span><div className="preview-photo-fade" /></div><div className="preview-card-info"><span className="preview-card-kicker">A LITTLE ABOUT ME</span><h3>{editingProfile.name_english || 'Your Name'}, {editingProfile.age || 18}</h3><div className="detail-pills"><span className="line-pill">{editingProfile.play_line || 'NoL'}</span><span>{editingProfile.status || 'Single'}</span></div><p>{editingProfile.bio || 'Your introduction will show here. Let people know what makes you, you.'}</p><div className="preview-interest-list">{interestFields.filter(f => editingProfile.interests?.[f.key]).slice(0, 3).map(f => <span key={f.key}>{f.label}: {editingProfile.interests[f.key]}</span>)}</div></div><div className="preview-action-row"><span><X size={17} /></span><span><Heart size={17} fill="currentColor" /></span></div></article><div className="privacy-card"><div className="privacy-card-icon"><LockKeyhole size={17} /></div><div><strong>คุณควบคุมข้อมูลของคุณ</strong><p>รหัสผ่านไม่แสดงในโปรไฟล์ สมาชิกคนอื่นเห็นเฉพาะข้อมูลที่คุณเลือกบันทึกไว้</p></div></div></aside></div>
        </section>}
      </main>
    </div>
    <nav className="mobile-bottom-nav">{tabs.map(item => <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => changeTab(item.id)} count={item.id === 'matches' ? matches.length : item.id === 'likes' ? likes.length : 0} />)}</nav>
    {toast && <div className="toast"><span className="toast-check"><Check size={14} /></span>{toast}</div>}
    {detailPerson && <div className="modal-backdrop" onClick={() => setDetailPerson(null)}><div className="detail-person-modal" onClick={e => e.stopPropagation()}><button className="detail-modal-close" aria-label="ปิด" onClick={() => setDetailPerson(null)}><X size={18} /></button><div className={`detail-person-cover theme-${detailPerson.theme || 'sky'}`}>{detailPerson.photo_urls?.[0] ? <img src={detailPerson.photo_urls[0]} alt={detailPerson.name_english} /> : <Avatar person={detailPerson} size="xl" />}<span>{detailPerson.play_line || 'NoL'}</span></div><h2>{detailPerson.name_english}, {detailPerson.age}</h2><span className="detail-person-username">@{detailPerson.username}</span><p className="detail-person-bio">{detailPerson.bio || 'ยังไม่ได้เพิ่มแนะนำตัว'}</p><div className="detail-pills"><span className="line-pill">{detailPerson.play_line || 'NoL'}</span><span>{detailPerson.status || 'Single'}</span>{detailPerson.height && <span>{detailPerson.height} cm</span>}{detailPerson.weight && <span>{detailPerson.weight} kg</span>}</div><div className="detail-modal-interests">{interestFields.filter(f => detailPerson.interests?.[f.key]).map(f => <div key={f.key}><strong>{f.label}</strong><span>{detailPerson.interests[f.key]}</span></div>)}</div><button className="btn btn-outline btn-full" onClick={() => setDetailPerson(null)}>ปิดโปรไฟล์</button></div></div>}
    {newMatch && <div className="modal-backdrop" onClick={() => setNewMatch(null)}><div className="match-modal" onClick={e => e.stopPropagation()}><div className="confetti confetti-one" /><div className="confetti confetti-two" /><div className="modal-spark"><Sparkles size={19} /></div><span className="section-kicker">SOMETHING STARTED</span><h2>It's a <span>match!</span></h2><p>คุณและ {newMatch.person?.name_english || 'สมาชิก'} ถูกใจกันพอดี</p><div className="match-avatars"><Avatar person={profile} size="match-big" /><div className="match-heart-float"><Heart size={22} fill="currentColor" /></div><Avatar person={newMatch.person} size="match-big" /></div><div className="match-modal-actions"><button className="btn btn-primary" onClick={() => { const m = matches.find(x => x.id === newMatch.id) || newMatch; setNewMatch(null); openChat(m); }}><MessageCircle size={16} /> ส่งข้อความ</button><button className="btn btn-outline" onClick={() => setNewMatch(null)}>ดูคนอื่นต่อ</button></div></div></div>}
    <footer className="app-footer"><span>BCFACHAT <span className="footer-dot">·</span> Find your kind of connection</span><span>Be kind. Be real.</span></footer>
  </div>;
}

function MapPinIcon() { return <Compass size={13} />; }

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
