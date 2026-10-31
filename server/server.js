const { WebSocketServer } = require('ws');
const CHANNELS = ['general', 'games', 'muziek', 'ruimte-praat'];
const history = {}; CHANNELS.forEach(c => history[c] = []);
const wss = new WebSocketServer({ port: process.env.PORT || 3000 });
const names = new Map();
const broadcast = o => wss.clients.forEach(c => c.readyState === 1 && c.send(JSON.stringify(o)));
wss.on('connection', ws => {
  ws.on('message', raw => {
    let d; try { d = JSON.parse(raw); } catch { return; }
    if (d.type === 'join') {
      names.set(ws, String(d.name).slice(0, 20));
      CHANNELS.forEach(c => ws.send(JSON.stringify({ type: 'history', channel: c, messages: history[c] })));
      broadcast({ type: 'members', list: [...names.values()] });
    } else if (d.type === 'msg' && names.has(ws) && history[d.channel]) {
      const m = { type: 'msg', channel: d.channel, name: names.get(ws), text: String(d.text).slice(0, 2000), time: Date.now() };
      history[d.channel].push(m); if (history[d.channel].length > 100) history[d.channel].shift();
      broadcast(m);
    }
  });
  ws.on('close', () => { names.delete(ws); broadcast({ type: 'members', list: [...names.values()] }); });
});
console.log('NovaX server draait op poort', process.env.PORT || 3000);
