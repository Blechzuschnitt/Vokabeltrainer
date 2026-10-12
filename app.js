(() => {
"use strict";
const $ = id => document.getElementById(id);
const todayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
const dayDiff = (a, b) => Math.round((new Date(b + "T12:00") - new Date(a + "T12:00")) / 864e5);
const addDays = (k, n) => { const d = new Date(k + "T12:00"); d.setDate(d.getDate() + n); return todayKey(d); };
const uid = () => Math.random().toString(36).slice(2, 10);
const LS_KEY = "vokabel-klasse-v1";
const CRYSTAL = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 6-7 14-7-14z" fill="var(--crystal)"/><path d="M5 8h14l-7 14z" fill="#0d8db0" opacity=".35"/><path d="M12 2l3 6H9z" fill="#fff" opacity=".55"/></svg>`;

/* ---------- Startliste: Unit 1 bis Station 1 (S. 232) ---------- */
const SEED_SET = "Unit 1 – bis Station 1";
const SEED = [
 ["it's (= it is)","er/sie/es ist","Kurz für zwei Wörter: So beginnst du, wenn du sagst, wie ein Ding gerade ist.",2],
 ["OK","okay","Das sagst du, wenn du einverstanden bist und alles passt.",2],
 ["tutor","Klassenlehrer/in","Die Lehrkraft, die für deine ganze Klasse zuständig ist.",2],
 ["Mr","Herr (Anrede)","Kurze Anrede vor dem Nachnamen eines Mannes.",2],
 ["he's (= he is)","er ist","Kurz für zwei Wörter: So beschreibst du einen Jungen oder Mann.",2],
 ["a","ein/eine","Ganz kurzes Wort vor einem Nomen, wenn es irgendeins ist.",2],
 ["science","Wissenschaft; Naturwissenschaft","Schulfach mit Experimenten zu Pflanzen, Tieren und Stoffen.",1],
 ["teacher","Lehrer/in","Diese Person steht vorne und bringt euch etwas bei.",2],
 ["English","Englisch; englisch; aus England","Die Sprache, die man in London spricht.",2],
 ["Mrs","Frau (Anrede)","Kurze Anrede vor dem Nachnamen einer verheirateten Frau.",2],
 ["she's (= she is)","sie ist","Kurz für zwei Wörter: So beschreibst du ein Mädchen oder eine Frau.",1],
 ["caretaker","Hausmeister/in","Die Person, die in der Schule Dinge repariert und aufpasst.",1],
 ["always","immer","Jedes Mal, ohne Ausnahme. Das Gegenteil von nie.",2],
 ["busy","beschäftigt; belebt; arbeitsreich","So ist jemand, der gerade viel zu tun und keine Zeit hat.",1],
 ["friend","Freund/in","Ein Mensch, den du magst und mit dem du gern Zeit verbringst.",2],
 ["new","neu","Gerade erst gekauft oder gerade erst angekommen. Gegenteil von alt.",2],
 ["class","Klasse; Unterricht; Kurs; Unterrichtsstunde","Alle Kinder, die zusammen in einem Raum lernen.",1],
 ["cool","cool; super; kühl","Damit sagst du, dass etwas toll ist. Es kann auch leicht kalt bedeuten.",1],
 ["music","Musik","Lieder und Töne, die man hört oder mit Instrumenten macht.",2],
 ["at","in; an; um; bei; auf","Kleines Wort für Ort oder Uhrzeit: Wir treffen uns ___ 8 Uhr.",1],
 ["Good morning.","Guten Morgen.","Das sagst du zur Begrüßung, wenn der Tag gerade anfängt.",1],
 ["boy","Junge","Ein Kind, das später ein Mann wird.",2],
 ["girl","Mädchen","Ein Kind, das später eine Frau wird.",2],
 ["to look at","anschauen","Etwas mit den Augen genau betrachten.",1],
 ["board","Tafel","Daran schreibt die Lehrkraft mit Kreide oder Stift.",2],
 ["Can you help me?","Können Sie mir helfen?; Kannst du mir helfen?","So fragst du, wenn du Unterstützung brauchst.",2],
 ["yes","ja","Das Gegenteil von nein.",2],
 ["of course","natürlich; selbstverständlich","Das sagst du, wenn etwas klar ist und gar keine Frage.",1],
 ["to sit down","sich hinsetzen; sich setzen","Vom Stehen auf einen Stuhl wechseln.",2],
 ["to be","sein","Das wichtigste Verb überhaupt. Seine Formen sind am, is und are.",2],
 ["quiet","ruhig; leise; still","So ist es, wenn niemand redet und kein Lärm ist.",2],
];
function seedState(){
  return {
    v:3, points:0, streak:{count:0,best:0,last:null}, days:[], history:[],
    prefs:{dir:"mix",level:"normal",set:null}, played:false,
    words: SEED.map(([en,de,hint]) => ({id:uid(),en,de,hint,set:SEED_SET,right:0,wrong:0,last:null,added:todayKey()}))
  };
}

const ART = {"fox": "assets/fox.webp", "turtle": "assets/turtle.webp", "owl": "assets/owl.webp", "dragon": "assets/dragon.webp", "joker": "assets/joker.webp", "double": "assets/double.webp", "shield": "assets/shield.webp"};
/* ---------- Shop-Katalog ---------- */
const POWERUPS = {
  joker:{name:"Joker", cost:8, desc:"Ein Wort in der Runde zählt sofort als richtig (+3 XP).", color:"var(--grape)",
    icon:`<img src="${ART.joker}" alt="">`},
  double:{name:"Doppel-XP", cost:15, desc:"Alle XP der nächsten Runde zählen doppelt.", color:"var(--sun)",
    icon:`<img src="${ART.double}" alt="">`},
  shield:{name:"Flammenschild", cost:20, desc:"Rettet deine Streak, wenn du einen Tag verpasst. Wird automatisch eingesetzt.", color:"var(--coral)",
    icon:`<img src="${ART.shield}" alt="">`},
};
const PETS = {
  fox:{name:"Flitz", kind:"Fuchs", cost:30, bonus:"Bei jeder 3er-Serie +1 Bonus-XP."},
  turtle:{name:"Tilda", kind:"Schildkröte", cost:35, bonus:"Der erste Buchstabe als Hilfe kostet keine Punkte."},
  owl:{name:"Ola", kind:"Eule", cost:40, bonus:"Im Modus „Schwer“ +1 Bonus-XP pro richtigem Wort."},
  dragon:{name:"Funki", kind:"Drache", cost:50, bonus:"+5 Bonus-XP für jede fertige Runde."},
};
function mascotSvg(){
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6c14 0 24 10 24 24 0 16-10 28-24 28S8 46 8 30C8 16 18 6 32 6z" fill="var(--sky)"/><path d="M20 4l6 9-9 1z" fill="var(--sun)"/><circle cx="24" cy="30" r="7" fill="#fff"/><circle cx="40" cy="30" r="7" fill="#fff"/><circle cx="25.5" cy="31" r="3.6" fill="#1a1f3a"/><circle cx="41.5" cy="31" r="3.6" fill="#1a1f3a"/><circle cx="26.6" cy="29.8" r="1.2" fill="#fff"/><circle cx="42.6" cy="29.8" r="1.2" fill="#fff"/><path d="M25 42q7 7 14 0" stroke="#1a1f3a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="17" cy="39" r="3.5" fill="var(--coral)" opacity=".5"/><circle cx="47" cy="39" r="3.5" fill="var(--coral)" opacity=".5"/></svg>`;
}
function petSvg(k){
  if (ART[k]) return `<img src="${ART[k]}" alt="" class="petimg">`;
  const eye = (x, y, r = 3.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1a1f3a"/><circle cx="${x+1.2}" cy="${y-1.2}" r="1.2" fill="#fff"/>`;
  if (k === "fox") return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 8l14 16-16 5z" fill="#ff7a2f"/><path d="M52 8L38 24l16 5z" fill="#ff7a2f"/><path d="M15 13l7 9-8 3z" fill="#ffd2b0"/><path d="M49 13l-7 9 8 3z" fill="#ffd2b0"/><circle cx="32" cy="36" r="22" fill="#ff8a3d"/><path d="M12 38q20 30 40 0q-20 12-40 0z" fill="#fff6ec"/>${eye(24,33)}${eye(40,33)}<ellipse cx="32" cy="43" rx="3.2" ry="2.4" fill="#1a1f3a"/></svg>`;
  if (k === "owl") return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 10l10 10H12z" fill="#7449e8"/><path d="M50 10L40 20h12z" fill="#7449e8"/><ellipse cx="32" cy="37" rx="21" ry="23" fill="#8a5cff"/><ellipse cx="32" cy="46" rx="12" ry="12" fill="#c9b5ff"/><circle cx="24" cy="31" r="8" fill="#fff"/><circle cx="40" cy="31" r="8" fill="#fff"/>${eye(24,31,4)}${eye(40,31,4)}<path d="M29 38h6l-3 5z" fill="#ffbf1f"/></svg>`;
  if (k === "dragon") return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 34q-4-14 10-16l2 12z" fill="#0f9e7b"/><path d="M56 34q4-14-10-16l-2 12z" fill="#0f9e7b"/><path d="M21 12l4 10-8-2z" fill="#ffbf1f"/><path d="M43 12l-4 10 8-2z" fill="#ffbf1f"/><circle cx="32" cy="36" r="21" fill="#14b892"/><ellipse cx="32" cy="45" rx="12" ry="9" fill="#a6f0d8"/>${eye(24,32)}${eye(40,32)}<circle cx="29" cy="43" r="1.5" fill="#0c6e56"/><circle cx="35" cy="43" r="1.5" fill="#0c6e56"/></svg>`;
  if (k === "turtle") return `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="42" rx="24" ry="16" fill="#2a8f6a"/><path d="M14 42q18-28 36 0z" fill="#3cc28d"/><path d="M24 30l8-5 8 5-3 9h-10z" fill="#2a8f6a" opacity=".6"/><circle cx="32" cy="22" r="12" fill="#7fe0b8"/>${eye(27,21,3)}${eye(37,21,3)}<path d="M28 27q4 3 8 0" stroke="#1a1f3a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  return "";
}

/* ---------- Speicher: Supabase (EU) mit Browser-Kopie für offline ---------- */
const SB_URL = "https://kkohrbawvnixqawwhwjz.supabase.co", SB_KEY = "sb_publishable_EIkJPGDka-PZBeDRRlgyYw_SixYiu7V";
const SES_KEY = "vokabel-klasse-session", PRO_KEY = "vokabel-klasse-profil", DIRTY_KEY = "vokabel-klasse-offen", SYNCED_KEY = "vokabel-klasse-abgeglichen",
  AV_KEY = "vokabel-klasse-avatar", XPQ_KEY = "vokabel-klasse-runden", LB_KEY = "vokabel-klasse-rangliste";
let S = null, saveTimer = null, SESSION = null, PROFILE = null;
const jget = k => { try{ const t = localStorage.getItem(k); return t ? JSON.parse(t) : null; }catch(e){ return null; } };
const jset = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
const lsGet = () => jget(LS_KEY), lsSet = obj => jset(LS_KEY, obj);
const clone = o => JSON.parse(JSON.stringify(o));
const nick = () => (PROFILE && PROFILE.nickname) || "du";
// Kleiner Supabase-Client ohne Bibliothek: anonyme Anmeldung, Token erneuern, REST und RPC
let refreshing = null;
async function sbAuth(path, body){
  const r = await fetch(SB_URL + "/auth/v1/" + path, {method:"POST", headers:{apikey:SB_KEY, "Content-Type":"application/json"}, body:JSON.stringify(body)});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.msg || j.error_description || "auth"), {status:r.status, code:j.error_code});
  SESSION = {access:j.access_token, refresh:j.refresh_token, exp:Date.now() + (j.expires_in || 3600) * 1000, uid:j.user.id};
  jset(SES_KEY, SESSION); return SESSION;
}
async function sbToken(){
  if (!SESSION) throw new Error("no-session");
  if (SESSION.exp - Date.now() > 60000) return SESSION.access;
  refreshing = refreshing || sbAuth("token?grant_type=refresh_token", {refresh_token:SESSION.refresh}).finally(() => { refreshing = null; });
  return (await refreshing).access;
}
async function sb(path, opt = {}){
  const r = await fetch(SB_URL + "/rest/v1/" + path, {method:opt.method || "GET", body:opt.body ? JSON.stringify(opt.body) : undefined,
    headers:Object.assign({apikey:SB_KEY, Authorization:"Bearer " + await sbToken(), "Content-Type":"application/json"}, opt.headers || {})});
  const txt = await r.text(), j = txt ? JSON.parse(txt) : null;
  if (!r.ok) throw Object.assign(new Error((j && j.message) || "rest"), {status:r.status});
  return j;
}
/* Admin-Modus: BASE ist der echte Spielstand. Solange er aktiv ist, wird nur die Vokabelliste
   (Wörter, Bedeutungen, Umschreibungen, Listen) und die Darstellung übernommen, nie Fortschritt. */
let ADMIN = false, BASE = null;
// Jede Änderung landet sofort im Browser und kurz danach online. rev (Zeitstempel) entscheidet beim Abgleich, welcher Stand neuer ist.
function persist(obj){
  obj.rev = Date.now(); lsSet(obj); jset(DIRTY_KEY, true);
  clearTimeout(saveTimer); saveTimer = setTimeout(push, 1500);
}
async function push(){
  clearTimeout(saveTimer);
  if (!SESSION || !PROFILE || !jget(DIRTY_KEY)) return;
  const obj = lsGet(); if (!obj) return;
  try{
    await sb("game_state?on_conflict=player_id", {method:"POST", headers:{Prefer:"resolution=merge-duplicates,return=minimal"}, body:{player_id:PROFILE.player_id, state:obj, updated_at:new Date().toISOString()}});
    if ((lsGet() || {}).rev === obj.rev) jset(DIRTY_KEY, false);
    const av = JSON.stringify({pet:obj.pet || null, outfit:(obj.pet && obj.outfits && obj.outfits[obj.pet]) || {}});
    if (av !== jget(AV_KEY)){ await sb("players?id=eq." + PROFILE.player_id, {method:"PATCH", headers:{Prefer:"return=minimal"}, body:{avatar:JSON.parse(av)}}); jset(AV_KEY, av); }
    setStorage("db");
  }catch(e){ setStorage("local"); }
}
// Holt den Online-Stand, wenn er neuer ist (zweites Gerät), sonst wird der eigene hochgeladen
async function pull(){
  if (!SESSION || !PROFILE || ADMIN || Q) return;
  try{
    const rows = await sb("game_state?select=state&player_id=eq." + PROFILE.player_id), remote = rows[0] && rows[0].state, first = !jget(SYNCED_KEY);
    if (remote && Array.isArray(remote.words) && (first || (remote.rev || 0) > (S.rev || 0))){
      S = remote; normalizeState(); lsSet(S); jset(DIRTY_KEY, false); applyTheme(); renderAll();
    } else if (!remote || (S.rev || 0) > (remote.rev || 0)){ if (!S.rev) S.rev = Date.now(); lsSet(S); jset(DIRTY_KEY, true); await push(); }
    jset(SYNCED_KEY, true); setStorage("db"); await syncClass(); loadLB();
  }catch(e){ setStorage("local"); }
}
// Spitzname und Klassen-Listen vom Server holen. Wurde das Kind entfernt, geht es zurück zur Anmeldung.
async function syncClass(){
  const me = await sb("players?select=nickname&id=eq." + PROFILE.player_id);
  if (!me.length){
    [PRO_KEY, SYNCED_KEY, DIRTY_KEY, LB_KEY, AV_KEY, XPQ_KEY].forEach(k => { try{ localStorage.removeItem(k); }catch(e){} });
    PROFILE = null; LB = null; $("join").hidden = false; $("joinErr").textContent = "Du bist nicht mehr in der Klasse angemeldet. Melde dich neu an."; $("joinErr").hidden = false; return;
  }
  if (me[0].nickname !== PROFILE.nickname){ PROFILE.nickname = me[0].nickname; jset(PRO_KEY, PROFILE); renderAll(); }
  const lists = await sb("word_lists?select=id,name,words,created_at&order=created_at.asc"), byId = new Map(lists.map(l => [l.id, l]));
  let changed = false, fresh = "";
  const keep = S.words.filter(w => !w.src || (byId.has(w.src) && byId.get(w.src).words.some(x => x.k === w.k)));
  if (keep.length !== S.words.length){ S.words = keep; changed = true; }
  for (const l of lists){
    const had = S.words.some(w => w.src === l.id);
    for (const x of l.words){
      const w = S.words.find(w => w.src === l.id && w.k === x.k);
      if (!w){ S.words.push({id:uid(), en:x.en, de:x.de, hint:x.hint || "", set:l.name, right:0, wrong:0, last:null, added:todayKey(new Date(l.created_at)), src:l.id, k:x.k}); changed = true; if (!had) fresh = l.name; }
      else if (w.en !== x.en || w.de !== x.de || w.set !== l.name || (x.hint && w.hint !== x.hint)){ Object.assign(w, {en:x.en, de:x.de, set:l.name, hint:x.hint || w.hint}); changed = true; }
    }
  }
  if (changed){ save(); renderAll(); if (fresh) toast(`Neue Liste von deiner Klasse: ${fresh}`); }
}
function save(){
  if (!ADMIN){ persist(S); return; }
  const real = clone(BASE), byId = new Map(BASE.words.map(w => [w.id, w]));
  real.words = S.words.map(w => { const b = byId.get(w.id);
    return b ? Object.assign(clone(b), {en:w.en, de:w.de, hint:w.hint, set:w.set})
             : Object.assign(clone(w), {right:0, wrong:0, last:null}); });
  real.settings = clone(S.settings);
  BASE = real; persist(real);
}
function setStorage(mode){
  $("storageNote").textContent = mode === "db" ? `Online gespeichert · ${PROFILE ? PROFILE.class_name : ""}`
    : mode === "local" ? "Gerade offline. Dein Stand liegt auf diesem Gerät und wird später abgeglichen." : "";
}
function normalizeState(){
  S.prefs = Object.assign({dir:"mix",level:"normal",set:null}, S.prefs||{});
  if (S.prefs.set && S.prefs.set.startsWith("__")) S.prefs.set = null;
  S.streak = Object.assign({count:0,best:0,last:null}, S.streak||{});
  S.days = S.days || []; S.words = S.words || []; S.points = S.points || 0; S.history = S.history || [];
  if (typeof S.coins !== "number") S.coins = (levelOf(S.points) - 1) * 10;
  S.inv = Object.assign({joker:0, double:0, shield:0}, S.inv||{});
  S.armed = Object.assign({double:false}, S.armed||{});
  S.pets = S.pets || []; if (S.pet && !S.pets.includes(S.pet)) S.pet = null;
  S.settings = Object.assign({theme:"auto", sound:true, vib:true}, S.settings||{});
  S.wardrobe = S.wardrobe || []; S.outfits = S.outfits || {};
}

/* ---------- Einstellungen, Töne, Vibration ---------- */
const hostTheme = document.documentElement.getAttribute("data-theme");
function applyTheme(){
  const t = S.settings.theme, el = document.documentElement;
  if (t === "light" || t === "dark") el.setAttribute("data-theme", t);
  else if (hostTheme) el.setAttribute("data-theme", hostTheme);
  else el.removeAttribute("data-theme");
}
const canVibrate = typeof navigator.vibrate === "function";
let actx = null;
function audio(){
  if (!actx){ try{ actx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return null; } }
  if (actx.state === "suspended") actx.resume().catch(() => {});
  return actx;
}
function tone(freq, start, dur, type = "sine", vol = .18, slideTo){
  const a = audio(); if (!a) return;
  const t0 = a.currentTime + start, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + .05);
}
const SOUNDS = {
  right:  () => { tone(660, 0, .14, "triangle"); tone(990, .09, .22, "triangle"); },
  perfect:() => { tone(784, 0, .12, "triangle"); tone(1047, .08, .12, "triangle"); tone(1319, .16, .26, "triangle"); },
  wrong:  () => { tone(220, 0, .22, "square", .07, 150); },
  letter: () => { tone(520, 0, .07, "sine", .12); },
  reveal: () => { tone(392, 0, .16, "sine", .12); tone(330, .12, .24, "sine", .12); },
  level:  () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .08, .22, "triangle", .16)); },
  coin:   () => { tone(988, 0, .08, "square", .06); tone(1319, .07, .2, "square", .06); },
  finish: () => { [392, 523, 659].forEach((f, i) => tone(f, i * .1, .3, "triangle", .14)); tone(784, .32, .45, "triangle", .14); },
  tap:    () => { tone(700, 0, .04, "sine", .06); },
};
const BUZZ = { right:25, perfect:[20,40,20], wrong:[70,50,70], level:[40,40,40,40,160], coin:30, finish:[30,60,90] };
function fx(name){
  if (S.settings.sound && SOUNDS[name]) { try{ SOUNDS[name](); }catch(e){} }
  if (S.settings.vib && canVibrate && BUZZ[name]) { try{ navigator.vibrate(BUZZ[name]); }catch(e){} }
}
function renderSettings(){
  $("devRow").hidden = !(PROFILE && PROFILE.device_code); $("devCode").textContent = (PROFILE && PROFILE.device_code) || "";
  $("whoRow").textContent = PROFILE ? `${PROFILE.nickname} · ${PROFILE.class_name}` : "";
  document.querySelectorAll("#themeSeg button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === S.settings.theme));
  $("swSound").setAttribute("aria-checked", !!S.settings.sound);
  $("swVib").setAttribute("aria-checked", canVibrate && !!S.settings.vib);
  $("swVib").disabled = !canVibrate;
  $("vibNote").textContent = canVibrate ? "Kurzes Brummen bei Antworten" : "Dieses Gerät oder dieser Browser kann nicht vibrieren";
}
$("gearBtn").onclick = () => { renderSettings(); renderAdmin(); $("adminForm").hidden = true; $("settings").hidden = false; };
$("setClose").onclick = () => { $("settings").hidden = true; };
$("settings").addEventListener("click", e => { if (e.target === $("settings")) $("settings").hidden = true; });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("settings").hidden = true; });
$("themeSeg").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.settings.theme = b.dataset.v; applyTheme(); save(); renderSettings(); fx("tap"); };
$("swSound").onclick = () => { S.settings.sound = !S.settings.sound; save(); renderSettings(); if (S.settings.sound) fx("tap"); };
$("swVib").onclick = () => { S.settings.vib = !S.settings.vib; save(); renderSettings(); if (S.settings.vib && canVibrate) navigator.vibrate(40); };
$("setTest").onclick = () => fx("perfect");
/* ---------- Belohnungs-Vorschau ---------- */
function renderRewards(){
  const lvl = levelOf(S.points), into = S.points % XP_PER_LEVEL, need = XP_PER_LEVEL - into;
  $("rewNext").innerHTML = `<div class="lv">${lvl + 1}</div><div style="flex:1;min-width:0"><b>Noch ${need} XP bis Level ${lvl + 1}</b><p>Belohnung: +${COINS_PER_LEVEL} Kristalle${rankOf(lvl + 1)[0] === lvl + 1 ? ` und der Rang „${rankOf(lvl + 1)[1]}“` : ""}</p><span class="bar"><i style="width:${into / XP_PER_LEVEL * 100}%"></i></span></div>`;
  const items = [...Object.entries(POWERUPS).map(([k, p]) => ({k:"p:" + k, name:p.name, cost:p.cost, have:false})),
                 ...Object.entries(PETS).map(([k, p]) => ({k:"pet:" + k, name:`${p.kind} ${p.name}`, cost:p.cost, have:S.pets.includes(k)}))].filter(i => !i.have);
  const shown = new Set(); let html = "";
  for (let L = lvl + 1; L <= lvl + 8; L++){
    const xp = (L - 1) * XP_PER_LEVEL - S.points, coins = S.coins + (L - lvl) * COINS_PER_LEVEL;
    const r = rankOf(L), newRank = r[0] === L;
    const buy = items.filter(i => !shown.has(i.k) && i.cost <= coins && i.cost > S.coins);
    buy.forEach(i => shown.add(i.k));
    html += `<li><div class="lv">${L}</div><div class="t">+${COINS_PER_LEVEL} Kristalle<small>noch ${xp} XP · dann ${coins} Kristalle</small>
      <div class="chips">${newRank ? `<span class="chip rank" style="background:${r[2]}">Neuer Rang: ${esc(r[1])}</span>` : ""}${buy.map(i => `<span class="chip buy">${CRYSTAL}${esc(i.name)} leistbar</span>`).join("")}</div></div></li>`;
  }
  $("rewList").innerHTML = html;
}
$("rewBtn").onclick = () => { renderRewards(); $("rewards").hidden = false; fx("tap"); };
$("rewClose").onclick = () => { $("rewards").hidden = true; };
$("rewards").addEventListener("click", e => { if (e.target === $("rewards")) $("rewards").hidden = true; });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("rewards").hidden = true; });
const ADMIN_HASH = "556d2cf2ed73931531c37a5ce27c3afb4df4b8794ddfcf4e8c0e5f65435e2fc1";
async function sha256(t){
  try{ const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,"0")).join(""); }
  catch(e){ return null; }
}
function renderAdmin(){
  $("swAdmin").setAttribute("aria-checked", ADMIN);
  $("adminTools").hidden = !ADMIN;
  $("adminBar").hidden = !ADMIN;
  if (ADMIN) $("adminForm").hidden = true;
}
function setAdmin(on){
  if (on === ADMIN) return;
  if (on){ BASE = clone(S); ADMIN = true; toast("Test-Modus an"); }
  else { clearTimeout(saveTimer); S = clone(BASE); BASE = null; ADMIN = false; Q = null; R = null; W = null; view = "home"; normalizeState(); applyTheme(); toast("Test-Modus aus. Alles wie vorher."); }
  renderAdmin(); renderAll();
}
$("swAdmin").onclick = () => {
  if (ADMIN){ setAdmin(false); return; }
  const f = $("adminForm"); f.hidden = !f.hidden; $("adminErr").hidden = true; $("adminCode").value = "";
  if (!f.hidden) $("adminCode").focus();
};
$("adminForm").onsubmit = async e => {
  e.preventDefault();
  const code = $("adminCode").value.trim(), h = await sha256(code);
  if (h ? h === ADMIN_HASH : code === "1019" + "30"){ $("adminCode").value = ""; setAdmin(true); }
  else { $("adminErr").hidden = false; fx("wrong"); $("adminCode").select(); }
};
$("adminOff").onclick = () => setAdmin(false);
$("admImport").onclick = () => { const b = $("importBox"); b.hidden = !b.hidden; $("importMsg").textContent = ""; if (!b.hidden) $("importText").focus(); };
$("importGo").onclick = () => {
  let o = null; try{ o = JSON.parse($("importText").value); }catch(e){}
  if (!o || !Array.isArray(o.words)){ $("importMsg").textContent = "Das ist kein gültiger Spielstand."; fx("wrong"); return; }
  delete o.outbox; delete o.streakBrokenSent;
  S = o; normalizeState(); BASE = clone(S); persist(S); applyTheme(); renderAll();
  $("importText").value = ""; $("importBox").hidden = true; toast(`Spielstand übernommen: ${S.words.length} Wörter, ${S.points} XP`);
};
$("admCoins").onclick = () => { S.coins += 100; renderTop(); if (tab === "shop") renderShop(); toast("+100 Kristalle (Test)"); };
$("admXP").onclick = () => { addXP(50); renderTop(); if (tab === "dash") renderDash(); };
$("admStreak").onclick = () => { const s = S.streak; s.count = (currentStreak() || 0) + 1; s.last = todayKey(); s.best = Math.max(s.best, s.count); if (!S.days.includes(s.last)) S.days.push(s.last); renderDash(); toast("Streak +1 (Test)"); };
let shieldNote = "";
function applyShields(){
  const s = S.streak; if (!s.last || s.count < 1) return;
  const missed = dayDiff(s.last, todayKey()) - 1;
  if (missed >= 1 && S.inv.shield >= missed){
    S.inv.shield -= missed; s.last = addDays(todayKey(), -1);
    shieldNote = missed === 1 ? "Dein Flammenschild hat gestern deine Streak gerettet!" : `${missed} Flammenschilde haben deine Streak gerettet!`;
    logEvent("shield", "Flammenschild hat die Streak gerettet", [`Verpasste Tage: ${missed}`, `Streak: ${s.count} Tage`, `Übrige Flammenschilde: ${S.inv.shield}`]);
    save();
  }
}

/* ---------- Level, XP, Kristalle ---------- */
const XP_PER_LEVEL = 50, COINS_PER_LEVEL = 10, DAY_GOAL = 30;
const RANKS = [[1,"Anfänger","#c7d0ff"],[3,"Entdecker","#a6f0d8"],[5,"Profi","#ffd166"],[8,"Champion","#ffb4b6"],[12,"Legende","#7ff0ff"],[18,"Meister","#d6c4ff"]];
const levelOf = p => Math.floor(p / XP_PER_LEVEL) + 1;
const rankOf = l => RANKS.filter(r => l >= r[0]).pop();
let levelUps = [];
function addXP(n){
  if (!n) return;
  const before = levelOf(S.points); S.points += n; const after = levelOf(S.points);
  if (after > before){ const c = (after - before) * COINS_PER_LEVEL; S.coins += c; levelUps.push({level:after, coins:c}); toast(`Level ${after}! +${c} Kristalle`); setTimeout(() => fx("level"), 250); bump("lvBadge"); bump("coinBtn"); }
  if (Q) Q.xp += n;
}
function bump(id){ const e = $(id); e.classList.remove("bump"); void e.offsetWidth; e.classList.add("bump"); }
function renderTop(){
  const lvl = levelOf(S.points), r = rankOf(lvl), into = S.points % XP_PER_LEVEL;
  $("lvlNum").textContent = lvl; $("rank").textContent = r[1]; $("rank").style.background = r[2];
  $("xpBar").style.width = (into / XP_PER_LEVEL * 100) + "%";
  $("xpNow").textContent = S.points; $("xpNext").textContent = `· noch ${XP_PER_LEVEL - into}`;
  $("coinNum").textContent = S.coins;
}
$("coinBtn").onclick = () => setTab("shop");

/* ---------- Ereignisse ---------- */
// In Noahs Version gingen diese Meldungen als Abendbericht an Papa. Die Klassen-App verschickt nichts.
function logEvent(type, subject, lines){}
function checkStreakBroken(){
  const s = S.streak; if (!s.last || s.count < 1) return;
  const gap = dayDiff(s.last, todayKey());
  if (gap >= 2 && S.streakBrokenSent !== s.last){
    S.streakBrokenSent = s.last;
    logEvent("streak", `Streak ist abgerissen (${s.count} ${s.count === 1 ? "Tag" : "Tage"})`,
      [`Die Flamme stand bei ${s.count} ${s.count === 1 ? "Tag" : "Tagen"} in Folge.`, `Zuletzt geübt am ${new Date(s.last + "T12:00").toLocaleDateString("de-DE")}.`, `Verpasste Tage: ${gap - 1}`, `Rekord: ${s.best} Tage`, `Flammenschilde im Rucksack: ${S.inv.shield}`]);
    save();
  }
}

/* ---------- Start: Spielstand laden, anmelden, abgleichen ---------- */
S = lsGet() || seedState();
normalizeState(); applyTheme(); applyShields();
function initStore(){
  SESSION = jget(SES_KEY); PROFILE = jget(PRO_KEY);
  if (!SESSION || !PROFILE){ $("join").hidden = false; setTimeout(() => $("joinNick").focus(), 50); return; }
  renderAll(); pull();
}
let joinMode = "new";
const JOIN_ERR = {DEVICE_CODE:"Diesen Geräte-Code gibt es nicht. Prüfe ihn nochmal Zeichen für Zeichen.", CODE:"Diesen Klassen-Code gibt es nicht. Schau nochmal genau hin.", NAME_TAKEN:"Diesen Spitznamen gibt es in deiner Klasse schon. Nimm einen anderen.", NAME_LEN:"Dein Spitzname braucht 2 bis 16 Zeichen."};
$("joinForm").onsubmit = async e => {
  e.preventDefault();
  const name = $("joinNick").value.trim().replace(/\s+/g, " "), code = $("joinCode").value.trim().toUpperCase(), btn = $("joinBtn");
  const fail = m => { $("joinErr").textContent = m; $("joinErr").hidden = false; btn.disabled = false; btn.textContent = "Los geht’s"; };
  const dev = $("joinDev").value.replace(/[^0-9a-z]/gi, "");
  if (joinMode === "old"){ if (dev.length !== 12) return fail("Der Geräte-Code hat 12 Zeichen."); }
  else {
    if (name.length < 2 || name.length > 16) return fail(JOIN_ERR.NAME_LEN);
    if (code.length !== 6) return fail("Der Klassen-Code hat 6 Zeichen.");
  }
  $("joinErr").hidden = true; btn.disabled = true; btn.textContent = "Einen Moment …";
  try{
    if (!SESSION) await sbAuth("signup", {data:{}});
    PROFILE = joinMode === "old" ? await sb("rpc/link_device", {method:"POST", body:{p_code:dev}}) : await sb("rpc/join_class", {method:"POST", body:{p_code:code, p_nickname:name}});
    jset(PRO_KEY, PROFILE); jset(SYNCED_KEY, false); btn.disabled = false; btn.textContent = "Los geht’s";
    renderAll(); pull(); fx("level"); confetti(100);
    // Nach dem ersten Beitritt den Geräte-Code einmal groß zeigen, sonst direkt in die App
    if (PROFILE.device_code){ $("joinForm").hidden = true; $("joinDone").hidden = false; $("joinDoneName").textContent = `Willkommen, ${PROFILE.nickname}!`; $("joinDoneCode").textContent = PROFILE.device_code; }
    else { $("join").hidden = true; toast(`Willkommen zurück, ${PROFILE.nickname}!`); }
  }catch(err){
    fail(JOIN_ERR[err.message] || (err.code === "anonymous_provider_disabled" ? "Die Anmeldung ist noch nicht freigeschaltet. Sag bitte deinen Eltern Bescheid."
      : navigator.onLine === false ? "Keine Internet-Verbindung. Für die erste Anmeldung brauchst du Internet." : "Das hat gerade nicht geklappt. Versuch es gleich nochmal."));
  }
};
$("joinSwitch").onclick = () => {
  joinMode = joinMode === "new" ? "old" : "new"; const old = joinMode === "old";
  $("joinNew").hidden = old; $("joinOld").hidden = !old; $("joinErr").hidden = true;
  $("joinSwitch").textContent = old ? "Ich bin neu und habe einen Klassen-Code" : "Ich habe schon einen Geräte-Code";
  (old ? $("joinDev") : $("joinNick")).focus();
};
$("joinDoneBtn").onclick = () => { $("join").hidden = true; $("joinDone").hidden = true; $("joinForm").hidden = false; };
window.addEventListener("online", pull);
document.addEventListener("visibilitychange", () => { document.hidden ? push() : pull(); });
setInterval(push, 60000);

/* ---------- Admin-Bereich: Klassen, Kinder, Listen, KI-Schlüssel, Test-Modus ---------- */
let AO = null, edit = null, admRename = null, admConfirm = null;
const rpc = (name, body) => sb("rpc/" + name, {method:"POST", body:body || {}});
async function openAdmin(){
  $("settings").hidden = true; $("adminSheet").hidden = false; $("admErr").hidden = true; edit = null;
  renderAdminSheet(); await loadAdmin();
}
async function loadAdmin(){
  try{ AO = SESSION ? await rpc("admin_overview") : null; }catch(e){ AO = null; }
  renderAdminSheet();
}
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
function renderAdminSheet(){
  $("admLogin").hidden = !!AO; $("admMain").hidden = !AO || !!edit; $("admEditor").hidden = !AO || !edit;
  if (!AO) return;
  $("admWho").textContent = `Angemeldet als ${AO.admin}`;
  const li = (name, sub, btns) => `<li><span class="nm">${name}<small>${sub}</small></span>${btns}</li>`;
  const ask = (act, id, label) => `<button class="iconbtn ${admConfirm === act + id ? "warn" : ""}" data-act="${act}" data-id="${id}">${admConfirm === act + id ? "Wirklich?" : label}</button>`;
  $("admClasses").innerHTML = AO.classes.map(c => `<div class="card admclass" data-class="${c.id}">
    <div class="admhead"><h3>${esc(c.name)}</h3><div><small>Klassen-Code</small><b class="admcode">${esc(c.join_code)}</b></div></div>
    <div class="admsub">Kinder <span>${c.players.length}</span></div>
    ${c.players.length ? `<ul class="plain admlist">${c.players.map(p => admRename === p.id
      ? `<li class="ren"><input type="text" maxlength="16" value="${esc(p.nickname)}" aria-label="Neuer Spitzname" data-ren="${p.id}"><button class="iconbtn" data-act="renok" data-id="${p.id}">OK</button><button class="iconbtn" data-act="rencancel">Abbrechen</button></li>`
      : li(esc(p.nickname), `${p.xp_week} XP diese Woche · ${plural(p.devices, "Gerät", "Geräte")}`, `<button class="iconbtn" data-act="rename" data-id="${p.id}">Umbenennen</button>${ask("remove", p.id, "Entfernen")}`)).join("")}</ul>`
      : `<p class="muted">Noch keine Kinder. Gib den Klassen-Code weiter.</p>`}
    <div class="admsub">Vokabellisten <span>${c.lists.length}</span></div>
    ${c.lists.length ? `<ul class="plain admlist">${c.lists.map(l => li(esc(l.name), plural(l.words.length, "Wort", "Wörter"), `<button class="iconbtn" data-act="editlist" data-id="${l.id}">Bearbeiten</button>${ask("dellist", l.id, "Löschen")}`)).join("")}</ul>` : `<p class="muted">Noch keine Klassen-Liste.</p>`}
    <button class="btn sky small" data-act="newlist">+ Neue Liste</button>
  </div>`).join("") || `<p class="muted">Noch keine Klasse.</p>`;
  const k = kiKey();
  $("kiState").textContent = k ? `Schlüssel gespeichert (endet auf …${k.slice(-4)}). Er liegt nur auf diesem Gerät.` : "Kein Schlüssel gespeichert. Ohne Schlüssel trägst du Listen von Hand ein.";
  $("kiDel").hidden = !k;
  $("testBox").hidden = !PROFILE; $("testOff").hidden = !!PROFILE;
  renderAdmin();
  if (edit){
    $("edTitle").textContent = edit.id ? "Liste bearbeiten" : "Neue Liste";
    $("edPhotoBox").hidden = !k; $("edHintsRow").hidden = !k; $("edNoKi").hidden = !!k;
  }
}
function admFail(el, msg){ el.textContent = msg; el.hidden = false; }
$("admLogin").onsubmit = async e => {
  e.preventDefault(); const btn = $("admLoginBtn"); btn.disabled = true; $("admErr").hidden = true;
  try{
    if (!SESSION) await sbAuth("signup", {data:{}});
    const r = await rpc("admin_login", {p_name:$("admName").value, p_pw:$("admPw").value});
    $("admPw").value = "";
    if (!r.ok) admFail($("admErr"), r.reason === "LOCKED" ? "Zu viele Fehlversuche. Die Anmeldung ist 15 Minuten gesperrt." : "Name oder Passwort stimmt nicht.");
    else await loadAdmin();
  }catch(err){ admFail($("admErr"), "Das hat gerade nicht geklappt. Prüfe die Internet-Verbindung."); }
  btn.disabled = false;
};
$("admLogout").onclick = async () => { try{ await rpc("admin_logout"); }catch(e){} AO = null; edit = null; renderAdminSheet(); };
$("admClose").onclick = () => { $("adminSheet").hidden = true; };
$("adminOpen").onclick = openAdmin;
$("joinAdmin").onclick = openAdmin;
$("admNewClass").onsubmit = async e => {
  e.preventDefault(); const n = $("admClassName").value.trim(); if (!n) return;
  try{ const c = await rpc("admin_create_class", {p_name:n}); $("admClassName").value = ""; toast(`Klasse ${c.name} angelegt. Code: ${c.join_code}`); await loadAdmin(); }
  catch(err){ toast("Die Klasse konnte nicht angelegt werden."); }
};
$("admPwForm").onsubmit = async e => {
  e.preventDefault(); const m = $("admPwMsg");
  if ($("admPwNew").value.length < 8){ m.textContent = "Das neue Passwort braucht mindestens 8 Zeichen."; return; }
  try{ const r = await rpc("admin_set_password", {p_old:$("admPwOld").value, p_new:$("admPwNew").value});
    m.textContent = r.ok ? "Passwort geändert." : "Das alte Passwort stimmt nicht."; if (r.ok){ $("admPwOld").value = ""; $("admPwNew").value = ""; } }
  catch(err){ m.textContent = "Das hat nicht geklappt."; }
};
$("kiSave").onclick = () => { const v = $("kiInput").value.trim(); if (!v) return; try{ localStorage.setItem(KI_KEY, v); }catch(e){} $("kiInput").value = ""; renderAdminSheet(); toast("KI-Schlüssel gespeichert"); };
$("kiDel").onclick = () => { try{ localStorage.removeItem(KI_KEY); }catch(e){} renderAdminSheet(); toast("KI-Schlüssel entfernt"); };
$("admClasses").addEventListener("click", async e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id, cls = AO.classes.find(c => c.id === b.closest("[data-class]").dataset.class);
  const twice = () => { if (admConfirm === act + id) { admConfirm = null; return true; } admConfirm = act + id; renderAdminSheet(); return false; };
  try{
    if (act === "rename"){ admRename = id; admConfirm = null; renderAdminSheet(); const i = document.querySelector(`[data-ren="${id}"]`); if (i){ i.focus(); i.select(); } return; }
    if (act === "rencancel"){ admRename = null; renderAdminSheet(); return; }
    if (act === "renok"){ await rpc("admin_rename_player", {p_player:id, p_nickname:document.querySelector(`[data-ren="${id}"]`).value}); admRename = null; toast("Spitzname geändert"); }
    if (act === "remove"){ if (!twice()) return; await rpc("admin_remove_player", {p_player:id}); toast("Kind entfernt"); }
    if (act === "dellist"){ if (!twice()) return; await rpc("admin_delete_list", {p_id:id}); toast("Liste gelöscht"); }
    if (act === "newlist" || act === "editlist"){
      const l = act === "editlist" ? cls.lists.find(x => x.id === id) : null;
      edit = {id:l ? l.id : null, classId:cls.id, old:l ? l.words : []};
      $("edName").value = l ? l.name : ""; $("edWords").value = l ? l.words.map(w => `${w.en} = ${w.de}`).join("\n") : "";
      $("edErr").hidden = true; $("edPhotoMsg").textContent = ""; edCount(); renderAdminSheet(); $("adminSheet").querySelector(".sheet").scrollTop = 0; return;
    }
    await loadAdmin(); if (PROFILE) pull();
  }catch(err){ toast(err.message === "NAME_TAKEN" ? "Diesen Spitznamen gibt es in der Klasse schon." : err.message === "NAME_LEN" ? "Der Spitzname braucht 2 bis 16 Zeichen." : "Das hat nicht geklappt."); }
});
// Editor: eine Zeile pro Wort, "englisch = deutsch"
function parseLines(txt){
  const out = [], bad = [];
  txt.split("\n").forEach((raw, n) => { const l = raw.trim(); if (!l) return;
    let i = l.lastIndexOf(" = "), w = 3; if (i < 0){ i = l.indexOf("="); w = 1; }
    const en = i < 0 ? "" : l.slice(0, i).trim(), de = i < 0 ? "" : l.slice(i + w).trim();
    en && de ? out.push({en, de}) : bad.push(n + 1); });
  return {out, bad};
}
function edCount(){ const {out, bad} = parseLines($("edWords").value); $("edCount").textContent = plural(out.length, "Wort", "Wörter") + (bad.length ? ` · Zeile ${bad.slice(0, 5).join(", ")} hat kein „=“` : ""); }
$("edWords").addEventListener("input", edCount);
$("edBack").onclick = () => { edit = null; renderAdminSheet(); };
$("edPhoto").onchange = async e => {
  const files = [...e.target.files].slice(0, 4), msg = $("edPhotoMsg"); e.target.value = ""; if (!files.length) return;
  msg.textContent = "Claude liest die Wörter … (etwa eine halbe Minute)";
  try{
    const imgs = []; for (const f of files) imgs.push(await resize(f));
    const data = await kiJson(PHOTO_PROMPT, imgs);
    const ws = ((data && data.words) || []).filter(w => w && w.en && w.de).map(w => ({en:String(w.en).trim(), de:String(w.de).trim(), hint:String(w.hint || "").trim()}));
    if (!ws.length){ msg.textContent = "Keine Vokabeln erkannt. Versuch ein schärferes, gerades Foto."; return; }
    edit.photo = (edit.photo || []).concat(ws);
    $("edWords").value = ($("edWords").value.trim() ? $("edWords").value.trim() + "\n" : "") + ws.map(w => `${w.en} = ${w.de}`).join("\n");
    edCount(); msg.textContent = `${plural(ws.length, "Wort", "Wörter")} eingefügt. Bitte kurz gegenlesen.`;
  }catch(err){ msg.textContent = sampleErr(err); }
};
$("edSave").onclick = async () => {
  const name = $("edName").value.trim(), {out, bad} = parseLines($("edWords").value), btn = $("edSave");
  if (!name) return admFail($("edErr"), "Gib der Liste einen Namen.");
  if (bad.length) return admFail($("edErr"), `Zeile ${bad.slice(0, 5).join(", ")} hat kein „=“. Schreibe: englisch = deutsch`);
  if (!out.length) return admFail($("edErr"), "Die Liste ist leer.");
  if (out.length > 300) return admFail($("edErr"), "Eine Liste darf höchstens 300 Wörter haben.");
  $("edErr").hidden = true; btn.disabled = true; btn.textContent = "Speichert …";
  // Kennung und Umschreibung eines Worts behalten, wenn es schon in der Liste stand (oder gerade vom Foto kam)
  const words = out.map(p => { const o = edit.old.find(x => x.en === p.en), ph = (edit.photo || []).find(x => x.en === p.en); return {k:o ? o.k : "", en:p.en, de:p.de, hint:(o && o.hint) || (ph && ph.hint) || ""}; });
  try{
    const missing = words.filter(w => !w.hint);
    if (kiKey() && $("edHints").checked && missing.length){
      btn.textContent = "Claude schreibt Umschreibungen …";
      try{
        const data = await kiJson("Schreibe für jede Vokabel " + HINT_RULE + "\nAntworte nur mit JSON in der Form {\"hints\":[{\"id\":\"...\",\"hint\":\"...\"}]}.\n\nVokabeln:\n" + missing.map((w, i) => `${i}: ${w.en} = ${w.de}`).join("\n"));
        for (const h of (data && data.hints) || []){ const w = missing[Number(h.id)]; if (w && h.hint) w.hint = String(h.hint).trim(); }
      }catch(err){ toast("Umschreibungen fehlen noch: " + sampleErr(err)); }
    }
    await rpc("admin_save_list", {p_id:edit.id, p_class:edit.classId, p_name:name, p_words:words});
    edit = null; toast(`Liste „${name}“ gespeichert`); await loadAdmin(); if (PROFILE) pull();
  }catch(err){ admFail($("edErr"), "Die Liste konnte nicht gespeichert werden."); }
  btn.disabled = false; btn.textContent = "Speichern";
};

/* ---------- Rangliste der Klasse (diese Woche) ---------- */
let LB = jget(LB_KEY), lbAt = 0;
// Gespielte Runden warten in einer Liste, bis sie online gebucht sind (auch nach einer Runde ohne Internet)
async function flushXp(){
  let q = jget(XPQ_KEY) || [];
  while (q.length){
    try{ await sb("rpc/log_round", {method:"POST", body:{p_xp:q[0].xp, p_words:q[0].words}}); }
    catch(e){ if (e.status !== 400) throw e; }   // 400 = unplausible Runde, wird verworfen
    q = (jget(XPQ_KEY) || []).slice(1); jset(XPQ_KEY, q);
  }
}
async function loadLB(){
  if (!SESSION || !PROFILE) return null;
  try{ await flushXp(); LB = await sb("rpc/leaderboard", {method:"POST", body:{}}); lbAt = Date.now(); jset(LB_KEY, LB); renderLB(); return LB; }
  catch(e){ renderLB(); return null; }
}
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function lbAvatar(a){
  if (!a || !own(PETS, a.pet) || !ART[a.pet]) return mascotSvg();
  const o = {}; SLOTS.forEach(([k]) => { const v = a.outfit && a.outfit[k]; if (typeof v === "string" && own(WEAR, v)) o[k] = v; });
  return avatarSVG(a.pet, o);
}
// Auf der Startseite steht nur der eigene Platz. Die Top 10 (plus eigener Platz) öffnen sich beim Antippen.
function renderLB(){
  const el = $("lb"); if (!el) return;
  const CHEV = `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
  if (!LB){
    el.disabled = true; el.innerHTML = `<span class="rk">?</span><span class="t"><b>Rangliste</b><small>Erscheint, sobald du online bist.</small></span>`;
    $("lbWhen").textContent = ""; $("lbList").innerHTML = ""; return;
  }
  const left = new Date(LB.week_end) - Date.now(), days = Math.floor(left / 864e5), hrs = Math.floor(left % 864e5 / 36e5), mins = Math.max(1, Math.floor(left % 36e5 / 6e4));
  const when = left <= 0 ? "neue Woche" : "noch " + (days ? `${days} ${days === 1 ? "Tag" : "Tage"} ${hrs} Std.` : hrs ? `${hrs} Std. ${mins} Min.` : `${mins} Min.`);
  $("lbWhen").textContent = "diese Woche"; $("lbSheetWhen").textContent = `Diese Woche · ${when} bis zum Neustart`;
  el.disabled = false;
  el.innerHTML = LB.me
    ? `<span class="rk r${LB.me.rank}">${LB.me.rank}</span><span class="t"><b>Du bist auf Platz ${LB.me.rank}</b><small>${LB.me.xp} XP diese Woche · ${when}</small></span>${CHEV}`
    : `<span class="rk">–</span><span class="t"><b>Noch kein Platz</b><small>Spiel eine Runde, dann bist du dabei.</small></span>${CHEV}`;
  const row = r => `<li class="${r.me ? "me" : ""}"><span class="rk r${r.rank}">${r.rank}</span><span class="pp">${lbAvatar(r.avatar)}</span><span class="nm">${esc(r.nickname)}${r.me ? " <small>(du)</small>" : ""}</span><span class="x">${r.xp} XP</span></li>`;
  let h = LB.top.length ? `<ul class="plain lblist">${LB.top.map(row).join("")}` : `<p class="muted" style="margin:0">Diese Woche hat noch niemand XP gesammelt. Hol dir Platz 1!</p>`;
  if (LB.top.length){
    if (LB.me && !LB.top.some(r => r.me)) h += `<li class="gap">…</li>` + row({rank:LB.me.rank, xp:LB.me.xp, nickname:nick(), avatar:{pet:S.pet, outfit:S.pet && S.outfits ? S.outfits[S.pet] : {}}, me:true});
    h += `</ul>`;
    if (!LB.me) h += `<p class="muted" style="margin:10px 0 0">Spiel eine Runde, dann stehst du auch auf der Liste!</p>`;
  }
  $("lbList").innerHTML = h + `<p class="lbfoot">Gezeigt werden nur die ersten 10 Plätze und dein eigener.<br>Eure Klasse zusammen: <b>${LB.class_xp} XP</b></p>`;
}
$("lb").onclick = () => { $("lbSheet").hidden = false; fx("tap"); loadLB(); };
$("lbClose").onclick = () => { $("lbSheet").hidden = true; };
$("lbSheet").addEventListener("click", e => { if (e.target === $("lbSheet")) $("lbSheet").hidden = true; });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("lbSheet").hidden = true; });
// Nach einer Runde: buchen, Rangliste neu holen und die Platz-Änderung zeigen
async function rankAfterRound(xp, words){
  const before = LB && LB.me ? LB.me.rank : null;
  jset(XPQ_KEY, (jget(XPQ_KEY) || []).concat([{xp, words}]).slice(-40));
  const lb = await loadLB(); if (!lb || !lb.me || view !== "result" || tab !== "ueben") return;
  const now = lb.me.rank, up = before === null || now < before;
  const msg = before === null ? `Du stehst jetzt auf Platz ${now} der Rangliste!` : now < before ? `Du bist auf Platz ${now} geklettert!` : `Du bist auf Platz ${now} der Rangliste.`;
  $("rBanners").insertAdjacentHTML("beforeend", `<div class="banner" style="background:var(--grape);color:#fff">${msg}</div>`);
  if (up) fx("coin");
}

/* ---------- Claude (Fotos + Umschreibungen) über den KI-Schlüssel aus dem Admin-Bereich ---------- */
// Der Schlüssel liegt nur im Browser dieses Geräts und geht direkt an die Anthropic-API, nie an Supabase.
const KI_KEY = "vokabel-klasse-ki", KI_COUNT = "vokabel-klasse-ki-zahl", KI_MODEL = "claude-opus-5-5", KI_PER_DAY = 30;
const kiKey = () => { try{ return localStorage.getItem(KI_KEY) || ""; }catch(e){ return ""; } };
const blobB64 = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(b); });
async function kiJson(prompt, images){
  const fail = (code, status) => Object.assign(new Error(code), {code, status});
  const today = todayKey(), cnt = jget(KI_COUNT) || {};
  if (cnt.date === today && cnt.n >= KI_PER_DAY) throw fail("day_limit");
  const content = [];
  for (const b of (images || []).slice(0, 4)) content.push({type:"image", source:{type:"base64", media_type:"image/jpeg", data:await blobB64(b)}});
  content.push({type:"text", text:prompt});
  jset(KI_COUNT, {date:today, n:(cnt.date === today ? cnt.n : 0) + 1});
  const r = await fetch("https://api.anthropic.com/v1/messages", {method:"POST",
    headers:{"content-type":"application/json", "x-api-key":kiKey(), "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:KI_MODEL, max_tokens:16000, messages:[{role:"user", content}]})});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw fail(r.status === 401 || r.status === 403 ? "key" : r.status === 429 ? "rate_limited" : r.status === 413 ? "image_rejected" : "api", r.status);
  if (j.stop_reason === "refusal") throw fail("refusal");
  const txt = (j.content || []).filter(b => b.type === "text").map(b => b.text).join(""), a = txt.indexOf("{"), z = txt.lastIndexOf("}");
  try{ return JSON.parse(txt.slice(a, z + 1)); }catch(e){ throw fail("invalid_json"); }
}
function getSample(){ return Promise.resolve(kiKey() ? {json:(prompt, o) => kiJson(prompt, o && o.images), limits:async () => ({images:true})} : null); }
function sampleErr(e){
  const c = e && e.code;
  if (c === "key") return "Der KI-Schlüssel ist ungültig oder gesperrt. Prüfe ihn im Admin-Bereich.";
  if (c === "day_limit") return `Für heute sind die ${KI_PER_DAY} KI-Anfragen dieses Geräts aufgebraucht.`;
  if (c === "rate_limited") return "Gerade zu viele Anfragen. Warte kurz und versuch es nochmal.";
  if (c === "invalid_json") return "Claude hat keine lesbare Liste geliefert. Versuch ein schärferes Foto.";
  if (c === "image_rejected") return "Dieses Bild kann nicht gelesen werden. Nimm ein kleineres JPG oder PNG.";
  if (c === "refusal") return "Claude hat diese Anfrage abgelehnt.";
  return "Das hat nicht geklappt. Versuch es nochmal.";
}

/* ---------- Antworten prüfen ---------- */
const clean = s => s.replace(/[’‘`´]/g,"'").replace(/\s+/g," ").trim().replace(/[.!?]+$/,"").trim();
function forms(target){
  const out = [];
  for (let alt of target.split(";")){
    const extra = [];
    alt = alt.replace(/\(([^)]*)\)/g, (m, inner) => { inner = inner.trim(); if (inner.startsWith("=")) extra.push(inner.slice(1).trim()); return ""; });
    alt = clean(alt);
    if (!alt) continue;
    let combos = [""];
    for (const tok of alt.split(" ")){
      let opts;
      if (tok.includes("/")){
        const p = tok.split("/");
        opts = (p.length === 2 && /^(in|innen)$/.test(p[1])) ? [p[0], p[0] + p[1], tok] : p.concat([tok]);
      } else opts = [tok];
      const next = [];
      for (const c of combos) for (const o of opts) next.push(c ? c + " " + o : o);
      combos = next;
    }
    out.push(...combos, ...extra.map(clean));
  }
  return [...new Set(out.filter(Boolean))];
}
function primary(target){ const f = forms(target); return f.find(x => !x.includes("/")) || f[0] || target; }
function check(input, target){
  const a = clean(input); if (!a) return {ok:false};
  const fs = forms(target);
  if (fs.includes(a)) return {ok:true};
  const lowHit = fs.find(f => f.toLowerCase() === a.toLowerCase());
  if (lowHit) return {ok:true, note:"Achte auf Groß- und Kleinschreibung: <b>" + esc(lowHit) + "</b>"};
  const sichHit = fs.find(f => f.startsWith("sich ") && f.slice(5).toLowerCase() === a.toLowerCase());
  if (sichHit) return {ok:true, note:"Ganz genau heißt es <b>" + esc(sichHit) + "</b>."};
  return {ok:false, close: fs.some(f => lev(f.toLowerCase(), a.toLowerCase()) <= Math.max(1, Math.floor(f.length/6)))};
}
function lev(a,b){ const m=[...Array(b.length+1).keys()]; for(let i=1;i<=a.length;i++){let p=m[0];m[0]=i;for(let j=1;j<=b.length;j++){const t=m[j];m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t;}} return m[b.length]; }
const esc0 = s => String(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const showMeaning = s => s.replace(/\s*\(=[^)]*\)/g,"").trim();

/* ---------- Listen ---------- */
const setOf = w => w.set || "Ohne Liste";
function setsByRecency(){
  const info = new Map();
  S.words.forEach((w, i) => { const s = setOf(w), cur = info.get(s) || {name:s, added:"", idx:0, n:0};
    cur.n++; if ((w.added||"") > cur.added) cur.added = w.added || ""; cur.idx = i; info.set(s, cur); });
  return [...info.values()].sort((a, b) => (b.added.localeCompare(a.added)) || (b.idx - a.idx));
}
const latestSet = () => (setsByRecency()[0] || {}).name || null;
const wordsOf = s => S.words.filter(w => setOf(w) === s);
function stats(ws){ return {n:ws.length, safe:ws.filter(w => w.last === 2).length, wob:ws.filter(w => w.last === 1 || w.last === 0).length, fresh:ws.filter(w => w.last == null).length}; }

/* ---------- Streak + Nachricht ---------- */
function currentStreak(){ const s = S.streak; if (!s.last) return 0; return dayDiff(s.last, todayKey()) <= 1 ? s.count : 0; }
const doneToday = () => S.streak.last === todayKey();
const xpToday = () => S.history.filter(r => r.date === todayKey()).reduce((a, r) => a + (r.xp ?? r.pts), 0);
function noahMessage(){
  const now = new Date(), m = now.getHours() * 60 + now.getMinutes(), c = currentStreak();
  const hw = S.words.filter(w => w.last === 0 || w.last === 1).length;
  const pet = S.pet ? PETS[S.pet].name : null, me = pet ? ` ${pet} sagt:` : "";
  if (shieldNote) return [`Glück gehabt, ${nick()}!`, shieldNote + " Heute aber wieder üben."];
  if (doneToday()){
    const left = Math.max(0, DAY_GOAL - xpToday());
    return [`Stark gemacht, ${nick()}!`, left ? `Heute erledigt. Noch ${left} XP bis zu deinem Tagesziel.` : `Tagesziel geschafft! Deine Flamme brennt seit ${c} ${c === 1 ? "Tag" : "Tagen"}.`];
  }
  if (m < 16 * 60) return [`Hi ${nick()}!`, `${me} Um 16 Uhr ist Vokabelzeit. Eine Runde dauert nur ein paar Minuten.`.trim()];
  if (m < 17 * 60 + 30) return [`Vokabelzeit, ${nick()}!`, c > 0 ? `Hol dir deine XP und halte die Flamme am Leben. ${c} ${c === 1 ? "Tag" : "Tage"} stehen schon.` : "Eine Runde jetzt, dann ist der Rest des Tages frei."];
  if (m < 19 * 60) return [`${nick()}, deine Flamme wartet!`, hw ? `${hw} Wörter wackeln noch. Eine Runde, dann sitzen sie besser.` : "Eine kurze Runde reicht, dann ist der Tag gesichert."];
  return [`Letzte Chance heute, ${nick()}!`, c > 0 ? `Sonst geht deine ${c}-Tage-Flamme aus${S.inv.shield ? " (oder dein Flammenschild springt ein)" : ""}. Eine Runde reicht!` : "Mach noch eine Runde und starte deine Flamme."];
}

/* ---------- Ring-Diagramme ---------- */
function ring(pct, color, big, small){
  const r = 40, C = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct));
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${esc(big)} ${esc(small)}"><circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="12"/>
  <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)" ${p === 0 ? 'stroke-opacity="0"' : ""}/>
  <text x="50" y="${small ? 52 : 58}" text-anchor="middle" class="ringnum" font-size="${String(big).length > 4 ? 18 : 24}">${esc(big)}</text>${small ? `<text x="50" y="68" text-anchor="middle" class="ringsub" font-size="10">${esc(small)}</text>` : ""}</svg>`;
}
function donut(parts){
  const r = 40, C = 2 * Math.PI * r, total = parts.reduce((a, p) => a + p.v, 0) || 1; let off = 0, segs = "";
  parts.forEach(p => { if (!p.v) return; const len = C * p.v / total, gap = parts.filter(x => x.v).length > 1 ? 3 : 0;
    segs += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${p.c}" stroke-width="16" stroke-dasharray="${Math.max(0, len - gap).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 50 50)"/>`; off += len; });
  return `<svg viewBox="0 0 100 100" role="img" aria-label="Verteilung der Vokabeln"><circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="16"/>${segs}
  <text x="50" y="53" text-anchor="middle" class="ringnum" font-size="22">${Math.round(parts[0].v / total * 100)}%</text><text x="50" y="66" text-anchor="middle" class="ringsub" font-size="9">sicher</text></svg>`;
}

/* ---------- Dashboard ---------- */
function renderDash(){
  renderLB(); if (Date.now() - lbAt > 60000) loadLB();
  const [t, s] = noahMessage();
  $("bubble").innerHTML = `<b>${esc(t)}</b>${esc(s)}`;
  $("heroPet").innerHTML = petBox(S.pet ? avatarSVG(S.pet) : mascotSvg(), "small");
  const c = currentStreak();
  $("streak").classList.toggle("off", !doneToday());
  $("streakNum").innerHTML = `${c}<small>${c === 1 ? "Tag" : "Tage"} in Folge</small>`;
  $("streakMsg").textContent = doneToday()
    ? (c >= S.streak.best && c > 1 ? "Neuer Rekord!" : `Heute erledigt. Rekord: ${S.streak.best} ${S.streak.best === 1 ? "Tag" : "Tage"}.`)
    : c > 0 ? "Heute noch eine Runde, sonst geht die Flamme aus!" : "Übe heute eine Runde und zünde die Flamme an.";
  $("shieldInfo").hidden = !S.inv.shield;
  $("shieldInfo").textContent = `${S.inv.shield} Flammenschild${S.inv.shield === 1 ? "" : "e"} bereit`;
  const now = new Date(), names = ["So","Mo","Di","Mi","Do","Fr","Sa"]; let h = "", ch = "";
  const xpDay = {}; S.history.forEach(r => xpDay[r.date] = (xpDay[r.date] || 0) + (r.xp ?? r.pts));
  const days = []; for (let i = 6; i >= 0; i--){ const d = new Date(now); d.setDate(now.getDate() - i); days.push([todayKey(d), i === 0 ? "Heute" : names[d.getDay()]]); }
  const maxXp = Math.max(DAY_GOAL, ...days.map(([k]) => xpDay[k] || 0));
  days.forEach(([k, n], i) => {
    h += `<div><i class="${S.days.includes(k) ? "on" : ""} ${i === 6 ? "today" : ""}"></i>${n}</div>`;
    const v = xpDay[k] || 0;
    ch += `<div><em>${v || ""}</em><i class="${v ? "" : "zero"}" style="height:${v ? Math.max(8, v / maxXp * 86) : 4}px"></i>${n}</div>`;
  });
  $("week").innerHTML = h; $("chart").innerHTML = ch;
  // rings
  const into = S.points % XP_PER_LEVEL, xt = xpToday(), ls = latestSet(), lst = ls ? stats(wordsOf(ls)) : null;
  $("rings").innerHTML =
    `<div class="ring tint-grape">${ring(into / XP_PER_LEVEL, "var(--grape)", `${into}`, `von ${XP_PER_LEVEL}`)}<div class="t">Level ${levelOf(S.points) + 1}</div><div class="s">XP bis zum nächsten</div></div>` +
    `<div class="ring tint-sun">${ring(xt / DAY_GOAL, "var(--sun)", `${Math.min(xt, 999)}`, `von ${DAY_GOAL}`)}<div class="t">Tagesziel</div><div class="s">${xt >= DAY_GOAL ? "geschafft!" : "XP heute"}</div></div>` +
    `<div class="ring tint-mint">${ring(lst && lst.n ? lst.safe / lst.n : 0, "var(--mint)", lst ? `${lst.safe}/${lst.n}` : "–", "sicher")}<div class="t">Aktuelle Liste</div><div class="s">Wörter sicher</div></div>`;
  const all = stats(S.words);
  $("allCount").textContent = `${all.n} Wörter`;
  $("donut").innerHTML = donut([{v:all.safe, c:"var(--mint)"}, {v:all.wob, c:"var(--sun)"}, {v:all.fresh, c:"var(--sky)"}]) +
    `<div class="legend"><div><i style="background:var(--mint)"></i>sicher<b>${all.safe}</b></div><div><i style="background:var(--sun)"></i>wackeln noch<b>${all.wob}</b></div><div><i style="background:var(--sky)"></i>noch nie geübt<b>${all.fresh}</b></div></div>`;
  $("latestBox").hidden = !ls;
  if (ls){
    $("latestName").textContent = ls; $("latestCount").textContent = `${lst.n} Wörter`;
    $("latestText").textContent = lst.safe === lst.n ? "Alle Wörter sitzen. Wiederholen schadet trotzdem nicht!" : `${lst.safe} sicher, ${lst.wob} wackeln noch, ${lst.fresh} noch nie geübt.`;
  }
  const hist = S.history.slice(-5).reverse();
  $("hist").innerHTML = hist.length ? hist.map(r => {
    const d = new Date(r.ts), when = r.date === todayKey() ? "Heute" : dayDiff(r.date, todayKey()) === 1 ? "Gestern" : d.toLocaleDateString("de-DE", {day:"2-digit", month:"2-digit"});
    return `<li><span class="d">${when}<br>${d.toLocaleTimeString("de-DE", {hour:"2-digit", minute:"2-digit"})}</span><span class="s">${esc(r.set)}<small>${DIRS[r.dir] || ""} · ${LEVELS[r.level] || ""} · ${Math.round(r.pts / Math.max(1, r.max) * 100)} % richtig</small></span><span class="x">+${r.xp ?? r.pts} XP</span></li>`;
  }).join("") : `<li><span class="s muted" style="grid-column:1/-1">Noch keine Runde gespielt. Starte unter „Üben“!</span></li>`;
}
$("latestBtn").onclick = () => { W = {step:1, p:Object.assign({}, S.prefs, {set:latestSet()}), pickedLatest:true}; go("ueben","wizard"); renderWizard(); };

/* ---------- Tabs / Ansichten ---------- */
let tab = "dash", view = "home";
document.querySelectorAll("nav button").forEach(b => b.onclick = () => setTab(b.dataset.tab));
function setTab(t){
  tab = t;
  document.querySelectorAll("nav button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === t || (t === "neu" && b.dataset.tab === "liste")));
  ["home","wizard","quiz","result"].forEach(v => $(v).hidden = !(t === "ueben" && view === v));
  document.body.classList.toggle("inquiz", t === "ueben" && view === "quiz");
  ["dash","shop","liste","neu","avatar"].forEach(v => $(v).hidden = t !== v);
  if (t === "dash") renderDash();
  if (t === "shop") renderShop();
  if (t === "avatar") renderAvatar();
  if (t === "liste") renderList();
  if (t === "neu") renderNew();
  if (t === "ueben" && view === "home") renderHome();
  if (t === "ueben" && view === "quiz") setTimeout(() => $("qInput").focus(), 30);
  window.scrollTo({top:0});
}
function go(t, v){ if (v) view = v; setTab(t); }

/* ---------- Üben: Start ---------- */
const DIRS = {"de-en":"Deutsch → Englisch","en-de":"Englisch → Deutsch","mix":"Gemischt"};
const LEVELS = {easy:"Einfach",normal:"Normal",hard:"Schwer"};
function renderHome(){
  $("homeTitle").textContent = `Bereit, ${nick()}?`;
  const p = S.prefs, ok = S.played && p.set && wordsOf(p.set).length;
  $("quick").hidden = !ok;
  if (ok) $("quickText").innerHTML = `<b>${esc(p.set)}</b><br>${DIRS[p.dir]} · ${LEVELS[p.level]}`;
  const showBoost = S.inv.double > 0 || S.armed.double;
  $("boostBox").hidden = !showBoost;
  if (showBoost){
    $("boostText").textContent = S.armed.double ? "Doppel-XP ist für die nächste Runde aktiviert!" : `Du hast ${S.inv.double}× Doppel-XP. Für die nächste Runde einsetzen?`;
    $("boostBtn").hidden = S.armed.double;
  }
}
$("boostBtn").onclick = () => { if (S.inv.double > 0 && !S.armed.double){ S.inv.double--; S.armed.double = true; save(); renderHome(); toast("Doppel-XP aktiviert"); } };
$("newRound").onclick = () => { W = {step:0, p:Object.assign({}, S.prefs)}; go("ueben","wizard"); renderWizard(); };
$("quickBtn").onclick = () => startRound(S.prefs);

/* ---------- Assistent ---------- */
let W = null;
function wizardSteps(){
  const ls = latestSet(), lst = ls ? stats(wordsOf(ls)) : null, steps = [];
  steps.push({k:"which", title:"Welche Vokabeln?", sub:"Eine Runde fragt immer eine ganze Liste ab.", tiles:[
    {v:"latest", t:ls ? `Aktuellste: ${ls}` : "Aktuellste Liste", s:lst ? `${lst.n} Wörter · zuletzt hinzugefügt` : "", c:"t-crys", ic:"NEU"},
    {v:"other", t:"Andere Liste", s:"Eine ältere Liste wiederholen", c:"t-soft", ic:"…"}]});
  if (W && W.which === "other"){
    const cols = ["t-mint","t-sky","t-grape","t-sun","t-coral"];
    steps.push({k:"set", title:"Welche Liste?", sub:"Neueste zuerst.", tiles:setsByRecency().filter(x => x.name !== ls).map((x, i) => {
      const st = stats(wordsOf(x.name)); return {v:x.name, t:x.name, s:`${st.n} Wörter · ${st.safe} sicher`, c:cols[i % cols.length], ic:"#"}; })});
  }
  steps.push({k:"dir", title:"In welche Richtung?", sub:"Was soll ich dir zeigen, was schreibst du?", tiles:[
    {v:"de-en", t:"Deutsch → Englisch", s:"Du schreibst das englische Wort", c:"t-mint", ic:"EN"},
    {v:"en-de", t:"Englisch → Deutsch", s:"Du schreibst das deutsche Wort", c:"t-sky", ic:"DE"},
    {v:"mix", t:"Gemischt", s:"Mal so, mal so", c:"t-grape", ic:"⇄"}]});
  steps.push({k:"level", title:"Wie schwer?", sub:"Danach geht's sofort los.", tiles:[
    {v:"easy", t:"Einfach", s:"Du siehst, wie viele Buchstaben das Wort hat", c:"t-mint", ic:"1"},
    {v:"normal", t:"Normal", s:"Nur das Wort, keine Hilfe", c:"t-sun", ic:"2"},
    {v:"hard", t:"Schwer", s:"Nur eine Umschreibung, das Wort selbst fehlt", c:"t-coral", ic:"3"}]});
  return steps;
}
function renderWizard(){
  const steps = wizardSteps(), st = steps[W.step];
  $("steps").innerHTML = steps.map((_, i) => `<i class="${i < W.step ? "done" : i === W.step ? "now" : ""}"></i>`).join("");
  $("wTitle").textContent = st.title; $("wSub").textContent = st.sub;
  const cur = st.k === "which" ? W.which : W.p[st.k];
  $("wTiles").innerHTML = st.tiles.length ? st.tiles.map(t => `<button class="tile ${t.c} ${cur === t.v ? "sel" : ""}" data-v="${esc(t.v)}"><span class="ic">${esc(t.ic)}</span><b>${esc(t.t)}</b><span>${esc(t.s)}</span></button>`).join("")
    : `<p class="muted">Es gibt noch keine ältere Liste. Lade unter „Vokabeln“ eine neue Liste hoch.</p>`;
  $("wBack").textContent = W.step === 0 ? "← Abbrechen" : "← Zurück";
}
$("wTiles").addEventListener("click", e => {
  const b = e.target.closest(".tile"); if (!b) return;
  const st = wizardSteps()[W.step], v = b.dataset.v;
  if (st.k === "which"){ W.which = v; if (v === "latest") W.p.set = latestSet(); }
  else W.p[st.k] = v;
  const steps = wizardSteps();
  if (W.step < steps.length - 1){ W.step++; renderWizard(); window.scrollTo({top:0}); }
  else { S.prefs = {dir:W.p.dir, level:W.p.level, set:W.p.set}; save(); startRound(S.prefs); }
});
$("wBack").onclick = () => { if (W.step === 0 || (W.pickedLatest && W.step === 1)) go("ueben","home"); else { W.step--; renderWizard(); } };

/* ---------- Quiz ---------- */
let Q = null, R = null;
function shuffle(a){ for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pickDir = d => d === "mix" ? (Math.random() < .5 ? "de-en" : "en-de") : d;
function startRound(p, ids, label){
  const pool = ids ? ids.map(wordById).filter(Boolean) : wordsOf(p.set);
  if (!pool.length){ toast("Diese Liste ist leer."); go("ueben","home"); return; }
  const snap = clone(S);
  const dbl = !!S.armed.double; if (dbl){ S.armed.double = false; save(); }
  Q = { items: shuffle(pool.slice()).map(w => ({id:w.id, dir:pickDir(p.dir)})), i:0, level:p.level, dir:p.dir, set:label || p.set, pts:0, xp:0, results:[], combo:0, double:dbl, lvlBefore:levelOf(S.points), coinsBefore:S.coins, snap, jokers:0 };
  levelUps = []; R = null; $("quitBox").hidden = true; $("qQuit").hidden = false;
  $("qSet").innerHTML = `<span>${esc(Q.set)}</span>${dbl ? `<span class="boost">Doppel-XP aktiv</span>` : ""}${S.pet ? `<span class="boost" style="background:var(--surface-2);color:var(--ink)">mit ${esc(PETS[S.pet].name)}</span>` : ""}`;
  go("ueben","quiz"); showCard();
}
function wordById(id){ return S.words.find(w => w.id === id); }
function renderBar(){ $("qBar").innerHTML = Q.items.map((it, i) => { const r = Q.results[i]; return `<i class="${r ? "d" + r.pts : i === Q.i ? "now" : ""}"></i>`; }).join(""); }
function showCard(){
  const it = Q.items[Q.i], w = wordById(it.id);
  if (!w){ Q.i++; return Q.i < Q.items.length ? showCard() : finish(); }
  it.letters = 0; it.tries = 0; it.done = false;
  const toEn = it.dir === "de-en";
  it.target = toEn ? w.en : w.de; it.prompt = showMeaning(toEn ? w.de : w.en); it.prim = primary(it.target);
  it.maxL = Math.max(1, Math.round([...it.prim].filter(ch => /[\p{L}\p{N}]/u.test(ch)).length * HINT_SHARE));
  $("qCount").textContent = `Wort ${Q.i + 1} / ${Q.items.length}`; $("qPts").textContent = `+${Q.xp} XP`;
  renderBar();
  const hard = Q.level === "hard" && w.hint;
  $("qDir").textContent = hard ? (toEn ? "Was ist das auf Englisch?" : "Was ist das auf Deutsch?") : (toEn ? "Deutsch → Englisch" : "Englisch → Deutsch");
  $("qWord").hidden = !!hard; $("qWord").textContent = it.prompt;
  $("qHint").hidden = !hard; $("qHint").textContent = hard ? w.hint : "";
  if (Q.level === "hard" && !w.hint){ $("qHint").hidden = false; $("qHint").textContent = "Für dieses Wort gibt es noch keine Umschreibung."; }
  $("qInput").value = ""; $("qInput").disabled = false; $("qInput").placeholder = toEn ? "Auf Englisch …" : "Auf Deutsch …";
  $("qCheck").disabled = false; $("qLetter").disabled = false; $("qLetter").textContent = `Buchstabe (${it.maxL})`;
  renderCost();
  $("qFb").hidden = true; $("qNext").hidden = true; $("qGive").hidden = false;
  $("qJoker").hidden = !S.inv.joker; $("qJoker").textContent = `Joker (${S.inv.joker})`;
  renderPattern(); setTimeout(() => $("qInput").focus(), 30);
}
function renderPattern(){
  const it = Q.items[Q.i], box = $("qPattern");
  if (!(Q.level === "easy" || it.letters > 0)){ box.innerHTML = ""; box.hidden = true; return; }
  box.hidden = false;
  // Aufdeck-Reihenfolge: erster, letzter, zweiter, vorletzter, …
  const total = [...it.prim].filter(ch => /[\p{L}\p{N}]/u.test(ch)).length, shown = new Set();
  for (let k = 0, lo = 0, hi = total - 1; k < Math.min(it.letters, total); k++) shown.add(k % 2 === 0 ? lo++ : hi--);
  let n = -1;
  box.innerHTML = it.prim.split(" ").map(wd => `<span class="w">${[...wd].map(ch => {
    if (!/[\p{L}\p{N}]/u.test(ch)) return `<span class="c p">${esc(ch)}</span>`;
    n++; return shown.has(n) ? `<span class="c r">${esc(ch)}</span>` : `<span class="c"></span>`;
  }).join("")}</span>`).join("");
}
/* Hilfe: bis zu 30 % der Buchstaben. Belohnung nach genutzter Hilfe. */
const HINT_SHARE = 0.3;
const freeLetters = () => S.pet === "turtle" ? 1 : 0;
function baseXP(it){
  const used = Math.max(0, it.letters - freeLetters());
  if (used === 0 && it.tries === 0) return 3;
  return used <= 2 ? 2 : 1;
}
function renderCost(){
  const it = Q.items[Q.i], used = Math.max(0, it.letters - freeLetters()), left = it.maxL - it.letters;
  let s;
  if (it.letters === 0) s = `Hilfe: bis zu ${it.maxL} ${it.maxL === 1 ? "Buchstabe" : "Buchstaben"}. ${freeLetters() ? "Der erste ist gratis (Tilda). " : ""}${it.maxL + freeLetters() > 2 ? "1–2 Buchstaben = 2 XP, mehr = 1 XP." : "Mit Hilfe = 2 XP."}`;
  else s = `Jetzt noch ${baseXP(it)} XP möglich${left ? `, ${left} ${left === 1 ? "Buchstabe" : "Buchstaben"} übrig` : ""}.`;
  if (used === 0 && it.letters) s = `Gratis-Buchstabe von Tilda. Noch 3 XP möglich${left ? `, ${left} übrig` : ""}.`;
  $("qCost").textContent = s;
}
$("qLetter").onclick = () => {
  const it = Q.items[Q.i]; if (it.done || it.letters >= it.maxL) return;
  it.letters++; renderPattern(); fx("letter");
  $("qLetter").textContent = `Buchstabe (${it.maxL - it.letters})`;
  if (it.letters >= it.maxL) $("qLetter").disabled = true;
  renderCost(); $("qInput").focus();
};
$("qForm").onsubmit = e => {
  e.preventDefault();
  const it = Q.items[Q.i];
  if (it.done){ next(); return; }
  const val = $("qInput").value; if (!val.trim()) return;
  const r = check(val, it.target);
  if (r.ok){ const b = baseXP(it); resolve(b === 3 ? 2 : 1, r.note, false, b); }
  else {
    it.tries++; fx("wrong"); renderCost();
    const card = $("qCard"); card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    fb("bad", r.close ? "Fast! Schau dir die Rechtschreibung nochmal an." : (it.letters < it.maxL ? "Noch nicht. Versuch's nochmal oder hol dir einen Buchstaben." : "Noch nicht. Versuch's nochmal."));
    $("qInput").select();
  }
};
$("qGive").onclick = () => { if (!Q.items[Q.i].done) resolve(0); };
$("qJoker").onclick = () => { if (!Q.items[Q.i].done && S.inv.joker > 0){ S.inv.joker--; Q.jokers++; resolve(2, "Joker eingesetzt!", true, 3); } };
$("qNext").onclick = () => next();
$("qQuit").onclick = () => {
  if (!Q) return;
  if (!Q.results.length){ restoreSnap(); return; }
  clearTimeout(autoNext);
  $("quitText").textContent = Q.xp ? `Alle ${Q.xp} XP aus dieser Runde gehen verloren${levelUps.length ? ", auch die Kristalle vom Level-Up" : ""}. Die Runde zählt nicht für die Streak.` : "Die Runde zählt dann nicht und nicht für die Streak.";
  $("quitBox").hidden = false; $("qQuit").hidden = true; $("quitBox").scrollIntoView({block:"nearest", behavior:"smooth"});
};
$("quitNo").onclick = () => { $("quitBox").hidden = true; $("qQuit").hidden = false; if (Q && Q.items[Q.i] && Q.items[Q.i].done) next(); else $("qInput").focus(); };
$("quitYes").onclick = () => {
  const info = Q ? {set:Q.set, done:Q.results.length, total:Q.items.length, xp:Q.xp} : null;
  restoreSnap();
  if (info) logEvent("abort", `Runde abgebrochen (${info.set})`,
    [`Liste: ${info.set}`, `Beantwortet: ${info.done} von ${info.total} Wörtern`, `Verlorene XP: ${info.xp}`]);
  toast("Runde abgebrochen. Keine XP gutgeschrieben.");
};
function restoreSnap(){
  clearTimeout(autoNext);
  if (Q && Q.snap){ const keep = clone(S.settings); S = Q.snap; S.settings = keep; normalizeState(); save(); }
  Q = null; levelUps = []; $("quitBox").hidden = true; $("qQuit").hidden = false;
  renderTop(); go("ueben","home");
}
function fb(kind, html){ const f = $("qFb"); f.className = "feedback " + kind; f.innerHTML = html; f.hidden = false; }
function resolve(pts, note, joker, base){
  if (base === undefined) base = pts;
  const it = Q.items[Q.i], w = wordById(it.id);
  it.done = true; Q.pts += pts; Q.results.push({id:it.id, pts, joker:!!joker});
  Q.combo = pts === 2 ? Q.combo + 1 : 0;
  if (!joker){ w.last = pts; if (pts > 0) w.right = (w.right||0) + 1; if (pts < 2) w.wrong = (w.wrong||0) + 1; }
  let gain = base * (Q.double ? 2 : 1), bonus = [];
  if (pts > 0 && S.pet === "owl" && Q.level === "hard"){ gain += 1; bonus.push("Ola +1"); }
  if (pts === 2 && S.pet === "fox" && Q.combo > 0 && Q.combo % 3 === 0){ gain += 1; bonus.push("Flitz +1"); }
  fx(pts === 2 ? (Q.combo >= 3 ? "perfect" : "right") : pts === 1 ? "right" : "reveal");
  addXP(gain); save(); renderTop(); renderBar();
  $("qPts").textContent = `+${Q.xp} XP`;
  const all = esc(showMeaning(it.target)), extra = bonus.length ? ` · ${bonus.join(" · ")}` : "";
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  if (pts > 0) floatXP(gain);
  if (pts === 2 && Q.combo > 0 && Q.combo % 5 === 0) confetti(60);
  if (pts === 2) fb("good", `${cheer}<span class="pts">+${gain} XP</span>${Q.combo >= 3 ? `<span class="pts">${Q.combo}er-Serie</span>` : ""}<span class="sub">${all}${extra}</span>`);
  else if (pts === 1) fb("good", `Geschafft!<span class="pts">+${gain} XP</span><span class="sub">${all}${extra}</span>`);
  else fb("info", `Die Lösung: <b>${all}</b><span class="sub">Das Wort kommt zu den Fehlern dieser Runde.</span>`);
  if (note) $("qFb").innerHTML += `<span class="sub">${note}</span>`;
  $("qInput").disabled = true; $("qCheck").disabled = true; $("qLetter").disabled = true; $("qGive").hidden = true; $("qJoker").hidden = true; $("qCost").textContent = "";
  $("qNext").textContent = Q.i + 1 < Q.items.length ? "Weiter" : "Ergebnis";
  clearTimeout(autoNext);
  if (pts > 0){ $("qNext").hidden = true; const idx = Q.i; autoNext = setTimeout(() => { if (Q && Q.i === idx && tab === "ueben" && view === "quiz") next(); }, note ? 2200 : 1300); }
  else $("qNext").hidden = false;
  if (Q.level !== "normal" || it.letters || joker){ it.letters = 99; renderPattern(); }
  $("qNext").focus();
}
document.addEventListener("keydown", e => { if (e.key === "Enter" && tab === "ueben" && view === "quiz" && Q && Q.items[Q.i] && Q.items[Q.i].done && document.activeElement !== $("qNext")){ e.preventDefault(); next(); } });
const CHEERS = ["Richtig!","Stark!","Super!","Volltreffer!","Genial!","Klasse!","Mega!","Yes!"];
function floatXP(n){
  if (!n) return;
  const r = $("qInput").getBoundingClientRect(), d = document.createElement("div");
  d.className = "floatxp"; d.textContent = `+${n} XP`;
  d.style.left = (r.left + r.width / 2) + "px"; d.style.top = (r.top - 10) + "px";
  document.body.appendChild(d); setTimeout(() => d.remove(), 1100);
}
function confetti(n){
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas"); c.id = "confetti"; document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1, W = innerWidth, H = innerHeight; c.width = W * dpr; c.height = H * dpr;
  const x = c.getContext("2d"); x.scale(dpr, dpr);
  const cols = ["#ff5a5f","#14b892","#ffbf1f","#3887ff","#8457ff","#20c3e6"];
  const ps = Array.from({length:n}, () => ({x:W / 2 + (Math.random() - .5) * W * .3, y:H * .35, vx:(Math.random() - .5) * 9, vy:-Math.random() * 11 - 4,
    s:5 + Math.random() * 6, r:Math.random() * 6, vr:(Math.random() - .5) * .3, c:cols[Math.floor(Math.random() * cols.length)], round:Math.random() < .35}));
  let t = 0;
  (function frame(){
    t++; x.clearRect(0, 0, W, H);
    ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.globalAlpha = Math.max(0, 1 - t / 110);
      if (p.round){ x.beginPath(); x.arc(0, 0, p.s / 2, 0, 7); x.fill(); } else x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      x.restore(); });
    if (t < 110) requestAnimationFrame(frame); else c.remove();
  })();
}
// Wenn die Tastatur aufgeht: Eingabe + Prüfen-Knopf sichtbar halten
$("qInput").addEventListener("focus", () => setTimeout(() => { try{ $("qCard").scrollIntoView({block:"start", behavior:"smooth"}); }catch(e){} }, 320));
if (window.visualViewport) visualViewport.addEventListener("resize", () => { if (document.activeElement === $("qInput")) $("qCard").scrollIntoView({block:"start"}); });
let autoNext = null;
function next(){ clearTimeout(autoNext); if (!Q) return; Q.i++; if (Q.i < Q.items.length) showCard(); else finish(); }
function finish(){
  const res = Q.results, max = res.length * 2, pts = Q.pts;
  const t = k => res.filter(r => r.pts === k).length;
  let petBonus = 0;
  if (S.pet === "dragon" && res.length >= 5){ petBonus = 5; addXP(5); }
  const today = todayKey(), s = S.streak; let streakUp = false;
  if (res.length && s.last !== today){
    s.count = (s.last && dayDiff(s.last, today) === 1) ? s.count + 1 : 1;
    s.last = today; s.best = Math.max(s.best, s.count); streakUp = true;
  }
  if (res.length){
    if (!S.days.includes(today)){ S.days.push(today); S.days = S.days.slice(-60); }
    S.played = true;
    S.history.push({date:today, ts:Date.now(), set:Q.set, dir:Q.dir, level:Q.level, pts, max, xp:Q.xp, n:res.length});
    const cnt = k => res.filter(r => r.pts === k).length, wrongWords = res.filter(r => r.pts < 2 && !r.joker).map(r => wordById(r.id)).filter(Boolean);
    logEvent("round", `Runde geschafft – ${esc0(Q.set)} (${Math.round(pts / Math.max(1, max) * 100)} %)`, [
      `Liste: ${Q.set}`, `Richtung: ${DIRS[Q.dir] || Q.dir} · Schwierigkeit: ${LEVELS[Q.level] || Q.level}`,
      `Wörter: ${res.length} · sofort richtig: ${cnt(2)} · mit Hilfe: ${cnt(1)} · nicht gewusst: ${cnt(0)}`,
      `XP in dieser Runde: +${Q.xp}${Q.double ? " (Doppel-XP aktiv)" : ""}${Q.jokers ? ` · Joker benutzt: ${Q.jokers}` : ""}`,
      `Stand jetzt: Level ${levelOf(S.points)}, ${S.points} XP, ${S.coins} Kristalle, Streak ${s.count} ${s.count === 1 ? "Tag" : "Tage"}`,
      ...(levelUps.length ? [`Level-Up auf ${levelUps[levelUps.length - 1].level}!`] : []),
      ...(wrongWords.length ? ["", "Noch üben:", ...wrongWords.map(w => `– ${showMeaning(w.en)} = ${w.de}`)] : ["", "Alle Wörter sofort richtig!"])]);
    S.history = S.history.slice(-100);
  }
  let snacks = 0;
  if (res.length && S.pet){ const c = careTick(); snacks = Math.min(SNACK_MAX - c.snacks, (res.length >= 5 ? 2 : 1) + (max && pts / max >= .8 ? 1 : 0)); c.snacks += Math.max(0, snacks); }
  shieldNote = "";
  save();
  // Für die Rangliste zählen die XP ohne Verdopplung durch das Doppel-XP-Power-up
  if (res.length && !ADMIN) rankAfterRound(Q.double ? Math.round(Q.xp / 2) : Q.xp, res.length);
  R = {practice: res.filter(r => r.pts < 2).map(r => wordById(r.id)).filter(Boolean), dir:Q.dir, level:Q.level, set:Q.set};
  $("rPts").textContent = "+" + Q.xp; $("rMax").textContent = `${pts} von ${max} Punkten`;
  $("rT2").textContent = t(2); $("rT1").textContent = t(1); $("rT0").textContent = t(0);
  const pct = max ? pts / max : 0;
  $("rMsg").textContent = pct === 1 ? `Alles sofort richtig, ${nick()}. Perfekte Runde!` : pct >= .8 ? `Sehr stark, ${nick()}! Nur noch ein paar Kleinigkeiten.` : pct >= .5 ? "Gut gemacht! Die Fehler übst du am besten gleich nochmal." : `Dranbleiben, ${nick()}! Mit jeder Runde sitzen mehr Wörter.`;
  let b = "";
  if (Q.double) b += `<div class="banner" style="background:var(--sun);color:#1a1f3a">Doppel-XP war aktiv. Alle XP zählten doppelt.</div>`;
  if (petBonus) b += `<div class="banner" style="background:var(--surface-2)">${petSvg("dragon")}Funki schenkt dir +5 Bonus-XP!</div>`;
  if (streakUp) b += `<div class="banner" style="background:var(--flame);color:#fff">Flamme an: ${s.count} ${s.count === 1 ? "Tag" : "Tage"} in Folge!</div>`;
  if (levelUps.length){ const top = levelUps[levelUps.length - 1], coins = levelUps.reduce((a, l) => a + l.coins, 0);
    b += `<div class="banner" style="background:var(--crystal);color:#10233a">${CRYSTAL}Level-Up auf ${top.level}! +${coins} Kristalle für den Shop.</div>`; }
  if (snacks > 0) b += `<div class="banner" style="background:var(--surface-2)">${petSvg(S.pet)}${esc(PETS[S.pet].name)} bekommt ${snacks} ${snacks === 1 ? "Leckerli" : "Leckerlis"} zum Füttern.</div>`;
  $("rBanners").innerHTML = b;
  $("rAvatar").innerHTML = S.pet ? avatarSVG(S.pet) : ""; $("rAvatar").hidden = !S.pet;
  $("rPractice").innerHTML = R.practice.length ? `<div class="label">Nochmal üben</div><ul class="plain vlist">${R.practice.map(w => `<li><div class="en">${esc(showMeaning(w.en))}</div><div>${esc(w.de)}</div><div></div></li>`).join("")}</ul>` : "";
  $("rAgainHard").hidden = !R.practice.length;
  const goodRound = max && pts / max >= .7;
  Q = null; renderTop(); go("ueben","result"); if (goodRound || levelUps.length) setTimeout(() => confetti(goodRound && pts === max ? 160 : 100), 150); if (res.length && !levelUps.length) fx("finish");
}
$("rAgainHard").onclick = () => { const r = R; R = null; startRound({dir:r.dir, level:r.level}, r.practice.map(w => w.id), r.set.replace(/ · Fehler$/,"") + " · Fehler"); };
$("rBack").onclick = () => { R = null; view = "home"; go("dash"); const st = $("streak"); st.classList.remove("pop"); void st.offsetWidth; st.classList.add("pop"); };

/* ---------- Shop ---------- */
let confirmKey = null;
function priceHtml(c){ return `<span class="price">${CRYSTAL}${c}</span>`; }
function petCost(k){ return S.pets.length ? PETS[k].cost : STARTER_COST; }
function renderShop(){
  $("walletNum").textContent = S.coins; wearConfirm = null; renderShopWear();
  $("powerups").innerHTML = Object.entries(POWERUPS).map(([k, p]) => {
    const can = S.coins >= p.cost, ck = confirmKey === "p:" + k;
    return `<div class="item"><div class="icon">${p.icon}</div>
      <h3>${esc(p.name)} <small>${S.inv[k] ? `${S.inv[k]}× im Rucksack` : ""}${k === "double" && S.armed.double ? " · aktiviert" : ""}</small></h3>
      <p>${esc(p.desc)}</p>
      <div class="act"><button class="btn ${ck ? "coral" : "sky"} small" data-buy="p:${k}" ${can ? "" : "disabled"}>${ck ? `Wirklich kaufen? ${priceHtml(p.cost)}` : `Kaufen ${priceHtml(p.cost)}`}</button>
      ${k === "double" && S.inv.double && !S.armed.double ? `<button class="btn grape small" data-arm="double">Für nächste Runde aktivieren</button>` : ""}</div></div>`;
  }).join("");
  $("pets").innerHTML = Object.entries(PETS).map(([k, p]) => {
    const cost = petCost(k), owned = S.pets.includes(k), active = S.pet === k, can = S.coins >= cost, ck = confirmKey === "pet:" + k;
    let act;
    if (active) act = `<span class="tag">Ist dabei</span>`;
    else if (owned) act = `<button class="btn grape small" data-pet="${k}">Mitnehmen</button>`;
    else act = `<button class="btn ${ck ? "coral" : "sky"} small" data-buy="pet:${k}" ${can ? "" : "disabled"}>${ck ? `Wirklich kaufen? ${priceHtml(cost)}` : `Adoptieren ${priceHtml(cost)}`}</button>${S.pets.length ? "" : `<small class="muted" style="width:100%">Dein erster Begleiter kostet nur ${STARTER_COST}.</small>`}`;
    return `<div class="item"><div class="icon pet">${petSvg(k)}</div><h3>${esc(p.name)} <small>${esc(p.kind)}</small></h3><p>${esc(p.bonus)}</p><div class="act">${act}</div></div>`;
  }).join("");
}
$("shop").addEventListener("click", e => {
  const buy = e.target.closest("[data-buy]"), pet = e.target.closest("[data-pet]"), arm = e.target.closest("[data-arm]");
  if (buy){
    const key = buy.dataset.buy;
    if (confirmKey !== key){ confirmKey = key; renderShop(); return; }
    confirmKey = null;
    const [type, k] = key.split(":"), item = type === "p" ? POWERUPS[k] : Object.assign({}, PETS[k], {cost:petCost(k)});
    if (S.coins < item.cost){ toast("Nicht genug Kristalle."); renderShop(); return; }
    S.coins -= item.cost;
    if (type === "p"){ S.inv[k]++; toast(`${item.name} gekauft!`); }
    else { S.pets.push(k); S.pet = k; toast(`${item.name} ist jetzt dabei!`); }
    logEvent("shop", `Im Shop eingekauft: ${type === "p" ? item.name : item.kind + " " + item.name}`,
      [`Gekauft: ${type === "p" ? "Power-up " + item.name : "Pet " + item.kind + " " + item.name}`, `Preis: ${item.cost} Kristalle`, `Übrige Kristalle: ${S.coins}`, `Level ${levelOf(S.points)}, ${S.points} XP`]);
    save(); renderTop(); bump("coinBtn"); fx("coin"); renderShop();
  }
  if (pet){ S.pet = pet.dataset.pet; save(); toast(`${PETS[S.pet].name} ist jetzt dabei!`); renderShop(); }
  if (arm && S.inv.double > 0 && !S.armed.double){ S.inv.double--; S.armed.double = true; save(); toast("Doppel-XP aktiviert"); renderShop(); }
});


/* ================= Avatar: Kleidung, Skins, Auren ================= */
// Ankerpunkte je Pet (im 256er-Bild): Kopf oben, Augenmitte, Hals. s = Skalierung, r = Neigung in Grad
const ANCHOR = {
  fox:   {head:{x:156,y:58,s:1.2,r:12},  eyes:{x:158,y:106,s:0.96,r:20}, neck:{x:146,y:148,s:0.95,r:10}},
  turtle:{head:{x:134,y:24,s:1.35,r:12},  eyes:{x:133,y:60,s:1.2,r:17},   neck:{x:128,y:119,s:1.1,r:8}},
  owl:   {head:{x:126,y:32,s:1.45,r:8},   eyes:{x:126,y:90,s:1.21,r:13},  neck:{x:122,y:128,s:1.15,r:6}},
  dragon:{head:{x:138,y:48,s:1.3,r:-12},  eyes:{x:147,y:89,s:1.2,r:-17},  neck:{x:130,y:147,s:1.05,r:-8}},
};
const SLOTS = [["head","Kopf"],["eyes","Augen"],["neck","Hals"],["back","Rücken"],["skin","Skin"],["aura","Aura"]];
const heart = (x) => `<path transform="translate(${x} 2) scale(1.55)" d="M0 8C-13-1-13-13-6-13c4 0 6 3 6 5 0-2 2-5 6-5 7 0 7 12-6 21z"/>`;
const star = (x, c) => `<path transform="translate(${x} 0)" d="M0-15l4.4 9 9.9 1.4-7.2 7 1.7 9.8L0 7.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4z" fill="${c}"/>`;
const WEAR = {
  // Kopf
  cap:    {slot:"head", name:"Basecap", cost:10, svg:`<path d="M-30 0Q-30-36 0-36Q30-36 30 0Z" fill="#3887ff"/><path d="M18-4Q48-8 60 2Q40 7 18 4Z" fill="#2265cc"/><circle cy="-36" r="5" fill="#ffbf1f"/><path d="M-30 0H30" stroke="#2265cc" stroke-width="5"/>`},
  party:  {slot:"head", name:"Partyhut", cost:8, svg:`<path d="M-20 0L0-56L20 0Z" fill="#ff5a5f"/><path d="M-13-18H13M-7-37H7" stroke="#ffbf1f" stroke-width="5"/><circle cy="-58" r="7" fill="#14b892"/>`},
  wizard: {slot:"head", name:"Zauberhut", cost:20, svg:`<path d="M-40 0Q0-12 40 0Q20 7 0 7Q-20 7-40 0Z" fill="#6236d6"/><path d="M-26-2L8-72L26-2Z" fill="#8457ff"/><path d="M-2-42l3 6 6 1-5 4 2 6-6-3-6 3 2-6-5-4 6-1z" fill="#ffbf1f"/><circle cx="12" cy="-24" r="3" fill="#fff"/>`},
  viking: {slot:"head", name:"Wikingerhelm", cost:22, svg:`<path d="M-30-14Q-58-20-54-50Q-44-28-26-24Z" fill="#fff6e0" stroke="#c9b48a" stroke-width="2"/><path d="M30-14Q58-20 54-50Q44-28 26-24Z" fill="#fff6e0" stroke="#c9b48a" stroke-width="2"/><path d="M-32 0Q-32-36 0-36Q32-36 32 0Z" fill="#9aa3b5"/><rect x="-34" y="-7" width="68" height="9" rx="4" fill="#6b7385"/><circle cx="-18" cy="-2" r="2.5" fill="#d7dce6"/><circle cx="18" cy="-2" r="2.5" fill="#d7dce6"/>`},
  crown:  {slot:"head", name:"Krone", cost:25, svg:`<path d="M-30 0L-33-32L-16-15L0-38L16-15L33-32L30 0Z" fill="#ffcc33" stroke="#d99a00" stroke-width="3" stroke-linejoin="round"/><rect x="-30" y="-8" width="60" height="8" fill="#d99a00"/><circle cy="-38" r="5" fill="#ff5a5f"/><circle cx="-33" cy="-32" r="4" fill="#20c3e6"/><circle cx="33" cy="-32" r="4" fill="#20c3e6"/><circle cy="-4" r="3.5" fill="#14b892"/>`},
  // Augen
  sun:    {slot:"eyes", name:"Sonnenbrille", cost:10, svg:`<rect x="-36" y="-12" width="30" height="21" rx="9" fill="#1a1f3a"/><rect x="6" y="-12" width="30" height="21" rx="9" fill="#1a1f3a"/><path d="M-6-4H6" stroke="#1a1f3a" stroke-width="4"/><path d="M-30-6h9M12-6h9" stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round"/>`},
  hearts: {slot:"eyes", name:"Herzbrille", cost:12, svg:`<g fill="#ff5a5f" opacity=".92">${heart(-20)}${heart(20)}</g><path d="M-6-3H6" stroke="#d63c42" stroke-width="3"/>`},
  stars:  {slot:"eyes", name:"Sternbrille", cost:15, svg:`<g stroke="#d99a00" stroke-width="2.5">${star(-20,"#ffcc33")}${star(20,"#ffcc33")}</g><path d="M-6-2H6" stroke="#d99a00" stroke-width="3"/>`},
  // Hals
  scarf:  {slot:"neck", name:"Schal", cost:8, svg:`<path d="M-32-6Q0 8 32-6L34 7Q0 21-34 7Z" fill="#ff5a5f"/><path d="M14 5L23 36L10 36L6 9Z" fill="#d63c42"/><path d="M-28 1Q0 13 28 1" stroke="#fff" stroke-width="3" stroke-dasharray="6 6" fill="none" opacity=".6"/>`},
  bow:    {slot:"neck", name:"Fliege", cost:10, svg:`<path d="M0 0L-24-13L-24 13Z" fill="#8457ff"/><path d="M0 0L24-13L24 13Z" fill="#8457ff"/><circle r="6" fill="#6236d6"/>`},
  medal:  {slot:"neck", name:"Goldmedaille", cost:18, svg:`<path d="M-16-8L0 18L16-8" stroke="#3887ff" stroke-width="7" fill="none"/><circle cy="27" r="12" fill="#ffcc33" stroke="#d99a00" stroke-width="3"/><path d="M0 20l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" fill="#d99a00"/>`},
  // Rücken (hinter dem Pet)
  cape:   {slot:"back", name:"Heldenumhang", cost:30, svg:`<path d="M-34-6Q0 4 34-6L52 82Q0 98-52 82Z" fill="#ff5a5f"/><path d="M-34-6Q0 4 34-6" stroke="#d63c42" stroke-width="7" fill="none"/><path d="M0 30l4 8 9 1-6.5 6 1.5 9L0 50l-8 4 1.5-9L-13 39l9-1z" fill="#ffcc33"/>`},
  wings:  {slot:"back", name:"Engelsflügel", cost:35, svg:`<g fill="#fff" stroke="#c7d0ff" stroke-width="3"><path d="M-8 4Q-60-40-96-10Q-80 0-90 14Q-70 12-74 30Q-40 30-8 18Z"/><path d="M8 4Q60-40 96-10Q80 0 90 14Q70 12 74 30Q40 30 8 18Z"/></g>`},
  // Skins (Farbfilter auf das Pet)
  gold:   {slot:"skin", name:"Gold", cost:40, filter:`<feColorMatrix type="matrix" values="0.55 0.55 0.15 0 0.08 0.45 0.5 0.12 0 0.03 0.15 0.22 0.08 0 0 0 0 0 1 0"/>`},
  ice:    {slot:"skin", name:"Eis", cost:35, filter:`<feColorMatrix type="hueRotate" values="170"/><feComponentTransfer><feFuncR type="linear" slope=".85" intercept=".12"/><feFuncG type="linear" slope=".9" intercept=".12"/><feFuncB type="linear" slope="1" intercept=".18"/></feComponentTransfer>`},
  shadow: {slot:"skin", name:"Schatten", cost:45, filter:`<feColorMatrix type="matrix" values="0.25 0.18 0.1 0 0.02 0.12 0.14 0.18 0 0 0.3 0.22 0.4 0 0.06 0 0 0 1 0"/>`},
  neon:   {slot:"skin", name:"Neon", cost:50, filter:`<feColorMatrix type="hueRotate" values="285"/><feColorMatrix type="saturate" values="1.9"/>`},
  rainbow:{slot:"skin", name:"Regenbogen", cost:60, filter:`<feColorMatrix type="hueRotate" values="0"><animate attributeName="values" from="0" to="360" dur="4s" repeatCount="indefinite"/></feColorMatrix>`},
  // Auren (hinter allem)
  sparkle:{slot:"aura", name:"Glitzer", cost:25, svg:`<g fill="#ffcc33">${[[40,60,1],[214,48,.8],[226,150,1.1],[30,170,.9],[128,14,.7],[70,230,.6],[196,226,.8]].map(([x,y,k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0-14Q2-2 14 0Q2 2 0 14Q-2 2-14 0Q-2-2 0-14Z"><animate attributeName="opacity" values="1;.25;1" dur="${1.4 + k}s" repeatCount="indefinite"/></path>`).join("")}</g>`},
  fire:   {slot:"aura", name:"Feuerring", cost:35, svg:`<ellipse cx="128" cy="232" rx="108" ry="20" fill="#ff7a1a" opacity=".35"/><g>${[30,60,90,120,150,180,210].map((x,i) => `<path transform="translate(${x + 8} 238)" d="M0 0Q-14-20 0-46Q4-30 12-28Q16-14 0 0Z" fill="${i % 2 ? "#ffbf1f" : "#ff5a5f"}" opacity=".9"><animate attributeName="opacity" values=".9;.5;.9" dur="${0.8 + i * .1}s" repeatCount="indefinite"/></path>`).join("")}</g>`},
  ring:   {slot:"aura", name:"Regenbogenring", cost:45, svg:`<g fill="none" stroke-width="7" opacity=".85">${["#ff5a5f","#ffbf1f","#14b892","#3887ff","#8457ff"].map((c, i) => `<circle cx="128" cy="128" r="${118 - i * 8}" stroke="${c}"/>`).join("")}</g>`},
};
let avN = 0;
function outfitOf(pet){ S.outfits = S.outfits || {}; return S.outfits[pet] = Object.assign({}, S.outfits[pet] || {}); }
function avatarSVG(pet, outfit, extra){
  if (!ART[pet]) return mascotSvg();
  const o = outfit || (S.outfits && S.outfits[pet]) || {}, A = ANCHOR[pet], id = "av" + (++avN);
  const at = (slot, w) => { const a = A[slot === "back" ? "neck" : slot]; return `<g transform="translate(${a.x} ${a.y}) rotate(${a.r}) scale(${a.s})">${w.svg}</g>`; };
  const W = k => k && WEAR[k];
  const skin = W(o.skin);
  return `<svg class="av" viewBox="-16 -40 288 312" aria-hidden="true">
    ${skin ? `<defs><filter id="${id}f" color-interpolation-filters="sRGB">${skin.filter}</filter></defs>` : ""}
    ${W(o.aura) ? W(o.aura).svg : ""}
    ${W(o.back) ? at("back", W(o.back)) : ""}
    <image href="${ART[pet]}" x="0" y="0" width="256" height="256" ${skin ? `filter="url(#${id}f)"` : ""}/>
    ${W(o.neck) ? at("neck", W(o.neck)) : ""}
    ${W(o.eyes) ? at("eyes", W(o.eyes)) : ""}
    ${W(o.head) ? at("head", W(o.head)) : ""}
  </svg>`;
}
const LOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
let avSlot = "head", shopSlot = "head", wearConfirm = null, starterConfirm = null;
const STARTER_COST = 20;
function wearTile(k, w, mode){
  const pet = S.pet || "fox", owned = (S.wardrobe || []).includes(k), o = outfitOf(pet), on = o[w.slot] === k;
  const prevOutfit = Object.assign({}, o, {[w.slot]: k});
  const cls = ["witem", on ? "on" : "", owned ? "" : "locked", wearConfirm === k ? "confirm" : ""].join(" ");
  const label = owned ? (on ? "Angezogen" : mode === "shop" ? "Gekauft" : "Anziehen")
    : wearConfirm === k ? `Wirklich? ${CRYSTAL}${w.cost}` : `${CRYSTAL}${w.cost}`;
  return `<button class="${cls}" data-wear="${k}" data-mode="${mode}"><span class="prev">${avatarSVG(pet, prevOutfit)}</span><b>${esc(w.name)}</b><small>${label}</small></button>`;
}
function slotTabs(cur){ return SLOTS.map(([k, n]) => `<button role="tab" aria-selected="${k === cur}" data-slot="${k}">${n}</button>`).join(""); }
function renderAvatar(){
  const has = S.pets.length > 0;
  if (has && !S.pet) S.pet = S.pets[0];
  $("avStarter").hidden = has; $("avMain").hidden = !has;
  const p = S.pet && PETS[S.pet];
  $("avStage").innerHTML = has
    ? `${!RM ? `<button class="tog3d" data-3d aria-pressed="${S.settings.pet3d !== false}">3D</button>` : ""}<div class="yard"><div class="big" style="transform:translateX(${PETM.x}px)"><div class="floor"></div>${petBox(avatarSVG(S.pet), "big")}</div></div><h2>${esc(p.name)}</h2><p>${esc(p.kind)} · ${esc(p.bonus)}</p><p class="lovebar" id="loveBar">${loveText()}</p><div class="care" id="care"></div>`
    : `<div class="big">${mascotSvg()}</div><h2>Dein Avatar</h2><p>Such dir deinen ersten Begleiter aus. Er kostet nur ${STARTER_COST} Kristalle${S.coins < STARTER_COST ? ` – dir fehlen noch ${STARTER_COST - S.coins}` : ""}.</p>`;
  if (!has){
    $("avStarterList").innerHTML = Object.entries(PETS).map(([k, q]) => `<button data-starter="${k}" aria-pressed="${starterConfirm === k}" ${S.coins < STARTER_COST ? 'class="locked"' : ""}><span class="pp"><img src="${ART[k]}" alt=""></span>${starterConfirm === k ? "Kaufen?" : esc(q.name)}<span class="lock">${CRYSTAL}${STARTER_COST}</span></button>`).join("");
    return;
  }
  $("avPets").innerHTML = Object.entries(PETS).map(([k, q]) => {
    const owned = S.pets.includes(k);
    return `<button data-avpet="${k}" aria-pressed="${S.pet === k}" class="${owned ? "" : "locked"}"><span class="pp"><img src="${ART[k]}" alt=""></span>${esc(q.name)}${owned ? "" : `<span class="lock">${LOCK}${q.cost}</span>`}</button>`;
  }).join("");
  $("avSlots").innerHTML = slotTabs(avSlot);
  const items = Object.entries(WEAR).filter(([, w]) => w.slot === avSlot);
  const o = outfitOf(S.pet);
  $("avItems").innerHTML = `<button class="witem none ${o[avSlot] ? "" : "on"}" data-unwear="${avSlot}"><span class="prev">∅</span><b>Nichts</b><small>ausziehen</small></button>` + items.map(([k, w]) => wearTile(k, w, "avatar")).join("");
  petStage();
}
function renderShopWear(){
  $("shopSlots").innerHTML = slotTabs(shopSlot);
  $("shopWear").innerHTML = Object.entries(WEAR).filter(([, w]) => w.slot === shopSlot).map(([k, w]) => wearTile(k, w, "shop")).join("")
    + (S.pets.length ? "" : `<p class="muted" style="grid-column:1/-1;margin:0">Vorschau mit Flitz. Unter „Avatar“ holst du dir deinen ersten Begleiter für 20 Kristalle.</p>`);
}
function buyWear(k){
  const w = WEAR[k];
  if (S.coins < w.cost){ toast(`Dafür brauchst du ${w.cost} Kristalle.`); fx("wrong"); return false; }
  S.coins -= w.cost; S.wardrobe = (S.wardrobe || []).concat([k]);
  if (S.pet){ const o = outfitOf(S.pet); o[w.slot] = k; S.outfits[S.pet] = o; }
  logEvent("shop", `Im Shop eingekauft: ${w.name}`, [`Gekauft: ${w.name} (${SLOTS.find(s => s[0] === w.slot)[1]})`, `Preis: ${w.cost} Kristalle`, `Übrige Kristalle: ${S.coins}`, `Level ${levelOf(S.points)}, ${S.points} XP`]);
  save(); renderTop(); bump("coinBtn"); fx("coin"); toast(`${w.name} gekauft und angezogen!`);
  return true;
}
function onWearClick(e){
  const t = e.target.closest("[data-wear],[data-unwear],[data-slot],[data-avpet],[data-starter]"); if (!t) return;
  if (t.dataset.slot){ if (t.closest("#shopSlots")) { shopSlot = t.dataset.slot; renderShopWear(); } else { avSlot = t.dataset.slot; renderAvatar(); } wearConfirm = null; fx("tap"); return; }
  if (t.dataset.starter){
    const k = t.dataset.starter;
    if (S.coins < STARTER_COST){ toast(`Dir fehlen noch ${STARTER_COST - S.coins} Kristalle.`); fx("wrong"); return; }
    if (starterConfirm !== k){ starterConfirm = k; fx("tap"); renderAvatar(); return; }
    starterConfirm = null; S.coins -= STARTER_COST; S.pets.push(k); S.pet = k; save(); renderTop(); bump("coinBtn"); fx("level"); confetti(80);
    logEvent("shop", `Erster Begleiter gekauft: ${PETS[k].kind} ${PETS[k].name}`, [`Erster Begleiter: ${PETS[k].kind} ${PETS[k].name}`, `Preis: ${STARTER_COST} Kristalle`, `Übrige Kristalle: ${S.coins}`, `Bonus: ${PETS[k].bonus}`]);
    toast(`${PETS[k].name} ist jetzt dein Begleiter!`); renderAvatar(); return;
  }
  if (t.dataset.avpet){ const k = t.dataset.avpet; if (S.pets.includes(k)){ S.pet = k; save(); fx("tap"); renderAvatar(); } else { setTab("shop"); toast(`${PETS[k].name} findest du bei den Pets.`); } return; }
  if (t.dataset.unwear){ const o = outfitOf(S.pet); delete o[t.dataset.unwear]; S.outfits[S.pet] = o; save(); fx("tap"); renderAvatar(); return; }
  const k = t.dataset.wear, w = WEAR[k], owned = (S.wardrobe || []).includes(k), mode = t.dataset.mode;
  if (owned){
    if (!S.pet){ toast("Wähle zuerst unter „Avatar“ einen Begleiter."); return; }
    const o = outfitOf(S.pet); o[w.slot] = o[w.slot] === k ? undefined : k; if (!o[w.slot]) delete o[w.slot]; S.outfits[S.pet] = o; save(); fx("tap");
  } else if (wearConfirm !== k){ wearConfirm = k; }
  else { wearConfirm = null; buyWear(k); }
  mode === "shop" ? (renderShopWear(), $("walletNum").textContent = S.coins) : renderAvatar();
}
$("avatar").addEventListener("click", onWearClick);
$("shopSlots").addEventListener("click", onWearClick);
$("shopWear").addEventListener("click", onWearClick);


/* ================= Lebendige Pets ================= */
const HEART = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C5 15.5 2 12.3 2 8.6 2 5.6 4.4 3.5 7.1 3.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 2.7 0 5.1 2.1 5.1 5.1 0 3.7-3 6.9-10 12.4z" fill="#ff5a5f"/></svg>`;
const PET_LINES = {
  pet: ["Hihi, das kitzelt!","Mehr, mehr!","Schnurr…","Du bist der Beste!","Oh ja, genau da!","Ich mag dich, {n}!"],
  tap: ["Hey {n}!","Lass uns Vokabeln üben!","Hüpf!","Was machen wir heute?","Ich bin bereit!","Noch eine Runde?"],
  hungry: ["Ich hab Hunger!","Mein Bauch knurrt…","Hast du ein Leckerli?"],
  tired: ["Gääähn…","Ich bin so müde.","Darf ich schlafen?"],
  bored: ["Mir ist langweilig!","Spielst du mit mir?","Wirf den Ball!"],
  sleep: ["Zzz…"],
  eat: ["Mjam!","Lecker!","Danke, {n}!"],
  full: ["Ich bin pappsatt!"],
  play: ["Hab ihn!","Nochmal!","Juhu!"],
  wake: ["Guten Morgen!","Ausgeschlafen!","Da bin ich wieder!"],
};
/* Pflege wie beim Tamagotchi. Werte 0–100, sie sinken pro Stunde. Leckerlis gibt es für geübte Runden.
   Auf XP, Kristalle und Streak hat die Pflege keinen Einfluss, und das Pet kann nicht sterben. */
const CARE_DROP = {food:4, fun:5, energy:3}, CARE_SLEEP = {food:2, energy:30}, SNACK_FOOD = 30, SNACK_MAX = 20;
const RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
const PETM = {x:0, left:false, busy:false, w:null, t:null};
const ZZZ = [0, 1, 2].map(i => `<span class="zzz" style="animation-delay:${i}s">z</span>`).join("");
const COOKIE = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#d99a4e"/><g fill="#6b3e1d"><circle cx="8" cy="9" r="1.8"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="15" cy="14.5" r="2"/><circle cx="9" cy="15.5" r="1.5"/></g></svg>`;
const BALL = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ff5a5f"/><path d="M3 9q9 5 18 0" stroke="#fff" stroke-width="2.5" fill="none"/><circle cx="8.5" cy="6.5" r="2" fill="#fff" opacity=".5"/></svg>`;
const MOON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" fill="#8457ff"/></svg>`;
const SUNUP = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#ffbf1f"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="#ffbf1f" stroke-width="2.5" stroke-linecap="round"/></svg>`;
const clamp100 = v => Math.round(Math.max(0, Math.min(100, v)) * 100) / 100;
function careTick(){
  const now = Date.now(), c = S.care = S.care || {food:80, fun:80, energy:80, snacks:3, sleep:false, t:now};
  let h = Math.min(72, Math.max(0, (now - c.t) / 36e5)); c.t = now;
  for (; h > 0; h -= .25){
    const d = Math.min(.25, h);
    if (c.sleep){ c.energy += CARE_SLEEP.energy * d; c.food -= CARE_SLEEP.food * d; if (c.sleep === "auto" && c.energy >= 100) c.sleep = false; }
    else { c.food -= CARE_DROP.food * d; c.fun -= CARE_DROP.fun * d; c.energy -= CARE_DROP.energy * d; if (c.energy <= 0) c.sleep = "auto"; }
    c.food = clamp100(c.food); c.fun = clamp100(c.fun); c.energy = clamp100(c.energy);
  }
  return c;
}
function careMood(){
  if (!S || !S.pet) return "ok";
  const c = careTick();
  return c.sleep ? "sleep" : c.food < 25 ? "hungry" : c.energy < 20 ? "tired" : c.fun < 25 ? "bored" : Math.min(c.food, c.fun, c.energy) >= 60 ? "happy" : "ok";
}
const MOOD_TEXT = {sleep:"schläft tief und fest", hungry:"hat Hunger", tired:"ist müde", bored:"langweilt sich", happy:"ist glücklich", ok:"geht es gut"};
const moodClass = m => m === "sleep" ? "sleep" : m === "hungry" || m === "tired" || m === "bored" ? "sad" : "";
function petBox(inner, size){
  const m = moodClass(careMood());
  return `<div class="petbox ${size || ""} ${m}" data-pettable role="button" tabindex="0" aria-label="Streicheln"><div class="body"><div class="face">${inner}</div></div>${m === "sleep" ? ZZZ : ""}</div>`;
}
function todayLove(){ const t = todayKey(); S.love = S.love && S.love.date === t ? S.love : {date:t, n:0}; return S.love; }
function loveText(){ const n = todayLove().n; return `${HEART}${n ? `${n}× gestreichelt heute` : "Streichel mich! Wisch über mich drüber."}`; }
let petDrag = null, loveSaveT = null;
function spawnHeart(box, x, y){
  const h = document.createElement("span"); h.className = "heart"; h.innerHTML = HEART;
  h.style.left = x + "px"; h.style.top = y + "px"; h.style.setProperty("--rot", (Math.random() * 40 - 20) + "deg");
  box.appendChild(h); setTimeout(() => h.remove(), 1000);
}
function petSay(box, kind){
  box.querySelectorAll(".say").forEach(e => e.remove());
  const l = PET_LINES[kind], d = document.createElement("div"); d.className = "say";
  d.textContent = l[Math.floor(Math.random() * l.length)].replace("{n}", nick()); box.appendChild(d);
  clearTimeout(box._sayT); box._sayT = setTimeout(() => d.remove(), 1800);
}
function purr(){ if (!S.settings.sound) return; [0, .09, .18].forEach((t, i) => tone(150 + i * 12, t, .12, "sine", .09, 120)); }
function chirp(){ if (!S.settings.sound) return; tone(620, 0, .12, "triangle", .12, 980); tone(980, .1, .12, "triangle", .1, 760); }
function addLove(box){
  const L = todayLove(); L.n++;
  const lb = document.getElementById("loveBar"); if (lb) lb.innerHTML = loveText();
  if (S.pet){ const c = careTick(); if (!c.sleep){ c.fun = clamp100(c.fun + 1); if (L.n % 3 === 0) renderCare(); } }
  clearTimeout(loveSaveT); loveSaveT = setTimeout(save, 1500);
}
document.addEventListener("pointerdown", e => {
  const box = e.target.closest("[data-pettable]"); if (!box) return;
  const r = box.getBoundingClientRect();
  petDrag = {box, x:e.clientX, y:e.clientY, dist:0, hearts:0, r};
  try{ box.setPointerCapture(e.pointerId); }catch(err){}
});
document.addEventListener("pointermove", e => {
  if (!petDrag) return;
  const d = Math.hypot(e.clientX - petDrag.x, e.clientY - petDrag.y);
  petDrag.dist += d; petDrag.x = e.clientX; petDrag.y = e.clientY;
  if (petDrag.dist > 34){
    petDrag.dist = 0; petDrag.hearts++;
    const r = petDrag.box.getBoundingClientRect();
    spawnHeart(petDrag.box, e.clientX - r.left, e.clientY - r.top);
    petDrag.box.classList.remove("jump"); petDrag.box.classList.add("happy");
    clearTimeout(petDrag.box._hT); const b = petDrag.box; b._hT = setTimeout(() => b.classList.remove("happy"), 650);
    if (petDrag.hearts % 3 === 1){ purr(); if (S.settings.vib && canVibrate) try{ navigator.vibrate(12); }catch(err){} }
    if (petDrag.hearts === 4) petSay(petDrag.box, "pet");
    addLove(petDrag.box);
  }
});
function endPet(e){
  if (!petDrag) return;
  const {box, hearts} = petDrag; petDrag = null;
  if (!hearts){ // Antippen: hüpfen und etwas sagen
    const m = careMood();
    if (m === "sleep"){ petSay(box, "sleep"); return; }
    petHop(box);
    chirp(); petSay(box, PET_LINES[m] ? m : "tap");
    const r = box.getBoundingClientRect(); spawnHeart(box, r.width / 2, r.height * .3);
  }
}
document.addEventListener("pointerup", endPet);
document.addEventListener("pointercancel", () => { petDrag = null; });
document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-pettable]")){ e.preventDefault(); petDrag = {box:e.target, hearts:0}; endPet(); } });
// ab und zu schaut das Pet sich um
setInterval(() => {
  document.querySelectorAll("[data-pettable]").forEach(b => {
    if (b.offsetParent && !b.classList.contains("happy") && !b.classList.contains("sleep") && !b.classList.contains("walk") && Math.random() < .5){ b.classList.add("idle-look"); setTimeout(() => b.classList.remove("idle-look"), 1700); }
  });
}, 7000);

/* ---------- Pflege: Bühne, Herumlaufen, Füttern, Spielen, Schlafen ---------- */
function petHop(box){ box.classList.remove("happy","jump"); void box.offsetWidth; box.classList.add("jump"); setTimeout(() => box.classList.remove("jump"), 600); }
function yardEls(){ const yard = document.querySelector("#avStage .yard"); return yard && {yard, big:yard.querySelector(".big"), box:yard.querySelector(".petbox")}; }
function walkRange(y){ return Math.max(0, (y.yard.clientWidth - y.big.offsetWidth) / 2 + y.big.offsetWidth * .1); }
function walkTo(x, speed, cb){
  const y = yardEls(); if (!y) return;
  const dur = Math.max(.25, Math.abs(x - PETM.x) / speed);
  PETM.left = x < PETM.x; y.box.classList.toggle("left", PETM.left); y.box.classList.add("walk");
  y.big.style.transition = `transform ${dur}s linear`; y.big.style.transform = `translateX(${x}px)`;
  PETM.x = x; PETM.busy = true;
  clearTimeout(PETM.w); PETM.w = setTimeout(() => {
    PETM.busy = false; const z = yardEls(); if (z) z.box.classList.remove("walk"); if (cb) cb(z);
  }, dur * 1000);
}
// Das Pet entscheidet alle paar Sekunden selbst, was es tut
function petThink(){
  clearTimeout(PETM.t);
  if (tab !== "avatar" || !S.pet) return;
  PETM.t = setTimeout(petThink, 2200 + Math.random() * 2400);
  const y = yardEls(); if (!y || PETM.busy || petDrag || RM) return;
  const m = careMood(), r = Math.random(), good = m === "happy" || m === "ok";
  if (m === "sleep") return;
  if (r < (m === "happy" ? .7 : good ? .55 : .3)){ const R = walkRange(y); walkTo((Math.random() * 2 - 1) * R, good ? 45 : 22); }
  else if (m === "happy" && r < .82) petHop(y.box);
  else if (!good && r > .7) petSay(y.box, m);
}
function petStage(){
  clearTimeout(PETM.w); PETM.busy = false;
  const y = yardEls(); if (y) y.box.classList.toggle("left", PETM.left);
  pet3dMount();
  renderCare();
  clearTimeout(PETM.t); PETM.t = setTimeout(petThink, 1800);
}
function renderCare(){
  const el = document.getElementById("care"); if (!el || !S.pet) return;
  const c = careTick(), m = careMood(), name = PETS[S.pet].name, asleep = !!c.sleep;
  const need = (k, label, col) => `<div class="need ${c[k] < 25 ? "low" : ""}" style="--c:${col}"><span>${label}</span><i><b style="width:${Math.round(c[k])}%"></b></i><span>${Math.round(c[k])}</span></div>`;
  el.innerHTML = `<div class="mood">${esc(name)} ${MOOD_TEXT[m]}</div>
    <div class="needs">${need("food", "Satt", "var(--sun)")}${need("fun", "Spaß", "var(--mint)")}${need("energy", "Energie", "#fff")}</div>
    <div class="careacts">
      <button data-care="feed" ${asleep ? "disabled" : ""}>${COOKIE}Füttern<em>${c.snacks}</em></button>
      <button data-care="play" ${asleep ? "disabled" : ""}>${BALL}Spielen</button>
      <button data-care="sleep">${asleep ? SUNUP + "Wecken" : MOON + "Schlafen"}</button>
    </div>
    <div class="carehint">${c.snacks ? "Für jede geübte Runde gibt es neue Leckerlis." : "Keine Leckerlis mehr. Übe eine Runde, dann gibt es neue!"}</div>`;
  $("avStage").classList.toggle("night", asleep);
  const y = yardEls(); if (!y) return;
  y.box.classList.toggle("sleep", asleep); y.box.classList.toggle("sad", moodClass(m) === "sad");
  if (asleep && !y.box.querySelector(".zzz")) y.box.insertAdjacentHTML("beforeend", ZZZ);
  if (!asleep) y.box.querySelectorAll(".zzz").forEach(z => z.remove());
}
function playBall(y){
  const R = walkRange(y), tx = (PETM.x > 0 ? -1 : 1) * R * (.6 + Math.random() * .4);
  const caught = z => { if (!z) return; petHop(z.box); petSay(z.box, "play"); chirp(); const r = z.box.getBoundingClientRect(); spawnHeart(z.box, r.width / 2, r.height * .3); };
  if (RM || R < 8){ caught(y); return; }
  const ball = document.createElement("span"); ball.className = "ball"; ball.innerHTML = BALL;
  ball.style.transform = `translateX(${PETM.x}px)`; y.yard.appendChild(ball); void ball.offsetWidth; ball.style.transform = `translateX(${tx}px)`;
  if (S.settings.sound) tone(300, 0, .16, "sine", .12, 620);
  PETM.busy = true; clearTimeout(PETM.w);
  PETM.w = setTimeout(() => walkTo(tx, 150, z => { ball.remove(); caught(z); }), 380);
}
function careAct(kind){
  const y = yardEls(); if (!y || !S.pet) return;
  const c = careTick(), box = y.box, name = PETS[S.pet].name;
  if (kind === "sleep"){
    if (c.sleep){ c.sleep = false; save(); renderCare(); petHop(box); chirp(); petSay(box, "wake"); }
    else {
      clearTimeout(PETM.w); PETM.busy = false; box.classList.remove("walk"); y.yard.querySelectorAll(".ball").forEach(b => b.remove());
      c.sleep = "user"; save(); renderCare(); if (S.settings.sound){ tone(520, 0, .3, "sine", .1, 390); tone(390, .28, .45, "sine", .1, 290); }
    }
    return;
  }
  if (c.sleep){ petSay(box, "sleep"); return; }
  if (kind === "feed"){
    if (c.snacks < 1){ toast("Keine Leckerlis mehr. Für jede geübte Runde gibt es neue."); fx("wrong"); return; }
    if (c.food >= 95){ petSay(box, "full"); return; }
    c.snacks--; c.food = clamp100(c.food + SNACK_FOOD);
    const s = document.createElement("span"); s.className = "snack"; s.innerHTML = COOKIE; box.appendChild(s); setTimeout(() => s.remove(), 650);
    setTimeout(() => {
      box.classList.add("munch"); setTimeout(() => box.classList.remove("munch"), 950); petSay(box, "eat");
      if (S.settings.sound) [0, .14, .28].forEach(t => tone(260, t, .07, "square", .06, 180));
    }, RM ? 0 : 520);
  }
  if (kind === "play"){
    if (PETM.busy) return;
    if (c.energy < 10){ petSay(box, "tired"); toast(`${name} ist zu müde zum Spielen.`); return; }
    c.fun = clamp100(c.fun + 20); c.energy = clamp100(c.energy - 6); c.food = clamp100(c.food - 2);
    playBall(y);
  }
  save(); renderCare();
}
$("avStage").addEventListener("click", e => {
  const b = e.target.closest("[data-care]"); if (b && !b.disabled) careAct(b.dataset.care);
  if (e.target.closest("[data-3d]")){ S.settings.pet3d = S.settings.pet3d === false; save(); fx("tap"); renderAvatar(); }
});
setInterval(() => { if (tab === "avatar") renderCare(); }, 60000);

/* ---------- 3D-Pets aus Grundformen (three.js), nur auf der Avatar-Bühne ----------
   Die Figur liest die Klassen der Petbox (walk, left, sleep, sad, happy, jump, munch) und bewegt sich passend dazu.
   Kleidung, Skins und Auren sind als 3D-Teile nachgebaut (WEAR3, SKINS). Ohne three.js oder WebGL bleibt das gemalte Bild stehen. */
const P3 = {lib:null, fig:null, ok:true};
function pet3dWanted(){ return P3.ok && !RM && !!PETS[S.pet] && S.settings.pet3d !== false; }
function pet3dLib(){
  return P3.lib || (P3.lib = new Promise((res, rej) => {
    if (window.THREE) return res();
    const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = () => res(); s.onerror = rej; document.head.appendChild(s);
  }));
}
function pet3dMount(){
  const y = yardEls(); if (!y || !pet3dWanted()) return;
  if (!window.THREE){ pet3dLib().then(() => { if (tab === "avatar") pet3dMount(); }).catch(() => { P3.ok = false; }); return; }
  try{ P3.fig = P3.fig || buildPet3d(); }catch(e){ console.error("3D-Pet", e); P3.ok = false; return; }
  const face = y.box.querySelector(".face"); face.innerHTML = ""; face.appendChild(P3.fig.canvas);
  y.box.classList.add("is3d"); y.big.classList.add("has3d"); try{ P3.fig.start(y.box, S.pet, (S.outfits && S.outfits[S.pet]) || {}); }catch(e){ console.error("3D-Pet", e); P3.ok = false; renderAvatar(); }
}
function buildPet3d(){
  const T = THREE, canvas = document.createElement("canvas"); canvas.className = "pet3d";
  const renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(28, 1, .1, 50);
  cam.position.set(0, 1.75, 6.8); cam.lookAt(0, .95, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  scene.add(new T.HemisphereLight(0xffffff, 0x8a80c8, .58));
  const sun = new T.DirectionalLight(0xfff4e0, .62); sun.position.set(2.5, 5, 4); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.002; sun.shadow.radius = 5;
  Object.assign(sun.shadow.camera, {left:-2.6, right:2.6, top:3, bottom:-1, near:.5, far:14}); scene.add(sun);
  const rim = new T.DirectionalLight(0xbcd0ff, .22); rim.position.set(-3, 2.5, -4); scene.add(rim);
  const ground = new T.Mesh(new T.PlaneGeometry(9, 9), new T.ShadowMaterial({opacity:.3})); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const PI = Math.PI, lerp = (a, b, k) => a + (b - a) * k;
  const ss = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  const ball = new T.SphereGeometry(1, 28, 20), cone = new T.ConeGeometry(1, 1, 20), taper = new T.CylinderGeometry(1, .72, 1, 18), snout = new T.CylinderGeometry(.38, 1, 1, 20);
  const place = (o, pos, scl, rot) => { if (pos) o.position.set(...pos); if (scl) o.scale.set(...scl); if (rot) o.rotation.set(...rot); return o; };
  const grp = (parent, pos, rot, scl) => { const o = place(new T.Group(), pos, scl, rot); parent.add(o); return o; };
  const solid = (c, o) => new T.MeshStandardMaterial(Object.assign({color:c, roughness:.6, metalness:0}, o || {}));
  const flat = (c, o) => new T.MeshBasicMaterial(Object.assign({color:c}, o || {}));
  const add = (parent, geo, m, pos, scl, rot) => { const o = place(new T.Mesh(geo, m), pos, scl, rot); o.castShadow = !m.transparent; parent.add(o); return o; };

  /* Haut und Fell: jede Form bekommt pro Eckpunkt drei Gewichte (hell, dunkel, Akzent). paint() färbt daraus mit der Palette des Skins.
     Bei Fell liegen SHELLS dünne Schalen mit Rauschmuster und steigender Alpha-Schwelle darüber: das ergibt feine Haare. */
  const SHELLS = 9;
  const noise = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), d = x.createImageData(64, 64);
    for (let i = 0; i < 4096; i++){ const v = Math.random() * 255; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    x.putImageData(d, 0, 0); const tx = new T.CanvasTexture(c); tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(6, 4); tx.minFilter = T.LinearFilter; tx.generateMipmaps = false; return tx;
  })();
  const FUR = new T.MeshStandardMaterial({vertexColors:true, roughness:.9, metalness:0, color:0xdcdcdc});
  const FURS = [FUR].concat(Array.from({length:SHELLS}, (_, i) => { const l = (i + 1) / SHELLS;
    const m = new T.MeshStandardMaterial({vertexColors:true, roughness:1, metalness:0, alphaMap:noise, alphaTest:.1 + .6 * l, color:new T.Color().setScalar(.9 + .1 * l)});
    // Nach dem Alpha-Test deckend schreiben, sonst scheint der Seitenhintergrund durch die Haare
    m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace("#include <alphatest_fragment>", "#include <alphatest_fragment>" + String.fromCharCode(10) + "diffuseColor.a = 1.0;"); };
    return m; }));
  let B = null;   // Figur, die gerade gebaut wird
  function fur(parent, geo, pos, scl, fn, rot, len){
    const g = geo.clone(), p = g.attributes.position, n = p.count, w = new Float32Array(n * 3);
    for (let i = 0; i < n; i++){ const r = fn ? fn(p.getX(i), p.getY(i), p.getZ(i)) : [0, 0, 0]; w[i * 3] = r[0] || 0; w[i * 3 + 1] = r[1] || 0; w[i * 3 + 2] = r[2] || 0; }
    g.setAttribute("color", new T.BufferAttribute(new Float32Array(n * 3), 3)); g.userData = {w}; B.furGeos.push(g);  // eigenes userData: clone() teilt es sonst mit der Vorlage
    const o = add(parent, g, FUR, pos, scl, rot), L = len === undefined ? B.furLen : len;
    if (L > 0) for (let i = 1; i <= SHELLS; i++){ const sh = new T.Mesh(g, FURS[i]); sh.scale.setScalar(1 + L * i / SHELLS); o.add(sh); }
    return o;
  }
  const LIGHT = () => [1, 0, 0], DARKF = () => [0, 1, 0], ALT = () => [0, 0, 1];
  const cM = new T.Color(), cL = new T.Color(), cD = new T.Color(), cA = new T.Color(), cT = new T.Color();
  function paint(rig, p){
    cM.set(p.main); cL.set(p.light); cD.set(p.dark); cA.set(p.alt);
    rig.furGeos.forEach(g => { const a = g.attributes.color, w = g.userData.w;
      for (let i = 0; i < a.count; i++){ cT.copy(cM).lerp(cA, w[i * 3 + 2]).lerp(cL, w[i * 3]).lerp(cD, w[i * 3 + 1]); a.setXYZ(i, cT.r, cT.g, cT.b); }
      a.needsUpdate = true; });
  }
  const SKINS = {
    gold:   {main:0xffc933, light:0xfff0a8, dark:0xa87400, alt:0xfff6c8, eye:0xfff3b0, rough:.38, metal:.25},
    ice:    {main:0x8fd0ff, light:0xf4fbff, dark:0x3b7fd0, alt:0x5aa9ff, eye:0x2a6cff, rough:.5, metal:.1},
    shadow: {main:0x3a3352, light:0x6c6190, dark:0x100e1a, alt:0x8a7fb5, eye:0xff4d6d, rough:.9, metal:0},
    neon:   {main:0xff38e8, light:0xb8ff3a, dark:0x2b0a70, alt:0x3affea, eye:0x3affea, rough:.6, metal:0, glow:.3},
    rainbow:{main:0xff5a5f, light:0xffffff, dark:0x2a1c18, alt:0xffcc33, eye:0xffffff, rough:.7, metal:0},
  };
  const RIM = flat(0x1a1410), PUPIL = flat(0x0c0a10), SHINE = flat(0xffffff);
  function eye(parent, pos, yaw, size, round){
    const e = grp(parent, pos, [0, yaw, 0]); e.scale.setScalar(size); const lid = grp(e);
    add(lid, ball, RIM, [0, 0, -.012], [.092, .1, .04]); add(lid, ball, B.iris, null, [.078, .086, .045]);
    add(lid, ball, PUPIL, [0, 0, .026], round ? [.048, .052, .028] : [.036, .062, .028]); add(lid, ball, SHINE, [.026, .032, .05], [.019, .019, .012]);
    B.eyes.push(lid); return e;
  }
  const shapeGeo = (pts, depth) => { const s = new T.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); return new T.ExtrudeGeometry(s, {depth, bevelEnabled:false}); };

  /* ---------- Die vier Figuren. Nase zeigt nach +Z (zur Kamera), Boden bei y = 0 ----------
     Jede Figur legt fest: pal (Farben), A (Ankerpunkte für Anziehsachen), yaw [stehen, laufen], stride (Schritttempo), pose(c). */
  const MODELS = {
    fox(R){
      const root = R.root, bodyG = grp(root, [0, 0, .25]);
      R.pal = {main:0xf5781c, light:0xfff1dc, dark:0x2a1c18, alt:0xfff1dc, eye:0xe8a020, rough:.9, metal:0}; R.yaw = [.45, 1.2]; R.stride = 11;
      const torso = new T.LatheGeometry([[0, -.64], [.2, -.6], [.3, -.44], [.33, -.24], [.3, -.02], [.32, .18], [.36, .38], [.31, .52], [.17, .61], [0, .64]].map(([r, y]) => new T.Vector2(r, y)), 28);
      fur(bodyG, torso, [0, .71, -.04], [.8, 1, .8], (x, y, z) => [Math.max(ss(.04, .27, z), ss(.3, .6, y) * ss(-.12, .2, z)), 0], [PI / 2, 0, 0], .08);
      fur(bodyG, ball, [0, .72, .5], [.17, .2, .13], LIGHT, null, .14);
      fur(bodyG, ball, [0, .95, .38], [.18, .34, .18], (x, y, z) => [ss(.1, .8, z) * ss(.7, -.3, y), 0], [.5, 0, 0]);
      const legs = [[-.2, .28, 1], [.2, .28, 1], [-.21, -.3, 0], [.21, -.3, 0]].map(([x, z, front], i) => {
        const hip = grp(bodyG, [x, .62, z]);
        fur(hip, ball, [0, -.06, 0], front ? [.1, .2, .13] : [.115, .23, .17]);
        fur(hip, taper, [0, -.18, 0], [.08, .36, .09], (px, py) => [0, ss(.2, -.45, py)]);
        const knee = grp(hip, [0, -.36, 0]);
        fur(knee, taper, [0, -.17, 0], [.058, .34, .062], DARKF);
        fur(knee, ball, [0, -.355, .035], [.07, .055, .105], DARKF);
        return {hip, knee, front, ph:(i === 0 || i === 3) ? 0 : PI};
      });
      const headG = grp(bodyG, [0, 1.02, .46]);
      fur(headG, ball, [0, .22, .06], [.35, .32, .35], (x, y, z) => [ss(.05, -.55, y) * ss(-.3, .4, z), 0]);
      [-1, 1].forEach(s => fur(headG, cone, [s * .31, .1, .1], [.1, .22, .08], (x, y) => [ss(-.5, .15, y), 0], [0, 0, -s * 1.9], .14));
      const WHISK = flat(0xffffff, {transparent:true, opacity:.75});
      [-1, 1].forEach(s => [-1, 0, 1].forEach(j => add(headG, new T.CylinderGeometry(.004, .001, .26, 5), WHISK, [s * .19, .1 + j * .012, .58], null, [.3 * j, 0, s * (PI / 2 + .12) + j * .16])));
      fur(headG, snout, [0, .12, .46], [.17, .46, .145], (x, y, z) => [ss(-.35, .25, z), 0], [PI / 2, 0, 0], .03);
      fur(headG, ball, [0, .115, .675], [.07, .062, .07], (x, y) => [ss(.6, -.1, y), 0], null, .03);
      add(headG, ball, solid(0x15131c, {roughness:.35}), [0, .15, .725], [.06, .048, .052]);
      [-1, 1].forEach(s => eye(headG, [s * .165, .3, .345], s * .32, 1));
      const ears = [-1, 1].map(s => {
        const E = grp(headG, [s * .21, .47, 0]);
        fur(E, cone, [0, .23, 0], [.16, .46, .085], (x, y, z) => [0, Math.max(ss(.18, .48, y), ss(.1, -.6, z) * .6)], null, .03);
        fur(E, cone, [0, .18, .045], [.095, .3, .04], LIGHT, null, .1);
        return E;
      });
      const tailG = grp(bodyG, [0, .78, -.6]), tail = [];
      [.1, .14, .18, .21, .22, .2, .16, .1].reduce((parent, r, i) => {
        const g = grp(parent, [0, i ? .13 : 0, 0]);
        fur(g, ball, [0, .08, 0], [r * .95, r * 1.15, r * .95], i >= 6 ? LIGHT : i === 5 ? ((x, y) => [ss(-.2, .7, y), 0]) : null, null, .22);
        tail.push(g); return g;
      }, tailG);
      R.A = {head:{parent:headG, pos:[0, .5, .05]}, eyes:{parent:headG, pos:[0, .3, .415]}, neck:{parent:bodyG, pos:[0, .93, .37], rot:[.64, 0, 0]},
             back:{parent:bodyG, pos:[0, .7, -.12]}, wings:{parent:bodyG, pos:[0, .98, .08]}};
      R.pose = ({t, st, jy, Z, munch, sleeping}) => {
        bodyG.position.y = .14 + jy + Math.abs(Math.sin(st.w)) * .045 * st.walk - .5 * Z;
        bodyG.scale.y = 1 + Math.sin(t * (sleeping ? 1.3 : 2.2)) * (.012 + .02 * Z);
        legs.forEach(L => {
          L.hip.rotation.x = Math.sin(st.w + L.ph) * .55 * st.walk * (1 - Z) + (L.front ? -1.45 : 1.45) * Z + (L.front ? -1 : 1) * jy * .8;
          L.knee.rotation.x = Math.max(0, -Math.cos(st.w + L.ph)) * .9 * st.walk * (1 - Z) + jy * .7;
        });
        headG.rotation.y = (Math.sin(t * .55) * .3 + Math.sin(t * 1.3) * .08) * (1 - Z) * (1 - st.walk * .7);
        headG.rotation.x = .07 * Math.sin(t * .9) + .32 * st.sad + .5 * Z - .12 * st.happy + (munch ? .18 + Math.sin(t * 24) * .14 : 0);
        headG.rotation.z = Math.sin(t * 9) * .13 * st.happy + .25 * Z;
        headG.position.y = 1.02 - .2 * Z - .06 * st.sad;
        ears.forEach((E, i) => { const s = i ? 1 : -1, twitch = Math.max(0, Math.sin(t * 1.7 + i * 2.1) - .93) * 6; E.rotation.z = -s * (.22 + .6 * Math.max(st.sad, Z * .7) - twitch); E.rotation.x = -.4 * st.sad; });
        const wa = (.13 + .25 * st.happy) * (1 - .7 * st.sad) * (1 - .85 * Z), tw = t * 3 + st.wag;
        tail.forEach((g, i) => { g.rotation.z = Math.sin(tw - i * .35) * wa * .6 + .34 * Z; g.rotation.x = i ? .06 + .03 * Math.sin(t * 1.3 + i * .5) : 0; });
        tailG.rotation.x = -1.25 - .4 * st.sad * (1 - Z) - .3 * Z + .45 * st.happy + Math.sin(t * 1.1) * .04;
      };
    },

    turtle(R){
      const root = R.root, bodyG = grp(root, [0, 0, -.05]); root.scale.setScalar(1.22);
      R.furLen = 0; R.pal = {main:0x93d86a, light:0xf0e9b4, dark:0x0f4a33, alt:0x35b07a, eye:0xc9781f, rough:.55, metal:0}; R.yaw = [.55, 1.15]; R.stride = 6;
      // Panzer mit Schildmuster, darunter der helle Bauchpanzer
      fur(bodyG, ball, [0, .52, 0], [.74, .56, .82], (x, y, z) => {
        const line = Math.min(Math.abs(Math.sin(x * 4.4 + 1.57)), Math.abs(Math.sin(z * 4.4 + (Math.abs(x) > .36 ? 1.57 : 0))));
        return [Math.max(ss(-.05, -.3, y) * .6, ss(.3, .75, line) * ss(-.1, .2, y) * .22), ss(.2, .06, line) * ss(-.25, -.05, y) * .85, 1];
      });
      fur(bodyG, ball, [0, .4, 0], [.68, .2, .76], LIGHT);
      const legs = [[-.5, .44, 1], [.5, .44, 1], [-.5, -.42, 0], [.5, -.42, 0]].map(([x, z, front], i) => {
        const L = grp(bodyG, [x, .34, z]);
        fur(L, ball, [0, -.15, front ? .04 : -.02], [.16, .22, .19], (px, py) => [0, ss(-.2, -1, py) * .25]);
        return {L, x, z, front, ph:(i === 0 || i === 3) ? 0 : PI};
      });
      fur(bodyG, cone, [0, .36, -.84], [.08, .26, .07], null, [-1.87, 0, 0]);
      const neckG = grp(bodyG, [0, .5, .66]);
      fur(neckG, ball, [0, .12, .12], [.16, .16, .3], (x, y) => [ss(0, -.8, y) * .5, 0], [-.8, 0, 0]);
      const headG = grp(neckG, [0, .32, .3]);
      fur(headG, ball, null, [.3, .27, .32], (x, y, z) => [ss(-.1, -.8, y) * .6, 0]);
      [-1, 1].forEach(s => eye(headG, [s * .19, .09, .22], s * .5, 1.55, true));
      const DK = flat(0x14402c);
      add(headG, new T.TorusGeometry(.13, .013, 6, 18, PI), DK, [0, -.04, .27], null, [.25, 0, PI]);
      [-1, 1].forEach(s => add(headG, ball, DK, [s * .045, .04, .315], [.012, .012, .008]));
      R.A = {head:{parent:headG, pos:[0, .2, 0], scl:.86}, eyes:{parent:headG, pos:[0, .09, .3], scl:[1.05, 1.5, 1.2]}, neck:{parent:neckG, pos:[0, .13, .14], rot:[.78, 0, 0], scl:.82},
             back:{parent:bodyG, pos:[0, .56, -.2], scl:[1.82, 1.36, 1.25]}, wings:{parent:bodyG, pos:[0, 1.0, .12], scl:1.15}};
      R.pose = ({t, st, jy, Z, munch, sleeping}) => {
        bodyG.position.y = jy * .5 + Math.abs(Math.sin(st.w)) * .025 * st.walk - .14 * Z;
        bodyG.rotation.z = Math.sin(st.w) * .035 * st.walk;
        bodyG.scale.y = 1 + Math.sin(t * (sleeping ? 1.1 : 1.8)) * .012;
        // Beine paddeln beim Laufen und verschwinden beim Schlafen im Panzer
        legs.forEach(l => { l.L.rotation.x = Math.sin(st.w + l.ph) * .55 * st.walk * (1 - Z) + jy * (l.front ? -.6 : .6);
          const k = 1 - .62 * Z; l.L.scale.setScalar(k); l.L.position.set(l.x * (1 - .3 * Z), .34 + .06 * Z, l.z * (1 - .3 * Z)); });
        neckG.position.z = .66 - .46 * Z; neckG.scale.setScalar(1 - .5 * Z); neckG.position.y = .5 - .04 * Z;
        neckG.rotation.y = (Math.sin(t * .45) * .35 + Math.sin(t * 1.1) * .08) * (1 - Z) * (1 - st.walk * .6);
        neckG.rotation.x = .05 * Math.sin(t * .8) + .45 * st.sad + .3 * Z - .2 * st.happy + (munch ? .25 + Math.sin(t * 20) * .15 : 0) + Math.sin(st.w * 2) * .05 * st.walk;
        headG.rotation.z = Math.sin(t * 8) * .14 * st.happy;
        headG.rotation.x = -.15 + .25 * st.sad;
      };
    },

    owl(R){
      const root = R.root, bodyG = grp(root);
      R.furLen = .05; R.pal = {main:0x8a5cff, light:0xefe6ff, dark:0x5a35c9, alt:0xffb21f, eye:0xf5a300, rough:.9, metal:0}; R.yaw = [.2, .75]; R.stride = 9;
      fur(bodyG, ball, [0, .76, 0], [.58, .7, .54], (x, y, z) => { const belly = ss(.15, .7, z) * ss(.5, -.4, y);
        return [belly * .95, belly * ss(.55, .9, Math.sin(x * 11) * Math.sin(y * 11 + 1)) * .3 + ss(.2, -.8, z) * .25, 0]; });
      fur(bodyG, ball, [0, .42, -.46], [.25, .09, .3], (x, y, z) => [0, ss(.2, -.9, z) * .6], [.55, 0, 0]);
      const headG = grp(bodyG, [0, 1.36, .03]);
      fur(headG, ball, [0, .1, 0], [.62, .52, .54], (x, y, z) => [0, ss(.2, .95, y) * .3 + ss(.1, -.9, z) * .2]);
      [-1, 1].forEach(s => { fur(headG, ball, [s * .25, .1, .37], [.29, .3, .14], LIGHT); eye(headG, [s * .25, .12, .48], s * .12, 2.25, true); });
      fur(headG, cone, [0, -.03, .55], [.075, .18, .075], ALT, [2.0, 0, 0], 0);
      const tufts = [-1, 1].map(s => { const E = grp(headG, [s * .4, .46, 0]); fur(E, cone, [0, .15, 0], [.13, .36, .1], (x, y) => [0, ss(0, .5, y) * .7]); return E; });
      const wings = [-1, 1].map(s => { const W = grp(bodyG, [s * .52, 1.04, 0]);
        fur(W, ball, [s * .07, -.36, -.02], [.13, .44, .34], (x, y) => [0, ss(.1, -.9, y) * .6]); return W; });
      const feet = [-1, 1].map(s => { const F = grp(bodyG, [s * .22, .07, .12]);
        [-1, 0, 1].forEach(j => fur(F, ball, [j * .07, 0, .1], [.045, .045, .14], ALT, [0, j * .3, 0], 0)); return F; });
      R.A = {head:{parent:headG, pos:[0, .58, 0], scl:1.45}, eyes:{parent:headG, pos:[0, .12, .59], scl:[1.32, 1.9, 1.5]}, neck:{parent:bodyG, pos:[0, 1.06, .02], rot:[.1, 0, 0], scl:2.25},
             back:{parent:bodyG, pos:[0, .62, 0], rot:[-PI / 2, 0, 0], scl:[1.55, 1.5, 1]}, wings:{parent:bodyG, pos:[0, 1.0, -.44], scl:1.35}};
      R.pose = ({t, st, jy, Z, munch, sleeping}) => {
        bodyG.position.y = jy + Math.abs(Math.sin(st.w)) * .05 * st.walk;
        bodyG.rotation.z = Math.sin(st.w) * .13 * st.walk;
        bodyG.scale.set(1 + .05 * Z, 1 - .06 * Z + Math.sin(t * (sleeping ? 1.2 : 2)) * (.012 + .015 * Z), 1 + .05 * Z);
        feet.forEach((F, i) => { const s = Math.sin(st.w + i * PI); F.position.y = .07 + Math.max(0, s) * .14 * st.walk; F.position.z = .12 + Math.cos(st.w + i * PI) * .1 * st.walk; });
        // Eulen drehen den Kopf weit und legen ihn schief
        const turn = Math.sin(t * .5) * .35 + ss(.6, 1, Math.sin(t * .23)) * .7 - ss(.6, 1, Math.sin(t * .23 + 3.2)) * .7;
        headG.rotation.y = turn * (1 - Z) * (1 - st.walk * .7);
        headG.rotation.x = .04 * Math.sin(t * .9) + .3 * st.sad + .28 * Z - .1 * st.happy + (munch ? .25 + Math.sin(t * 22) * .2 : 0);
        headG.rotation.z = Math.sin(t * .37) * .12 * (1 - Z) + Math.sin(t * 9) * .1 * st.happy;
        headG.position.y = 1.36 - .12 * Z - .05 * st.sad;
        tufts.forEach((E, i) => { const s = i ? 1 : -1; E.rotation.z = -s * (.45 + .7 * Math.max(st.sad, Z * .6)); });
        const flap = Math.max(st.happy * (.5 + .5 * Math.sin(t * 20)), jy * 2) * 1.1 + Math.sin(t * 1.6) * .03;
        wings.forEach((W, i) => { const s = i ? 1 : -1; W.rotation.z = s * (.1 + flap * (1 - Z) - .08 * st.sad); });
      };
    },

    dragon(R){
      const root = R.root, bodyG = grp(root, [0, 0, .12]);
      R.furLen = 0; R.pal = {main:0x25c08c, light:0xf4edb2, dark:0x0f8562, alt:0xffc531, eye:0xf08a00, rough:.5, metal:0}; R.yaw = [.38, .95]; R.stride = 9;
      fur(bodyG, ball, [0, .72, 0], [.5, .6, .47], (x, y, z) => { const belly = ss(.2, .75, z) * ss(.85, -.95, y); return [belly, belly * ss(.75, .97, Math.abs(Math.sin(y * 8))) * .28, 0]; });
      const headG = grp(bodyG, [0, 1.3, .06]);
      fur(headG, ball, [0, .2, 0], [.5, .44, .46], (x, y, z) => [0, ss(.3, 1, y) * .25]);
      fur(headG, ball, [0, .08, .4], [.3, .22, .3], (x, y) => [ss(.1, -.7, y) * .55, 0]);
      const DK = flat(0x0a5e45);
      [-1, 1].forEach(s => { add(headG, ball, DK, [s * .1, .17, .67], [.025, .03, .02]); eye(headG, [s * .27, .3, .35], s * .35, 1.9);
        fur(headG, cone, [s * .26, .68, -.08], [.085, .36, .085], ALT, [-.35, 0, -s * .3]); fur(headG, cone, [s * .52, .2, -.06], [.07, .26, .03], (x, y) => [0, ss(-.5, .5, y) * .6], [0, 0, -s * 1.7]); });
      add(headG, new T.TorusGeometry(.17, .014, 6, 18, PI), DK, [0, .03, .6], null, [.5, 0, PI]);
      [[headG, 0, .62, -.24], [bodyG, 0, 1.08, -.4], [bodyG, 0, .82, -.47], [bodyG, 0, .56, -.44]].forEach(([p, x, y, z]) => fur(p, cone, [x, y, z], [.07, .2, .05], ALT, [-1.15, 0, 0]));
      const arms = [-1, 1].map(s => { const A = grp(bodyG, [s * .44, .94, .1]); fur(A, ball, [s * .05, -.14, .1], [.105, .2, .115], null, [-.6, 0, 0]); return A; });
      const legs = [-1, 1].map(s => { const L = grp(bodyG, [s * .26, .42, .02]);
        fur(L, ball, [0, -.08, 0], [.2, .26, .24]); fur(L, ball, [0, -.345, .13], [.17, .08, .26], (x, y, z) => [0, ss(.5, 1, z) * .5]);
        [-1, 0, 1].forEach(j => fur(L, cone, [j * .08, -.36, .37], [.03, .08, .03], ALT, [PI / 2, 0, 0])); return L; });
      const tailG = grp(bodyG, [0, .42, -.36], [-1.72, 0, 0]), tail = [];
      [.24, .2, .16, .125, .095, .07].reduce((parent, r, i) => { const g = grp(parent, [0, i ? .17 : 0, 0]); fur(g, ball, [0, .1, 0], [r, r * 1.25, r]); tail.push(g); return g; }, tailG);
      fur(tail[5], cone, [0, .26, 0], [.11, .22, .04], ALT);
      const wingShape = shapeGeo([[0, .1], [.62, .56], [.58, .28], [.44, .2], [.42, 0], [.26, .02], [.2, -.16], [0, -.1]], .025);
      const wings = [-1, 1].map(s => { const W = grp(bodyG, [s * .26, 1.0, -.38], [0, -s * .55, 0]);
        fur(W, wingShape, null, [s, 1, 1], (x, y) => [0, ss(.1, 0, x) * .8 + ss(.52, .58, y - x * .75) * .8, 1]); return W; });
      const FLAME = [flat(0xff5a1f, {transparent:true, opacity:.9}), flat(0xffc531, {transparent:true, opacity:.95})];
      const fire = grp(headG, [0, .04, .72], [PI / 2, 0, 0]); add(fire, cone, FLAME[0], [0, .22, 0], [.12, .5, .12]); add(fire, cone, FLAME[1], [0, .16, 0], [.07, .34, .07]);
      R.A = {head:{parent:headG, pos:[0, .6, 0], scl:1.25}, eyes:{parent:headG, pos:[0, .3, .46], scl:[1.45, 1.6, 1.4]}, neck:{parent:bodyG, pos:[0, 1.2, .04], rot:[.1, 0, 0], scl:1.75},
             back:{parent:bodyG, pos:[0, .62, 0], rot:[-PI / 2, 0, 0], scl:[1.38, 1.45, 1]}, wings:{parent:bodyG, pos:[0, 1.02, -.42], scl:1.3}};
      R.onDress = o => { wings.forEach(W => { W.visible = o.back !== "wings"; }); };
      R.pose = ({t, st, jy, Z, munch, sleeping}) => {
        bodyG.position.y = jy + Math.abs(Math.sin(st.w)) * .05 * st.walk - .2 * Z;
        bodyG.rotation.x = .1 * st.walk + .12 * Z;
        bodyG.scale.y = 1 + Math.sin(t * (sleeping ? 1.2 : 2.1)) * (.012 + .015 * Z);
        legs.forEach((L, i) => { L.rotation.x = Math.sin(st.w + i * PI) * .6 * st.walk * (1 - Z) - 1.2 * Z - jy * .5; });
        arms.forEach((A, i) => { const s = i ? 1 : -1; A.rotation.x = -Math.sin(st.w + i * PI) * .5 * st.walk - 1.6 * st.happy - jy * 2 + .3 * st.sad; A.rotation.z = s * (.1 + .5 * st.happy); });
        headG.rotation.y = (Math.sin(t * .5) * .3 + Math.sin(t * 1.2) * .08) * (1 - Z) * (1 - st.walk * .7);
        headG.rotation.x = .05 * Math.sin(t * .9) + .3 * st.sad + .45 * Z - .12 * st.happy + (munch ? .2 + Math.sin(t * 22) * .15 : 0);
        headG.rotation.z = Math.sin(t * 9) * .1 * st.happy + .2 * Z;
        headG.position.y = 1.3 - .1 * Z - .04 * st.sad;
        const wa = (.14 + .2 * st.happy) * (1 - .6 * st.sad) * (1 - .8 * Z), tw = t * 2.4 + st.wag;
        tail.forEach((g, i) => { g.rotation.z = Math.sin(tw - i * .5) * wa + .3 * Z; g.rotation.x = i ? .22 - .12 * st.sad : 0; });
        const flap = Math.sin(t * (2.2 + 10 * st.happy + 14 * Math.min(1, jy * 3))) * (.14 + .3 * st.happy + jy);
        wings.forEach((W, i) => { const s = i ? 1 : -1; W.rotation.z = s * (.15 + flap * (1 - Z) - .5 * Math.max(st.sad, Z)); });
        // Feuer spucken beim Hüpfen
        const f = Math.min(1, jy * 4) * (1 - Z); fire.visible = f > .05; fire.scale.set(f, f * (1 + .25 * Math.sin(t * 40)), f);
      };
    },
  };

  /* ---------- Anziehsachen, Skins, Auren. Jedes Teil wird in eine Ankergruppe der Figur gebaut ---------- */
  const starGeo = (R, depth) => shapeGeo(Array.from({length:10}, (_, i) => { const r = i % 2 ? R * .42 : R, a = PI / 2 + i * PI / 5; return [Math.cos(a) * r, Math.sin(a) * r]; }), depth);
  function heartGeo(sz, depth){
    const s = new T.Shape(); s.moveTo(0, -sz); s.bezierCurveTo(-sz * 2, sz * .2, -sz, sz * 1.6, 0, sz * .5); s.bezierCurveTo(sz, sz * 1.6, sz * 2, sz * .2, 0, -sz);
    return new T.ExtrudeGeometry(s, {depth, bevelEnabled:false});
  }
  function wingGeo(){
    const s = new T.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(.3, .6, .9, .55); s.quadraticCurveTo(.74, .42, .76, .28); s.quadraticCurveTo(.58, .28, .6, .12);
    s.quadraticCurveTo(.42, .14, .4, -.02); s.quadraticCurveTo(.2, .02, 0, -.14); s.lineTo(0, 0);
    return new T.ExtrudeGeometry(s, {depth:.03, bevelEnabled:false});
  }
  const cylG = (rt, rb, h, open) => new T.CylinderGeometry(rt, rb, h, 24, 1, !!open);
  const torG = (r, tube) => new T.TorusGeometry(r, tube, 10, 32);
  const domeG = r => new T.SphereGeometry(r, 24, 12, 0, PI * 2, 0, PI / 2);
  let fxs = [];
  const WEAR3 = {
    cap(g){ add(g, domeG(.3), solid(0x3887ff), null, [1, .8, 1.05]); add(g, cylG(.22, .22, .03), solid(0x2265cc), [0, .02, .3]); add(g, ball, solid(0xffbf1f), [0, .24, 0], [.04, .04, .04]); },
    party(g){ const h = grp(g, [0, .05, 0], [0, 0, .14]); add(h, cone, solid(0xff5a5f), [0, .25, 0], [.17, .5, .17]);
      [[.12, .129], [.28, .075]].forEach(([y, r]) => add(h, torG(r, .018), solid(0xffbf1f), [0, y, 0], null, [PI / 2, 0, 0])); add(h, ball, solid(0x14b892), [0, .52, 0], [.06, .06, .06]); },
    wizard(g){ const h = grp(g, [0, .04, 0], [-.1, 0, .1]); add(h, cylG(.36, .38, .03), solid(0x6236d6)); add(h, cone, solid(0x8457ff), [0, .34, 0], [.22, .66, .22]);
      add(h, starGeo(.07, .02), solid(0xffbf1f, {emissive:0x6b4a00}), [0, .22, .15], null, [-.32, 0, 0]); add(h, ball, flat(0xffffff), [.09, .4, .1], [.02, .02, .02]); },
    viking(g){ const M = {metalness:.3, roughness:.4}; add(g, domeG(.3), solid(0x9aa3b5, M), null, [1, .85, 1]); add(g, cylG(.305, .305, .07), solid(0x6b7385, M), [0, .035, 0]);
      [-1, 1].forEach(s => add(g, cone, solid(0xfff6e0), [s * .36, .2, 0], [.075, .4, .075], [0, 0, -s * .75])); },
    crown(g){ const h = grp(g, [0, .04, 0]), GOLD = solid(0xffcc33, {metalness:.3, roughness:.35, side:T.DoubleSide});
      add(h, cylG(.24, .22, .14, true), GOLD, [0, .07, 0]); add(h, torG(.225, .022), solid(0xd99a00, {metalness:.3, roughness:.35}), [0, .01, 0], null, [PI / 2, 0, 0]);
      for (let i = 0; i < 6; i++){ const a = i * PI / 3, x = Math.sin(a) * .24, z = Math.cos(a) * .24; add(h, cone, GOLD, [x, .2, z], [.05, .14, .05]); add(h, ball, solid(i % 2 ? 0x20c3e6 : 0xff5a5f, {roughness:.2}), [x, .28, z], [.03, .03, .03]); }
      add(h, ball, solid(0x14b892, {roughness:.2}), [0, .07, .24], [.035, .035, .025]); },
    sun(g){ const M = solid(0x1a1f3a, {roughness:.15});
      [-1, 1].forEach(s => { add(g, ball, M, [s * .19, 0, 0], [.105, .085, .025], [0, s * .32, 0]); add(g, cylG(.012, .012, .34), M, [s * .31, .02, -.2], null, [PI / 2, 0, 0]); });
      add(g, cylG(.014, .014, .14), M, [0, .02, .04], null, [0, 0, PI / 2]); },
    hearts(g){ const M = solid(0xff5a5f, {roughness:.3, transparent:true, opacity:.93});
      [-1, 1].forEach(s => add(g, heartGeo(.07, .025), M, [s * .19, 0, -.01], null, [0, s * .32, 0])); add(g, cylG(.012, .012, .12), solid(0xd63c42), [0, .02, .03], null, [0, 0, PI / 2]); },
    stars(g){ const M = solid(0xffcc33, {roughness:.3, emissive:0x5a3d00});
      [-1, 1].forEach(s => add(g, starGeo(.125, .025), M, [s * .19, .01, -.01], null, [0, s * .32, 0])); add(g, cylG(.012, .012, .12), solid(0xd99a00), [0, .02, .03], null, [0, 0, PI / 2]); },
    // Hals: der Ring liegt um die Y-Achse der Ankergruppe, +Z ist vorn
    scarf(g){ add(g, torG(.235, .075), solid(0xff5a5f, {roughness:.9}), null, [1, 1, .9], [PI / 2, 0, 0]);
      const e = add(g, new T.BoxGeometry(.13, .34, .05), solid(0xd63c42, {roughness:.9}), [.15, -.14, .3], null, [-.5, 0, -.12]); fxs.push((t, st) => { e.rotation.x = -.5 + Math.sin(st.w) * .25 * st.walk; }); },
    bow(g){ const M = solid(0x8457ff); [-1, 1].forEach(s => add(g, cone, M, [s * .1, 0, .27], [.09, .2, .05], [0, 0, s * PI / 2])); add(g, ball, solid(0x6236d6), [0, 0, .28], [.05, .05, .05]); },
    medal(g){ add(g, torG(.225, .028), solid(0x3887ff, {roughness:.9}), null, [1, 1.2, 1], [PI / 2 + .18, 0, 0]);
      const m = grp(g, [0, -.1, .4], [-.84, 0, 0]); add(m, cylG(.1, .1, .03), solid(0xffcc33, {metalness:.3, roughness:.3}), null, null, [PI / 2, 0, 0]); add(m, starGeo(.06, .012), solid(0xd99a00), [0, 0, .015]);
      fxs.push((t, st) => { m.rotation.z = Math.sin(st.w) * .3 * st.walk; }); },
    // Rücken: Ankergruppe sitzt in der Körpermitte, +Z zeigt zum Hals, +Y nach außen
    cape(g){ const c = grp(g); add(c, new T.CylinderGeometry(.4, .47, .95, 28, 1, true, PI / 2, PI), solid(0xff5a5f, {roughness:.85, side:T.DoubleSide}), null, [1, 1, 1.02], [PI / 2, 0, 0]);
      add(c, torG(.235, .045), solid(0xd63c42, {roughness:.85}), [0, .2, .5], [1, 1, .8], [-.93, 0, 0]);
      [-1, 1].forEach(s => add(c, starGeo(.11, .015), solid(0xffcc33, {emissive:0x5a3d00}), [s * .4, .1, -.05], null, [0, s * PI / 2, 0]));
      fxs.push((t, st) => { c.rotation.x = Math.sin(st.w * 2) * .03 * st.walk; }); },
    wings(g){ const W = solid(0xffffff, {roughness:.7, side:T.DoubleSide, emissive:0x30344a});
      const ws = [-1, 1].map(s => { const w = grp(g, [s * .16, 0, 0]); add(w, wingGeo(), W, null, [s * .85, .85, 1], [0, -s * .35, 0]); return w; });
      fxs.push((t, st) => ws.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (.25 + Math.sin(t * (3 + 6 * st.walk)) * .22 * (1 - st.sleep) - .9 * st.sleep); })); },
    sparkle(g){ const M = flat(0xffcc33, {transparent:true}), G = new T.OctahedronGeometry(1);
      const ps = [[-1.25, .5, 0], [1.3, .7, -.2], [-1.05, 1.9, -.3], [1.1, 2.1, 0], [0, 2.45, -.2], [-1.45, 1.25, .2], [1.45, 1.45, .2], [.55, .2, .5]].map(p => add(g, G, M, p));
      fxs.push(t => ps.forEach((o, i) => { const k = .05 + .045 * (1 + Math.sin(t * (1.6 + i * .23) + i * 1.7)); o.scale.set(k * .6, k * 1.3, k * .6); o.rotation.y = t + i; })); },
    fire(g){ add(g, new T.CircleGeometry(1.2, 32), flat(0xff7a1a, {transparent:true, opacity:.3, side:T.DoubleSide}), [0, .01, 0], [1, .42, 1], [-PI / 2, 0, 0]);
      const fl = Array.from({length:11}, (_, i) => { const a = i / 11 * PI * 2; return add(g, cone, flat(i % 2 ? 0xffbf1f : 0xff5a5f, {transparent:true, opacity:.9}), [Math.sin(a) * 1.15, .16, Math.cos(a) * .5], [.09, .34, .09]); });
      fxs.push(t => fl.forEach((o, i) => { const k = .34 * (.75 + .35 * Math.sin(t * (7 + i % 3) + i * 2.1)); o.scale.y = k; o.position.y = k / 2; })); },
    ring(g){ const r = grp(g, [0, 1, -.7]); ["#ff5a5f", "#ffbf1f", "#14b892", "#3887ff", "#8457ff"].forEach((c, i) => add(r, torG(1.42 - i * .085, .036), flat(c, {transparent:true, opacity:.9})));
      fxs.push(t => { r.rotation.z = t * .25; const k = 1 + Math.sin(t * 1.5) * .02; r.scale.set(k, k, 1); }); },
  };
  const rigs = {}; let cur = null, worn = [], dressed = null, skin = "", paintT = 0;
  function rigOf(pet){
    if (rigs[pet]) return rigs[pet];
    B = {root:grp(scene), furGeos:[], eyes:[], furLen:.045, iris:solid(0xe8a020, {roughness:.3})};
    MODELS[pet](B); const r = rigs[pet] = B; B = null; return r;
  }
  function dress(rig, pet, o){
    const sig = pet + "|" + SLOTS.map(([k]) => o[k] || "").join("|"); if (sig === dressed) return; dressed = sig;
    worn.forEach(g => { g.traverse(m => { if (m.geometry && m.geometry !== ball && m.geometry !== cone) m.geometry.dispose(); }); g.parent.remove(g); });
    worn = []; fxs = [];
    ["head", "eyes", "neck", "back", "aura"].forEach(slot => {
      const k = o[slot]; if (!k || !WEAR3[k]) return;
      const a = slot === "aura" ? {parent:scene} : (rig.A[k] || rig.A[slot]), g = grp(a.parent, a.pos, a.rot);
      if (a.scl) typeof a.scl === "number" ? g.scale.setScalar(a.scl) : g.scale.set(...a.scl);
      WEAR3[k](g); worn.push(g);
    });
    skin = SKINS[o.skin] ? o.skin : ""; const p = skin ? SKINS[skin] : rig.pal;
    paint(rig, p); rig.iris.color.set(p.eye);
    FURS.forEach((m, i) => { m.roughness = i ? Math.min(1, p.rough + .1) : p.rough; m.metalness = p.metal; m.emissive.set(p.main).multiplyScalar(p.glow || 0); });
    if (rig.onDress) rig.onDress(o);
  }

  const st = {t:0, walk:0, sleep:0, sad:0, happy:0, yaw:.4, w:0, wag:0, jump:-1, wasJump:false, blink:2, last:0, box:null, raf:0, size:0};
  const P = {t:0, st, jy:0, Z:0, munch:false, sleeping:false};
  function frame(now){
    const box = st.box;
    if (!box || !cur || !canvas.isConnected || tab !== "avatar"){ st.raf = 0; return; }
    st.raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, Math.max(0, (now - st.last) / 1000)); st.last = now; st.t += dt;
    const t = st.t, w = canvas.clientWidth; if (w && w !== st.size){ st.size = w; renderer.setSize(w, w, false); }
    const cl = box.classList, k = Math.min(1, dt * 8), sleeping = cl.contains("sleep"), walking = cl.contains("walk"), dir = cl.contains("left") ? -1 : 1;
    st.walk = lerp(st.walk, walking ? 1 : 0, k); st.sleep = lerp(st.sleep, sleeping ? 1 : 0, Math.min(1, dt * 3));
    st.sad = lerp(st.sad, cl.contains("sad") ? 1 : 0, k); st.happy = lerp(st.happy, cl.contains("happy") ? 1 : 0, k);
    st.yaw = lerp(st.yaw, dir * cur.yaw[walking ? 1 : 0], Math.min(1, dt * 7)); cur.root.rotation.y = st.yaw;
    // Hüpfer: startet, sobald die Klasse "jump" neu gesetzt wird
    if (cl.contains("jump")){ if (!st.wasJump) st.jump = 0; st.wasJump = true; } else st.wasJump = false;
    let jy = 0; if (st.jump >= 0){ st.jump += dt; const p = st.jump / .55; if (p >= 1) st.jump = -1; else jy = Math.sin(PI * p) * .5; }
    st.w += dt * cur.stride * st.walk; st.wag += dt * (11 * st.happy + 3 * st.walk);
    st.blink -= dt; if (st.blink < -.13) st.blink = 2.5 + Math.random() * 3;
    const closed = sleeping || st.happy > .5 || st.blink < 0;
    cur.eyes.forEach(e => { e.scale.y = lerp(e.scale.y, closed ? .08 : 1, Math.min(1, dt * 30)); });
    P.t = t; P.jy = jy; P.Z = st.sleep; P.munch = cl.contains("munch"); P.sleeping = sleeping;
    cur.pose(P);
    fxs.forEach(f => f(t, st));
    if (skin === "rainbow" && t - paintT > .08){ paintT = t; const h = (t * .12) % 1;
      paint(cur, {main:cT.setHSL(h, .9, .6).getHex(), light:0xffffff, dark:cT.setHSL((h + .5) % 1, .7, .22).getHex(), alt:cT.setHSL((h + .33) % 1, .9, .6).getHex()}); }
    renderer.render(scene, cam);
  }
  return {canvas, has:pet => !!MODELS[pet], start(box, pet, outfit){
    const rig = rigOf(pet); Object.keys(rigs).forEach(k => { rigs[k].root.visible = rigs[k] === rig; });
    cur = rig; st.box = box; dress(rig, pet, outfit || {}); st.last = performance.now(); if (!st.raf) st.raf = requestAnimationFrame(frame);
  }};
}

