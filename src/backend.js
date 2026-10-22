import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const configured = Boolean(url && key && !url.includes('YOUR_') && !key.includes('YOUR_'));
export const isOnlineMode = configured;
const supabase = configured ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
const AUTH_DOMAIN = (import.meta.env.VITE_AUTH_EMAIL_DOMAIN || 'bcfachat.example').trim().toLowerCase();
const STORE_KEY = 'bcfachat_demo_database_v1';
const SESSION_KEY = 'bcfachat_demo_session_v1';

const seedProfiles = [
  { id: 'seed-aria', username: 'aria.blue', name_english: 'Aria Blue', age: 23, weight: 49, height: 164, birthday: '2003-02-14', status: 'Single', play_line: 'GL', bio: 'Collecting little moments, good playlists and places with good light.', interests: { animals: 'cats, dogs', music: 'indie pop, R&B', sports: 'badminton', movies: 'romance, animation', hobbies: 'film camera, cafe hopping' }, photo_urls: [], theme: 'sky', demoLikesBack: true },
  { id: 'seed-milo', username: 'milo.day', name_english: 'Milo Day', age: 25, weight: 66, height: 177, birthday: '2001-06-03', status: 'Open to talk', play_line: 'BL', bio: 'A little shy at first. Very talkative about music and dogs.', interests: { animals: 'golden retrievers', music: 'city pop, jazz', sports: 'swimming', movies: 'sci-fi', hobbies: 'cooking, vinyl' }, photo_urls: [], theme: 'lilac', demoLikesBack: true },
  { id: 'seed-nova', username: 'nova.h', name_english: 'Nova Hart', age: 22, weight: 53, height: 168, birthday: '2004-09-21', status: 'Single', play_line: 'HL', bio: 'On a mission to find the best noodle spot in town.', interests: { animals: 'rabbits', music: 'alt rock', sports: 'volleyball', movies: 'thrillers', hobbies: 'reading, food trips' }, photo_urls: [], theme: 'peach' },
  { id: 'seed-rin', username: 'rin.sunday', name_english: 'Rin Sunday', age: 24, weight: 55, height: 170, birthday: '2002-04-18', status: 'Complicated', play_line: 'FZ', bio: 'Here for honest conversations and a little chaos.', interests: { animals: 'cats', music: 'T-pop, K-pop', sports: 'pilates', movies: 'comedy', hobbies: 'drawing, playlists' }, photo_urls: [], theme: 'mint' },
  { id: 'seed-eli', username: 'eli.w', name_english: 'Eli Winter', age: 26, weight: 72, height: 182, birthday: '2000-01-30', status: 'Single', play_line: 'BL', bio: 'Coffee by day, games by night. Tell me what you are playing.', interests: { animals: 'all animals', music: 'lo-fi, rock', sports: 'basketball', movies: 'action', hobbies: 'gaming, coffee' }, photo_urls: [], theme: 'blue' },
  { id: 'seed-june', username: 'june.and.co', name_english: 'June Lee', age: 23, weight: 51, height: 161, birthday: '2003-11-07', status: 'Open to talk', play_line: 'GL', bio: 'Bookstores, soft mornings and people who are kind to waiters.', interests: { animals: 'dogs', music: 'acoustic, jazz', sports: 'yoga', movies: 'indie films', hobbies: 'books, baking' }, photo_urls: [], theme: 'cream' },
  { id: 'seed-ash', username: 'ash.tan', name_english: 'Ash Tan', age: 27, weight: 68, height: 179, birthday: '1999-08-12', status: 'Single', play_line: 'NoL', bio: 'Sincere connection > perfect first impressions.', interests: { animals: 'cats', music: 'hip-hop', sports: 'running', movies: 'documentaries', hobbies: 'photography, hiking' }, photo_urls: [], theme: 'midnight' },
];

