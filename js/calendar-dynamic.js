// js/calendar-dynamic.js
// Genera la sección de calendario de partidos de forma dinámica

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
    fetch('data/matches.json').then(r => r.json()),
    fetch('data/teams.json').then(r => r.json())
  ]).then(([matchesData, teamsData]) => {
    const teams = {};
    teamsData.teams.forEach(t => teams[t.id] = t);
    // Desktop: tabla
    const tbody = document.querySelector('.calendar-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      matchesData.matches.forEach(match => {
        const teamA = teams[match.teamA];
        const teamB = teams[match.teamB];
        const score = (typeof match.scoreA === 'number' && typeof match.scoreB === 'number') ? `${match.scoreA}–${match.scoreB}` : '—';
        tbody.innerHTML += `
          <tr data-home="${teamA.name}" data-away="${teamB.name}" data-score="${score}">
            <td>${formatDate(match.date)}</td>
            <td>${match.time || ''}</td>
            <td class="versus">
              <span class="team">
                <img src="${teamA.logo}" alt="${teamA.name}" class="logo"> <b>${teamA.name}</b>
              </span>
              <span class="vs">VS</span>
              <span class="team">
                <img src="${teamB.logo}" alt="${teamB.name}" class="logo"> <b>${teamB.name}</b>
              </span>
            </td>
            <td>${match.stadium || ''}</td>
            <td class="score${score === '—' ? ' pending' : ''}">${score}</td>
          </tr>
        `;
      });
    }
    // Mobile: cards
    const cards = document.querySelector('.calendar-cards');
    if (cards) {
      cards.innerHTML = '';
      matchesData.matches.forEach(match => {
        const teamA = teams[match.teamA];
        const teamB = teams[match.teamB];
        const score = (typeof match.scoreA === 'number' && typeof match.scoreB === 'number') ? `${match.scoreA}–${match.scoreB}` : '—';
        cards.innerHTML += `
          <article class="match-card" data-home="${teamA.name}" data-away="${teamB.name}" data-score="${score}">
            <div class="match-meta">
              <span class="date">${formatDate(match.date)}</span> · <span class="time">${match.time || ''}</span>
            </div>
            <div class="match-versus">
              <span class="team">
                <img src="${teamA.logo}" alt="${teamA.name}" class="logo">
                <b class="name">${teamA.name}</b>
              </span>
              <span class="vs">VS</span>
              <span class="team">
                <img src="${teamB.logo}" alt="${teamB.name}" class="logo">
                <b class="name">${teamB.name}</b>
              </span>
            </div>
            <div class="match-extra">
              <span class="chip stadium">${match.stadium || ''}</span>
              <span class="chip score${score === '—' ? ' pending' : ''}">${score}</span>
            </div>
          </article>
        `;
      });
    }
  });
});

function formatDate(dateStr) {
  // Espera formato YYYY-MM-DD
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('es', { month: 'short' });
  return `${day} ${month}`;
}
