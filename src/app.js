const $ = id => document.getElementById(id);
const CHANNELS = ['general', 'games', 'muziek', 'ruimte-praat'];
let ws, name, current = 'general';
const store = {}; CHANNELS.forEach(c => store[c] = []);

$('go').onclick = connect;
$('name').onkeydown = $('server').onkeydown = e => e.key === 'Enter' && connect();

function connect() {
  name = $('name').value.trim();
  if (!name) return $('err').textContent = 'Kies een gebruikersnaam';
  try { ws = new WebSocket($('server').value.trim()); } catch { return $('err').textContent = 'Ongeldig adres'; }
  ws.onerror = () => $('err').textContent = 'Kan niet verbinden met server';
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', name }));
    $('login').classList.add('hidden'); $('app').classList.remove('hidden');
    $('me').textContent = name; drawChannels(); show();
  };
  ws.onclose = () => { if (!$('app').classList.contains('hidden')) alert('Verbinding verbroken'); location.reload(); };
  ws.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.type === 'history') { store[d.channel] = d.messages; if (d.channel === current) show(); }
    if (d.type === 'msg') { store[d.channel].push(d); if (d.channel === current) show(); }
    if (d.type === 'members') {
      $('mlist').innerHTML = '';
      d.list.forEach(n => { const r = document.createElement('div'); r.className = 'mem';
        r.innerHTML = '<span class="dot"></span>'; r.append(n); $('mlist').append(r); });
    }
  };
}
function drawChannels() {
  $('channels').innerHTML = '';
  CHANNELS.forEach(c => {
    const el = document.createElement('div');
    el.className = 'ch' + (c === current ? ' active' : ''); el.textContent = '# ' + c;
    el.onclick = () => { current = c; drawChannels(); show(); };
    $('channels').append(el);
  });
}
function show() {
  $('chtitle').textContent = '# ' + current;
  $('msg').placeholder = 'Bericht in #' + current;
  const box = $('msgs'); box.innerHTML = '';
  store[current].forEach(m => {
    const el = document.createElement('div'); el.className = 'm';
    const b = document.createElement('b'); b.textContent = m.name;
    const s = document.createElement('small'); s.textContent = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const t = document.createElement('div'); t.textContent = m.text;
    el.append(b, s, t); box.append(el);
  });
  box.scrollTop = box.scrollHeight;
}
$('msg').onkeydown = e => {
  if (e.key !== 'Enter' || !$('msg').value.trim()) return;
  ws.send(JSON.stringify({ type: 'msg', channel: current, text: $('msg').value.slice(0, 2000) }));
  $('msg').value = '';
};