/* ---------- Vokabelliste ---------- */
let editId = null;
function renderList(){
  const q = $("lSearch").value.trim().toLowerCase();
  const html = setsByRecency().map(({name:set}) => {
    const ws = wordsOf(set).filter(w => !q || (w.en + " " + w.de).toLowerCase().includes(q));
    if (!ws.length) return "";
    return `<div class="group card"><h3>${esc(set)} <span class="muted">${ws.length} Wörter</span></h3><ul class="plain vlist">${ws.map(w => {
      const dot = w.last === 2 ? "g" : w.last === 1 ? "y" : w.last === 0 ? "b" : "";
      if (editId === w.id) return `<li><form class="edit" data-edit="${w.id}">
        <input type="text" id="e-en-${w.id}" value="${esc(w.en)}" aria-label="Englisch">
        <input type="text" id="e-de-${w.id}" value="${esc(w.de)}" aria-label="Deutsch">
        <input type="text" id="e-hint-${w.id}" value="${esc(w.hint||"")}" placeholder="Umschreibung" aria-label="Umschreibung">
        <input type="text" id="e-set-${w.id}" value="${esc(w.set||"")}" placeholder="Liste" aria-label="Liste">
        <div class="row"><button class="btn small" type="submit">Speichern</button><button class="btn soft small" type="button" data-cancel>Abbrechen</button><span class="grow"></span><button class="btn coral small" type="button" data-del="${w.id}">Löschen</button></div>
      </form></li>`;
      return `<li><div class="en"><span class="dot ${dot}"></span>${esc(showMeaning(w.en))}</div><div>${esc(w.de)}</div><div><button class="iconbtn" data-ed="${w.id}">Ändern</button></div>${w.hint ? `<div class="h">${esc(w.hint)}</div>` : ""}</li>`;
    }).join("")}</ul></div>`;
  }).join("");
  $("lGroups").innerHTML = html || `<p class="muted" style="margin-top:16px">Keine Vokabeln gefunden.</p>`;
  const missing = S.words.filter(w => !w.hint).length;
  getSample().then(s => { $("hintGenRow").hidden = !(s && missing); $("hintGenBtn").textContent = `Fehlende Umschreibungen erzeugen (${missing})`; });
}
$("toAdd").onclick = () => setTab("neu");
$("addBack").onclick = () => setTab("liste");
$("lSearch").oninput = renderList;
$("lGroups").addEventListener("click", e => {
  const ed = e.target.closest("[data-ed]"), del = e.target.closest("[data-del]"), cancel = e.target.closest("[data-cancel]");
  if (ed){ editId = ed.dataset.ed; renderList(); }
  if (cancel){ editId = null; renderList(); }
  if (del){
    if (del.dataset.sure){ S.words = S.words.filter(w => w.id !== del.dataset.del); editId = null; save(); renderList(); toast("Gelöscht"); }
    else { del.dataset.sure = "1"; del.textContent = "Wirklich löschen?"; }
  }
});
$("lGroups").addEventListener("submit", e => {
  e.preventDefault(); const id = e.target.dataset.edit, w = wordById(id); if (!w) return;
  w.en = $("e-en-"+id).value.trim() || w.en; w.de = $("e-de-"+id).value.trim() || w.de;
  w.hint = $("e-hint-"+id).value.trim(); w.set = $("e-set-"+id).value.trim() || "Ohne Liste";
  editId = null; save(); renderList(); toast("Gespeichert");
});
$("hintGenBtn").onclick = async () => {
  const sample = await getSample(); if (!sample) return;
  const miss = S.words.filter(w => !w.hint).slice(0, 60);
  $("hintGenBtn").disabled = true; $("hintGenMsg").textContent = "Claude schreibt Umschreibungen …";
  try{ await genHints(sample, miss); save(); $("hintGenMsg").textContent = ""; renderList(); toast("Umschreibungen ergänzt"); }
  catch(e){ $("hintGenMsg").textContent = sampleErr(e); }
  $("hintGenBtn").disabled = false;
};
const HINT_RULE = "eine kurze, kindgerechte Umschreibung auf Deutsch für ein Kind der 5. Klasse (höchstens 15 Wörter). Sie darf weder das englische Wort noch eines der deutschen Wörter oder deren Wortstamm enthalten. Bei kleinen Wörtern wie Präpositionen ist ein Lückensatz mit ___ erlaubt.";
const PHOTO_PROMPT = "Die Bilder zeigen eine Vokabelliste aus einem Englischbuch (Klasse 5, Englisch–Deutsch). Lies ALLE Vokabeln in der Reihenfolge ab.\n" +
  "- en: das englische Wort oder die Wendung genau wie im Buch (mit to bei Verben, Satzzeichen bei Sätzen, Kurzformen wie \"it's (= it is)\").\n" +
  "- de: alle deutschen Bedeutungen genau wie im Buch, mehrere mit \"; \" getrennt.\n" +
  "- hint: " + HINT_RULE + "\n" +
  "Lass Lautschrift, Beispielsätze und Seitenzahlen weg.\n" +
  "Antworte nur mit JSON: {\"words\":[{\"en\":\"...\",\"de\":\"...\",\"hint\":\"...\"}]}";
