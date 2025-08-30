// js/cards-dynamic.js
// Rellena dinámicamente la subsección de Tarjetas en index.html a partir de data/matches.json

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#panel-cards .stats-table tbody');
  const list = document.querySelector('#panel-cards .stats-cards');
  if (!tbody || !list) return;

  Promise.all([
    fetch('data/matches.json').then(r => r.json()),
    fetch('data/teams.json').then(r => r.json())
  ])
  .then(([matchesData, teamsData]) => {
    const teamMap = Object.fromEntries((teamsData.teams || []).map(t => [t.id, t]));
    const acc = {}; // key: teamId:playerId -> {yc, rc}

    (matchesData.matches || []).forEach(m => {
      if (!Array.isArray(m.events)) return;
      m.events.forEach(ev => {
        if (!ev || !ev.teamId || !ev.playerId) return;
        if (ev.type !== 'yc' && ev.type !== 'rc') return;
        const key = `${ev.teamId}:${ev.playerId}`;
        if (!acc[key]) acc[key] = { yc: 0, rc: 0 };
        if (ev.type === 'yc') acc[key].yc++;
        if (ev.type === 'rc') acc[key].rc++;
      });
    });

    let rows = Object.entries(acc).map(([key, v]) => {
      const [teamId, playerId] = key.split(':');
      const team = teamMap[teamId] || {};
      const player = (team.players || []).find(p => p.id === playerId) || {};
      return {
        teamId,
        teamName: team.name || teamId,
        teamLogo: team.logo || `img/${teamId}/logo.png`,
        id: playerId,
        name: player.name || playerId,
        yc: v.yc,
        rc: v.rc
      };
    });

    // Orden: primero rojas desc, luego amarillas desc, luego nombre
    rows.sort((a, b) => (b.rc - a.rc) || (b.yc - a.yc) || a.name.localeCompare(b.name));
    const top = rows.slice(0, 10);

    if (!top.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; font-weight:800;">Sin datos de tarjetas</td></tr>`;
      list.innerHTML = '';
      return;
    }

    tbody.innerHTML = top.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td><a class="team-link" href="team.html?team=${p.teamId}"><img src="${p.teamLogo}" class="logo sm" alt="${p.teamName}"></a> ${p.teamName}</td>
        <td>${p.yc}</td>
        <td>${p.rc}</td>
      </tr>
    `).join('');

    list.innerHTML = top.map((p, i) => `
      <li class="stat-card">
        <span class="rank">${i + 1}</span>
        <span class="name">${p.name}</span>
        <span class="team"><a class="team-link" href="team.html?team=${p.teamId}"><img src="${p.teamLogo}" class="logo sm" alt="${p.teamName}"></a> ${p.teamName}</span>
        <span class="value chip">${p.yc}A · ${p.rc}R</span>
      </li>
    `).join('');
  })
  .catch(() => {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; font-weight:800;">No se pudo cargar</td></tr>`;
    list.innerHTML = '';
  });
});