function initialDemoStore() {
  return { users: {}, profiles: Object.fromEntries(seedProfiles.map(p => [p.id, p])), swipes: [], matches: [], messages: [] };
}
function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) { const s = initialDemoStore(); localStorage.setItem(STORE_KEY, JSON.stringify(s)); return s; }
    const parsed = JSON.parse(raw);
    const seed = initialDemoStore();
    return { ...seed, ...parsed, profiles: { ...seed.profiles, ...(parsed.profiles || {}) } };
  } catch { return initialDemoStore(); }
}
function writeStore(store) { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
function normUsername(value) { return String(value || '').trim().toLowerCase(); }
function authEmail(username) { return `${normUsername(username)}@${AUTH_DOMAIN}`; }
function defaultProfile(user) {
  const candidateName = String(user.username || '').replace(/[^A-Za-z .'-]/g, ' ').trim().replace(/\s+/g, ' ');
  const safeName = /^[A-Za-z]/.test(candidateName) ? candidateName.slice(0, 50) : 'New Member';
  return { id: user.id, username: user.username, name_english: safeName, age: 18, weight: null, height: null, birthday: null, status: 'Single', play_line: 'NoL', interests: { animals: '', music: '', sports: '', movies: '', hobbies: '' }, bio: '', photo_urls: [], theme: 'sky', created_at: new Date().toISOString() };
}
function toBytes(buffer) { return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function hashPassword(password) {
  if (globalThis.crypto?.subtle) return toBytes(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)));
  // This fallback is only for a non-secure local demo environment. Never used by online mode.
  return btoa(unescape(encodeURIComponent(password)));
}
async function fileToDataUrl(file) {
  // Keep demo-mode localStorage use modest; online mode uploads the original File to Storage.
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = objectUrl;
    });
    const scale = Math.min(1, 1000 / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.72));
    if (blob) return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
  } catch { /* Fall back to the original file if this browser cannot decode the image. */ }
  finally { URL.revokeObjectURL(objectUrl); }
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
}

