// js/scorers-top.js
// Renderiza el Top 8 de goleadores del TORNEO en index.html (agregado por sección "Goles")

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('tournament-scorers');
  if (!section) return; // solo en index.html

  Promise.all([
    fetch('data/matches.json').then(r => r.json()),
    fetch('data/teams.json').then(r => r.json())
  ]).then(([matchesData, teamsData]) => {
    const teams = teamsData.teams || [];
    const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
    const goalsByKey = {};

    (matchesData.matches || []).forEach(m => {
      if (!Array.isArray(m.events)) return;
      m.events.forEach(ev => {
        if (!ev || ev.type !== 'goal' || !ev.teamId || !ev.playerId) return;
        const key = `${ev.teamId}:${ev.playerId}`;
        goalsByKey[key] = (goalsByKey[key] || 0) + 1;
      });
    });

    const scorers = Object.entries(goalsByKey).map(([key, goals]) => {
      const [teamId, playerId] = key.split(':');
      const team = teamMap[teamId] || {};
      const meta = (team.players || []).find(p => p.id === playerId) || {};
      return {
        teamId,
        teamName: team.name || teamId,
        goals,
        id: playerId,
        name: meta.name || playerId,
        pos: meta.position || '',
        img: `img/${teamId}/${playerId}.png`
      };
    }).sort((a,b) => b.goals - a.goals).slice(0, 8);

    const header = document.getElementById('goals');
    const top = document.getElementById('t-scorers-top');
    const list = document.getElementById('t-scorers-list');
    const empty = document.getElementById('t-scorers-empty');

    if (!scorers.length) {
      if (section) section.hidden = true;
      if (header) header.style.display = 'none';
      return;
    }

    section.hidden = false;
    if (header) header.style.display = '';
    if (empty) empty.hidden = true;

    // Top 3
    top.innerHTML = scorers.slice(0,3).map((s, i) => `
      <div class="s-top rank-${i+1}">
        <div class="avatar">
          <img src="${s.img}" alt="${s.name}" onerror="this.src='img/${s.teamId}/p01.png'">
          <span class="badge">${s.goals}</span>
        </div>
        <div class="name">${s.name}</div>
        <div class="sub">${s.teamName}${s.pos ? ' · ' + s.pos : ''}</div>
      </div>
    `).join('');

    // 4..8
    list.innerHTML = scorers.slice(3).map((s, i) => `
      <li>
        <span class="num">${i+4}</span>
        <span class="who">
          <img class="mini" src="${s.img}" alt="${s.name}" onerror="this.src='img/${s.teamId}/p01.png'"> ${s.name}
          <span class="pos">· ${s.teamName}${s.pos ? ' · ' + s.pos : ''}</span>
        </span>
        <span class="g">${s.goals}</span>
      </li>
    `).join('');
  }).catch(() => {
    const section = document.getElementById('tournament-scorers');
    const header = document.getElementById('goals');
    if (section) section.hidden = true;
    if (header) header.style.display = 'none';
  });
});

