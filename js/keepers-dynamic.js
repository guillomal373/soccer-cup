// js/keepers-dynamic.js
// Calcula Top 10 de equipos con menos goles en contra (Menos valla vencida)

document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('panel-keepers');
  if (!panel) return;

  Promise.all([
    fetch('data/matches.json').then(r => r.json()),
    fetch('data/teams.json').then(r => r.json())
  ]).then(([matchesData, teamsData]) => {
    const teams = (teamsData.teams || []).map(t => ({ id: t.id, name: t.name, logo: t.logo }));
    const stats = Object.fromEntries(teams.map(t => [t.id, { goalsAgainst: 0, played: 0 }]));

    (matchesData.matches || []).forEach(m => {
      if (typeof m.scoreA === 'number' && typeof m.scoreB === 'number') {
        if (!stats[m.teamA]) stats[m.teamA] = { goalsAgainst: 0, played: 0 };
        if (!stats[m.teamB]) stats[m.teamB] = { goalsAgainst: 0, played: 0 };
        stats[m.teamA].played++; stats[m.teamB].played++;
        stats[m.teamA].goalsAgainst += m.scoreB;
        stats[m.teamB].goalsAgainst += m.scoreA;
      }
    });

    const ranking = teams.map(t => ({
      id: t.id,
      name: t.name || t.id,
      logo: t.logo || `img/${t.id}/logo.png`,
      ga: (stats[t.id]?.goalsAgainst) ?? 0,
      played: (stats[t.id]?.played) ?? 0
    }))
    .sort((a,b) => (a.ga - b.ga) || (a.played - b.played) || a.name.localeCompare(b.name))
    .slice(0, 10);

    const tbody = document.getElementById('keepers-tbody');
    const cards = document.getElementById('keepers-cards');
    if (!ranking.length) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; font-weight:800;">Sin datos</td></tr>`;
      if (cards) cards.innerHTML = '';
      return;
    }

    if (tbody) tbody.innerHTML = ranking.map((t, i) => `
      <tr>
        <td>${i+1}</td>
        <td><a class="team-link" href="team.html?team=${t.id}"><img src="${t.logo}" class="logo sm" alt="${t.name}"></a> ${t.name}</td>
        <td>${t.ga}</td>
      </tr>
    `).join('');

    if (cards) cards.innerHTML = ranking.map((t, i) => `
      <li class="stat-card">
        <span class="rank">${i+1}</span>
        <span class="name">${t.name}</span>
        <span class="team"><a class="team-link" href="team.html?team=${t.id}"><img src="${t.logo}" class="logo sm" alt="${t.name}"></a> GC</span>
        <span class="value chip">${t.ga}</span>
      </li>
    `).join('');
  }).catch(() => {
    const tbody = document.getElementById('keepers-tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; font-weight:800;">No se pudo cargar</td></tr>`;
  });
});