export const api = {
  async register(username, password) {
    username = normUsername(username);
    if (isOnlineMode) {
      const { data, error } = await supabase.auth.signUp({ email: authEmail(username), password, options: { data: { username } } });
      if (error) throw error;
      if (!data.session || !data.user) throw new Error('บัญชีถูกสร้างแล้ว แต่ยังไม่ได้เข้าสู่ระบบอัตโนมัติ กรุณาปิด Confirm email ใน Supabase Auth แล้วเข้าสู่ระบบอีกครั้ง');
      const user = { id: data.user.id, username };
      const initialProfile = defaultProfile(user);
      delete initialProfile.birthday;
      const { error: profileError } = await supabase.from('profiles').upsert(initialProfile, { onConflict: 'id' });
      if (profileError) throw profileError;
      return user;
    }
    const store = readStore();
    if (store.users[username]) throw new Error('Username นี้ถูกใช้งานแล้ว');
    if (username.length < 3) throw new Error('Username ต้องมีอย่างน้อย 3 ตัวอักษร');
    const user = { id: `demo-${crypto.randomUUID()}`, username };
    store.users[username] = { ...user, password_hash: await hashPassword(password) };
    store.profiles[user.id] = defaultProfile(user);
    writeStore(store);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },
  async login(username, password) {
    username = normUsername(username);
    if (isOnlineMode) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail(username), password });
      if (error) throw new Error('Username หรือรหัสผ่านไม่ถูกต้อง');
      const user = { id: data.user.id, username: data.user.user_metadata?.username || username };
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
      if (!profile) {
        const initialProfile = defaultProfile(user);
        delete initialProfile.birthday;
        const { error: insertError } = await supabase.from('profiles').insert(initialProfile);
        if (insertError) throw insertError;
      }
      return user;
    }
    const store = readStore();
    const found = store.users[username];
    if (!found || found.password_hash !== await hashPassword(password)) throw new Error('Username หรือรหัสผ่านไม่ถูกต้อง');
    const user = { id: found.id, username: found.username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },
  async getSession() {
    if (isOnlineMode) {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return null;
      return { id: data.session.user.id, username: data.session.user.user_metadata?.username || data.session.user.email?.split('@')[0] || 'member' };
    }
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  },
  async logout() {
    if (isOnlineMode) await supabase.auth.signOut();
    else localStorage.removeItem(SESSION_KEY);
  },
  async getProfile(user) {
    if (isOnlineMode) {
      const [{ data, error }, { data: privateDetails, error: privateError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profile_private_details').select('birthday').eq('id', user.id).maybeSingle(),
      ]);
      if (error) throw error;
      if (privateError) throw privateError;
      return { ...data, birthday: privateDetails?.birthday || null };
    }
    return readStore().profiles[user.id] || defaultProfile(user);
  },
  async saveProfile(user, fields) {
    const { birthday, ...publicFields } = fields;
    const record = { ...publicFields, id: user.id, username: user.username, updated_at: new Date().toISOString() };
    if (isOnlineMode) {
      const [{ data, error }, { error: privateError }] = await Promise.all([
        supabase.from('profiles').upsert(record, { onConflict: 'id' }).select('*').single(),
        supabase.from('profile_private_details').upsert({ id: user.id, birthday: birthday || null, updated_at: new Date().toISOString() }, { onConflict: 'id' }),
      ]);
      if (error) throw error;
      if (privateError) throw privateError;
      return { ...data, birthday: birthday || null };
    }
    const store = readStore();
    store.profiles[user.id] = { ...(store.profiles[user.id] || defaultProfile(user)), ...record, birthday: birthday || null };
    writeStore(store);
    return store.profiles[user.id];
  },
  async getCandidates(user) {
    if (isOnlineMode) {
      const [{ data: profiles, error: pErr }, { data: swipes, error: sErr }] = await Promise.all([
        supabase.from('profiles').select('*').neq('id', user.id).order('created_at', { ascending: false }).limit(500),
        supabase.from('swipes').select('to_user').eq('from_user', user.id),
      ]);
      if (pErr) throw pErr;
      if (sErr) throw sErr;
      const seen = new Set((swipes || []).map(s => s.to_user));
      return (profiles || []).filter(p => !seen.has(p.id) && Number(p.age) >= 18);
    }
    const store = readStore();
    const seen = new Set(store.swipes.filter(s => s.from_user === user.id).map(s => s.to_user));
    return Object.values(store.profiles).filter(p => p.id !== user.id && !seen.has(p.id) && Number(p.age) >= 18);
  },
  async swipe(user, target, liked) {
    if (isOnlineMode) {
      const { data, error } = await supabase.rpc('record_swipe', { p_target_user: target.id, p_liked: liked });
      if (error) throw error;
      return data || { matched: false };
    }
    const store = readStore();
    const old = store.swipes.find(s => s.from_user === user.id && s.to_user === target.id);
    if (old) { old.liked = liked; old.created_at = new Date().toISOString(); }
    else store.swipes.push({ from_user: user.id, to_user: target.id, liked, created_at: new Date().toISOString() });
    let match = null;
    if (liked && target.demoLikesBack) {
      match = store.matches.find(m => (m.user_a === user.id && m.user_b === target.id) || (m.user_a === target.id && m.user_b === user.id));
      if (!match) {
        match = { id: `match-${crypto.randomUUID()}`, user_a: [user.id, target.id].sort()[0], user_b: [user.id, target.id].sort()[1], created_at: new Date().toISOString() };
        store.matches.push(match);
      }
    }
    writeStore(store);
    return { matched: Boolean(match), match_id: match?.id };
  },
  async getLikes(user) {
    if (isOnlineMode) {
      const { data: swipes, error } = await supabase.from('swipes').select('to_user,created_at').eq('from_user', user.id).eq('liked', true).order('created_at', { ascending: false });
      if (error) throw error;
      const ids = (swipes || []).map(s => s.to_user);
      if (!ids.length) return [];
      const { data, error: pErr } = await supabase.from('profiles').select('*').in('id', ids);
      if (pErr) throw pErr;
      const map = new Map((data || []).map(p => [p.id, p]));
      return ids.map(id => map.get(id)).filter(Boolean);
    }
    const store = readStore();
    return store.swipes.filter(s => s.from_user === user.id && s.liked).sort((a,b) => b.created_at.localeCompare(a.created_at)).map(s => store.profiles[s.to_user]).filter(Boolean);
  },
  async getMatches(user) {
    if (isOnlineMode) {
      const { data: rows, error } = await supabase.from('matches').select('*').or(`user_a.eq.${user.id},user_b.eq.${user.id}`).order('created_at', { ascending: false });
      if (error) throw error;
      const otherIds = (rows || []).map(m => m.user_a === user.id ? m.user_b : m.user_a);
      if (!otherIds.length) return [];
      const { data: people, error: pe } = await supabase.from('profiles').select('*').in('id', otherIds);
      if (pe) throw pe;
      const peopleMap = new Map((people || []).map(p => [p.id, p]));
      return rows.map(m => ({ ...m, person: peopleMap.get(m.user_a === user.id ? m.user_b : m.user_a) })).filter(m => m.person);
    }
    const store = readStore();
    return store.matches.filter(m => m.user_a === user.id || m.user_b === user.id).sort((a,b) => b.created_at.localeCompare(a.created_at)).map(m => ({ ...m, person: store.profiles[m.user_a === user.id ? m.user_b : m.user_a] })).filter(m => m.person);
  },
  async getMessages(user, matchId) {
    if (isOnlineMode) {
      const { data, error } = await supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true }).limit(500);
      if (error) throw error;
      return Promise.all((data || []).map(async m => {
        let image_url = null;
        if (m.image_path) {
          const { data: signed } = await supabase.storage.from('chat-media').createSignedUrl(m.image_path, 3600);
          image_url = signed?.signedUrl || null;
        }
        return { ...m, image_url };
      }));
    }
    return readStore().messages.filter(m => m.match_id === matchId).sort((a,b) => a.created_at.localeCompare(b.created_at));
  },
  async sendMessage(user, match, receiverId, body, imageFile) {
    let image_path = null;
    if (isOnlineMode) {
      if (imageFile) {
        const ext = (imageFile.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        image_path = `${match.id}/${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('chat-media').upload(image_path, imageFile, { contentType: imageFile.type || 'image/jpeg', upsert: false });
        if (upErr) throw upErr;
      }
      const { data, error } = await supabase.from('messages').insert({ match_id: match.id, sender_id: user.id, recipient_id: receiverId, body: body.trim() || null, image_path }).select('*').single();
      if (error) throw error;
      let image_url = null;
      if (image_path) { const { data: signed } = await supabase.storage.from('chat-media').createSignedUrl(image_path, 3600); image_url = signed?.signedUrl || null; }
      return { ...data, image_url };
    }
    const store = readStore();
    let image_url = null;
    if (imageFile) image_url = await fileToDataUrl(imageFile);
    const message = { id: `msg-${crypto.randomUUID()}`, match_id: match.id, sender_id: user.id, recipient_id: receiverId, body: body.trim() || null, image_path: image_url, image_url, created_at: new Date().toISOString() };
    store.messages.push(message);
    writeStore(store);
    return message;
  },
  subscribeMessages(matchId, callback) {
    if (!isOnlineMode) return () => {};
    const channel = supabase.channel(`bcfachat-message-${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, callback)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
  async uploadProfilePhoto(user, file) {
    if (isOnlineMode) {
      const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('profile-media').upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('profile-media').getPublicUrl(path);
      return data.publicUrl;
    }
    return await fileToDataUrl(file);
  },
  async deleteProfilePhoto(user, urlToDelete, photos) {
    if (isOnlineMode && urlToDelete) {
      const marker = '/storage/v1/object/public/profile-media/';
      const path = urlToDelete.includes(marker) ? decodeURIComponent(urlToDelete.split(marker)[1]) : null;
      if (path?.startsWith(`${user.id}/`)) await supabase.storage.from('profile-media').remove([path]);
    }
    return photos.filter(p => p !== urlToDelete);
  }
};