async function genHints(sample, list){
  if (!list.length) return;
  const data = await sample.json(
    "Schreibe für jede Vokabel " + HINT_RULE + "\nAntworte nur mit JSON in der Form {\"hints\":[{\"id\":\"...\",\"hint\":\"...\"}]}.\n\nVokabeln:\n" +
    list.map(w => `${w.id}: ${w.en} = ${w.de}`).join("\n"), {modelTier:"quick"});
  for (const h of (data && data.hints) || []){ const w = wordById(h.id); if (w && h.hint && !w.hint) w.hint = String(h.hint).trim(); }
}

/* ---------- Hinzufügen ---------- */
let manualBatch = [], manualTimer = null;
function queueManual(w){ manualBatch.push(w); clearTimeout(manualTimer); manualTimer = setTimeout(flushManual, 90000); }
function flushManual(){
  clearTimeout(manualTimer); if (!manualBatch.length) return;
  const b = manualBatch; manualBatch = [];
  const sets = [...new Set(b.map(w => w.set))].join(", ");
  logEvent("upload", `Neue Vokabeln von Hand eingetragen: ${sets} (${b.length})`, [`Liste: ${sets}`, "", ...b.map(w => `– ${showMeaning(w.en)} = ${w.de}`)]);
}
addEventListener("pagehide", flushManual);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushManual(); });
let photos = [], found = [];
function renderNew(){
  $("setList").innerHTML = setsByRecency().map(s => `<option value="${esc(s.name)}">`).join("");
  getSample().then(async s => {
    let img = false;
    try{ img = !!(s && (await s.limits()).images); }catch(e){}
    $("photoBox").hidden = !img; $("photoOff").hidden = img;
  });
}
function resize(file){
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const m = 1600, k = Math.min(1, m / Math.max(im.width, im.height));
      const c = document.createElement("canvas"); c.width = Math.round(im.width*k); c.height = Math.round(im.height*k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error("blob")), "image/jpeg", .85); };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("img")); };
    im.src = url;
  });
}
$("nPhoto").onchange = async e => {
  const files = [...e.target.files].slice(0, 4);
  photos = [];
  for (const f of files){ try{ photos.push(await resize(f)); }catch(err){} }
  $("nThumbs").innerHTML = ""; photos.forEach(b => { const i = new Image(); i.src = URL.createObjectURL(b); i.alt = "Vokabelfoto"; $("nThumbs").appendChild(i); });
  $("nRead").disabled = !photos.length; $("nReadMsg").textContent = photos.length ? `${photos.length} Foto${photos.length > 1 ? "s" : ""} bereit` : "Bild konnte nicht geladen werden.";
};
$("nRead").onclick = async () => {
  const sample = await getSample(); if (!sample || !photos.length) return;
  $("nRead").disabled = true; $("nReadMsg").textContent = "Claude liest die Wörter … (etwa eine halbe Minute)";
  try{
    const data = await sample.json(PHOTO_PROMPT, {images: photos, modelTier:"default"});
    found = ((data && data.words) || []).filter(w => w && w.en && w.de).map(w => ({en:String(w.en).trim(), de:String(w.de).trim(), hint:String(w.hint||"").trim()}));
    if (!found.length) $("nReadMsg").textContent = "Keine Vokabeln erkannt. Versuch ein schärferes, gerades Foto.";
    else { $("nReadMsg").textContent = `${found.length} Wörter gefunden`; renderReview(); }
  }catch(e){ $("nReadMsg").textContent = sampleErr(e); }
  $("nRead").disabled = !photos.length;
};
function renderReview(){
  $("nReview").hidden = !found.length;
  $("nReviewList").innerHTML = found.map((w, i) => `<li>
    <input type="checkbox" id="r-on-${i}" checked aria-label="Übernehmen">
    <input type="text" id="r-en-${i}" value="${esc(w.en)}" aria-label="Englisch">
    <input type="text" id="r-de-${i}" value="${esc(w.de)}" aria-label="Deutsch"></li>`).join("");
}
const defaultSet = () => $("nSet").value.trim() || "Neue Wörter " + todayKey().split("-").reverse().join(".");
$("nSaveAll").onclick = () => {
  const set = defaultSet(); let n = 0;
  found.forEach((w, i) => {
    if (!$("r-on-"+i).checked) return;
    const en = $("r-en-"+i).value.trim(), de = $("r-de-"+i).value.trim(); if (!en || !de) return;
    S.words.push({id:uid(), en, de, hint:w.hint, set, right:0, wrong:0, last:null, added:todayKey()}); n++;
  });
  found = []; photos = []; $("nThumbs").innerHTML = ""; $("nReadMsg").textContent = ""; $("nRead").disabled = true; $("nPhoto").value = "";
  renderReview(); save(); toast(`${n} Wörter gespeichert in „${set}“`);
  if (n) logEvent("upload", `Neue Vokabelliste hochgeladen: ${set} (${n} Wörter)`,
    [`Liste: ${set}`, `Per Foto hinzugefügt: ${n} Wörter`, "", ...S.words.filter(w => w.set === set && w.added === todayKey()).slice(-n).map(w => `– ${showMeaning(w.en)} = ${w.de}`)]);
};
$("nDiscard").onclick = () => { found = []; renderReview(); };
$("nForm").onsubmit = async e => {
  e.preventDefault();
  const en = $("nEn").value.trim(), de = $("nDe").value.trim(), hint = $("nHint").value.trim();
  if (!en || !de){ toast("Bitte Englisch und Deutsch ausfüllen."); return; }
  const w = {id:uid(), en, de, hint, set:defaultSet(), right:0, wrong:0, last:null, added:todayKey()};
  S.words.push(w); save();
  queueManual(w);
  $("nEn").value = $("nDe").value = $("nHint").value = ""; $("nEn").focus();
  toast(`„${en}“ gespeichert`);
  if (!hint){ const s = await getSample(); if (s){ try{ await genHints(s, [w]); save(); }catch(err){} } }
};

/* ---------- Sonstiges ---------- */
let tt;
function toast(msg){ const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 2600); }
function renderAll(){ renderTop(); setTab(tab); }
setInterval(() => { if (tab === "dash") renderDash(); }, 60000);

renderAll(); setStorage("");
initStore();
})();
