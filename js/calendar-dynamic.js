// js/calendar-dynamic.js
// Genera la sección de calendario de partidos de forma dinámica

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
    fetch('data/matches.json').then(r => r.json()),
    fetch('data/teams.json').then(r => r.json())
  ]).then(([matchesData, teamsData]) => {
    const teams = {};
    teamsData.teams.forEach(t => teams[t.id] = t);

    // Filtros: poblar selects
    const teamSelect = document.getElementById('filter-team');
    if (teamSelect) {
      teamsData.teams.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        teamSelect.appendChild(opt);
      });
    }
    const stadiumSelect = document.getElementById('filter-stadium');
    if (stadiumSelect) {
      const stadiums = Array.from(new Set(matchesData.matches.map(m => m.stadium).filter(Boolean)));
      stadiums.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        stadiumSelect.appendChild(opt);
      });
    }

    // Render matches with filters
    function renderFiltered() {
      let filtered = matchesData.matches.slice();
      // Ordenar por fecha descendente (más reciente/siguiente primero)
      filtered.sort((a, b) => {
        // Si no hay fecha, van al final
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        // Comparar fechas y horas
        const dateA = new Date(a.date + (a.time ? 'T' + a.time : ''));
        const dateB = new Date(b.date + (b.time ? 'T' + b.time : ''));
        return dateB - dateA;
      });
      // Team filter
      const teamVal = teamSelect ? teamSelect.value : '';
      if (teamVal) {
        filtered = filtered.filter(m => m.teamA === teamVal || m.teamB === teamVal);
      }
      // State filter
      const stateVal = document.getElementById('filter-state')?.value || '';
      if (stateVal === 'played') {
        filtered = filtered.filter(m => typeof m.scoreA === 'number' && typeof m.scoreB === 'number');
      } else if (stateVal === 'upcoming') {
        filtered = filtered.filter(m => typeof m.scoreA !== 'number' || typeof m.scoreB !== 'number');
      }
      // Stadium filter
      const stadiumVal = stadiumSelect ? stadiumSelect.value : '';
      if (stadiumVal) {
        filtered = filtered.filter(m => m.stadium === stadiumVal);
      }
      // Result filter (only if team selected)
      const resultVal = document.getElementById('filter-result')?.value || '';
      if (resultVal && teamVal) {
        filtered = filtered.filter(m => {
          if (typeof m.scoreA !== 'number' || typeof m.scoreB !== 'number') return false;
          if (resultVal === 'win') {
            return (m.teamA === teamVal && m.scoreA > m.scoreB) || (m.teamB === teamVal && m.scoreB > m.scoreA);
          } else if (resultVal === 'draw') {
            return m.scoreA === m.scoreB;
          } else if (resultVal === 'lost') {
            return (m.teamA === teamVal && m.scoreA < m.scoreB) || (m.teamB === teamVal && m.scoreB < m.scoreA);
          }
          return true;
        });
      }
      // Date filter
      const dateFrom = document.getElementById('filter-date-from')?.value;
      const dateTo = document.getElementById('filter-date-to')?.value;
      if (dateFrom) {
        filtered = filtered.filter(m => m.date && m.date >= dateFrom);
      }
      if (dateTo) {
        filtered = filtered.filter(m => m.date && m.date <= dateTo);
      }

      // Desktop: tabla
      const tbody = document.querySelector('.calendar-table tbody');
      if (tbody) {
        tbody.innerHTML = '';
        const ballIcon = `<span class='winner-icon' title='Ganador' style='margin-left:6px;vertical-align:middle;'>⚽</span>`;
        filtered.forEach(match => {
          const teamA = teams[match.teamA];
          const teamB = teams[match.teamB];
          const scoreA = match.scoreA;
          const scoreB = match.scoreB;
          const score = (typeof scoreA === 'number' && typeof scoreB === 'number') ? `${scoreA}–${scoreB}` : '—';
          let iconA = '', iconB = '';
          if (typeof scoreA === 'number' && typeof scoreB === 'number') {
            if (scoreA > scoreB) iconA = ballIcon;
            else if (scoreB > scoreA) iconB = ballIcon;
          }
          tbody.innerHTML += `
            <tr data-home="${teamA.name}" data-away="${teamB.name}" data-score="${score}">
              <td>${formatDate(match.date)}</td>
              <td>${match.time || ''}</td>
              <td class="versus">
                <span class="team">
                  <img src="${teamA.logo}" alt="${teamA.name}" class="logo"> <b>${teamA.name}${iconA}</b>
                </span>
                <span class="vs">VS</span>
                <span class="team">
                  <img src="${teamB.logo}" alt="${teamB.name}" class="logo"> <b>${teamB.name}${iconB}</b>
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
        const ballIcon = `<span class='winner-icon' title='Ganador' style='margin-left:6px;vertical-align:middle;'>⚽</span>`;
        filtered.forEach(match => {
          const teamA = teams[match.teamA];
          const teamB = teams[match.teamB];
          const scoreA = match.scoreA;
          const scoreB = match.scoreB;
          const score = (typeof scoreA === 'number' && typeof scoreB === 'number') ? `${scoreA}–${scoreB}` : '—';
          let iconA = '', iconB = '';
          if (typeof scoreA === 'number' && typeof scoreB === 'number') {
            if (scoreA > scoreB) iconA = ballIcon;
            else if (scoreB > scoreA) iconB = ballIcon;
          }
          cards.innerHTML += `
            <article class="match-card" data-home="${teamA.name}" data-away="${teamB.name}" data-score="${score}">
              <div class="match-meta">
                <span class="date">${formatDate(match.date)}</span> · <span class="time">${match.time || ''}</span>
              </div>
              <div class="match-versus">
                <span class="team">
                  <img src="${teamA.logo}" alt="${teamA.name}" class="logo">
                  <b class="name">${teamA.name}${iconA}</b>
                </span>
                <span class="vs">VS</span>
                <span class="team">
                  <img src="${teamB.logo}" alt="${teamB.name}" class="logo">
                  <b class="name">${teamB.name}${iconB}</b>
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
    }

    // Eventos de filtros
    ['filter-team','filter-state','filter-stadium','filter-result','filter-date-from','filter-date-to'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', renderFiltered);
    });

    // Render inicial
    renderFiltered();
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
