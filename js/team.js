// js/team.js
// Muestra la información dinámica de un equipo en team.html

document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const teamId = params.get('team');
  if (!teamId) return;

  // Ajustar links del nav para conservar ?team=ID al navegar por secciones
  try {
    document.querySelectorAll('.nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      // Solo reescribir los que apuntan a team.html (secciones internas)
      if (href.startsWith('team.html#')) {
        const hash = href.substring(href.indexOf('#')) || '';
        a.setAttribute('href', `team.html?team=${encodeURIComponent(teamId)}${hash}`);
      }
    });
  } catch (_) { /* noop */ }

  fetch('data/teams.json')
    .then(response => response.json())
    .then(data => {
      const equipo = data.teams.find(t => t.id === teamId);
      if (!equipo) {
        document.getElementById('team-content').innerHTML = '<p>Equipo no encontrado.</p>';
        return;
      }
      mostrarEquipo(equipo);
    });
});

function mostrarEquipo(equipo) {
  // Roster: render players from data/teams.json -> teams[].players
  const roster = document.querySelector('.roster-grid');
  if (roster && Array.isArray(equipo.players)) {
    const folder = equipo.id; // image folder matches team id
    const cards = equipo.players.map((p, idx) => {
      const jersey = typeof p.number === 'number' ? p.number : (parseInt(String(p.id).replace(/[^0-9]/g, ''), 10) || idx + 1);
      const name = p.name || '-';
      const docId = p.numId || p.docId || '';
      const pos = p.position || '';
      const img = `img/${folder}/${p.id}.png`;
      return `
        <article class="player-card">
          <img src="${img}" alt="${name}" class="player-photo" onerror="this.src='img/${folder}/p01.png'">
          <div class="p-meta">
            <div class="p-row">
              <span class="p-number">${jersey}</span>
              <div class="p-info">
                <h3 class="p-name">${name}</h3>
                <span class="p-docid">ID: ${docId}</span>
              </div>
            </div>
            <span class="p-pos chip">${pos}</span>
          </div>
        </article>`;
    }).join('');
    roster.innerHTML = cards;
  }

  // Render matches dynamically
  fetch('data/matches.json')
    .then(response => response.json())
    .then(matchesData => {
      const matches = matchesData.matches.filter(m => m.teamA === equipo.id || m.teamB === equipo.id);
      const played = matches.filter(m => typeof m.scoreA === 'number' && typeof m.scoreB === 'number');
      const upcoming = matches.filter(m => typeof m.scoreA !== 'number' || typeof m.scoreB !== 'number');
      // Render played matches
      const playedContainer = document.getElementById('team-matches-played');
      if (playedContainer) {
        const ballIcon = `<span class='winner-icon' title='Ganador' style='margin-left:6px;vertical-align:middle;'>⚽</span>`;
        playedContainer.innerHTML = played.map(match => {
          const isHome = match.teamA === equipo.id;
          const teamA = match.teamA;
          const teamB = match.teamB;
          const logoA = equipo.id === teamA ? equipo.logo : `img/${teamA}/logo.png`;
          const logoB = equipo.id === teamB ? equipo.logo : `img/${teamB}/logo.png`;
          const nameA = equipo.id === teamA ? equipo.name : teamA.charAt(0).toUpperCase() + teamA.slice(1);
          const nameB = equipo.id === teamB ? equipo.name : teamB.charAt(0).toUpperCase() + teamB.slice(1);
          // Winner/draw highlight
          let winnerA = '', winnerB = '', draw = '', iconA = '', iconB = '';
          if (match.scoreA > match.scoreB) { winnerA = 'winner'; iconA = ballIcon; }
          else if (match.scoreA < match.scoreB) { winnerB = 'winner'; iconB = ballIcon; }
          else { draw = 'draw'; }
          return `
            <article class="match-row played" data-score="${match.scoreA}-${match.scoreB}">
              <div class="m-meta">${match.date || ''} · ${match.time || ''} · ${match.stadium || ''}</div>
              <div class="m-vs">
                <span class="team"><img src="${logoA}" alt="${nameA}"> <b class="name ${winnerA} ${draw}">${nameA}${iconA}</b></span>
                <span class="vs">VS</span>
                <span class="team"><img src="${logoB}" alt="${nameB}"> <b class="name ${winnerB} ${draw}">${nameB}${iconB}</b></span>
                <span class="score chip">${match.scoreA}–${match.scoreB}</span>
              </div>
            </article>
          `;
        }).join('');
      }
      // Render upcoming matches
      const upcomingContainer = document.getElementById('team-matches-upcoming');
      if (upcomingContainer) {
        upcomingContainer.innerHTML = upcoming.map(match => {
          const teamA = match.teamA;
          const teamB = match.teamB;
          const logoA = equipo.id === teamA ? equipo.logo : `img/${teamA}/logo.png`;
          const logoB = equipo.id === teamB ? equipo.logo : `img/${teamB}/logo.png`;
          const nameA = equipo.id === teamA ? equipo.name : teamA.charAt(0).toUpperCase() + teamA.slice(1);
          const nameB = equipo.id === teamB ? equipo.name : teamB.charAt(0).toUpperCase() + teamB.slice(1);
          return `
            <article class="match-row">
              <div class="m-meta">${match.date || ''} · ${match.time || ''} · ${match.stadium || ''}</div>
              <div class="m-vs">
                <span class="team"><img src="${logoA}" alt="${nameA}"> <b class="name">${nameA}</b></span>
                <span class="vs">VS</span>
                <span class="team"><img src="${logoB}" alt="${nameB}"> <b class="name">${nameB}</b></span>
                <span class="score chip pending">—</span>
              </div>
            </article>
          `;
        }).join('');
      }
      // Compute and render Top 8 scorers for this team
      try {
        const goalsByPlayer = {};
        played.forEach(match => {
          (match.events || []).forEach(ev => {
            if (ev && ev.type === 'goal' && ev.teamId === equipo.id && ev.playerId) {
              goalsByPlayer[ev.playerId] = (goalsByPlayer[ev.playerId] || 0) + 1;
            }
          });
        });

        const scorers = Object.entries(goalsByPlayer).map(([pid, goals]) => {
          const meta = (equipo.players || []).find(p => p.id === pid) || {};
          return {
            id: pid,
            goals,
            name: meta.name || pid,
            pos: meta.position || '',
            img: `img/${equipo.id}/${pid}.png`
          };
        }).sort((a,b) => b.goals - a.goals).slice(0,8);

        const section = document.getElementById('team-scorers');
        const header = document.getElementById('goals');
        const top = document.getElementById('scorers-top');
        const list = document.getElementById('scorers-list');
        const empty = document.getElementById('scorers-empty');

        if (!section || !top || !list) return;
        if (!scorers.length) {
          // Sin goles: oculta la sección y el encabezado
          if (section) section.hidden = true;
          if (header) header.style.display = 'none';
          return;
        }

        // Hay datos: mostrar la sección
        section.hidden = false;
        if (header) header.style.display = '';
        if (empty) empty.hidden = true;

        const top3 = scorers.slice(0,3).map((s, i) => `
          <div class="s-top rank-${i+1}">
            <div class="avatar">
              <img src="${s.img}" alt="${s.name}" onerror="this.src='img/${equipo.id}/p01.png'">
              <span class="badge">${s.goals}</span>
            </div>
            <div class="name">${s.name}</div>
            <div class="sub">${s.pos}</div>
          </div>
        `).join('');
        top.innerHTML = top3;

        const rest = scorers.slice(3).map((s, i) => `
          <li>
            <span class="num">${i+4}</span>
            <span class="who">
              <img class="mini" src="${s.img}" alt="${s.name}" onerror="this.src='img/${equipo.id}/p01.png'"> ${s.name}
              <span class="pos">${s.pos ? '· ' + s.pos : ''}</span>
            </span>
            <span class="g">${s.goals}</span>
          </li>
        `).join('');
        list.innerHTML = rest;
      } catch (_) {
        // si algo falla, ocultar el bloque
        const section = document.getElementById('team-scorers');
        const header = document.getElementById('goals');
        if (section) section.hidden = true;
        if (header) header.style.display = 'none';
      }
    });
  // Render hero section: logo, name, position, tags
  // Logo
  const heroLogo = document.getElementById('team-hero-logo');
  if (heroLogo) {
    heroLogo.innerHTML = `<img src="${equipo.logo}" alt="${equipo.name} logo">`;
  }
  // Name
  const heroName = document.getElementById('team-hero-name');
  if (heroName) {
    heroName.textContent = equipo.name;
  }
  // Team photo under hero: folder depends on team id
  const heroPhoto = document.querySelector('.team-photo img');
  if (heroPhoto) {
    heroPhoto.src = `img/${equipo.id}/equipo.jpg`;
    heroPhoto.alt = `Plantel completo de ${equipo.name}`;
  }
  // Tags (city, founded, stadium)
  const heroTags = document.getElementById('team-hero-tags');
  if (heroTags) {
    heroTags.innerHTML = `
      <span class="chip">${equipo.city || '—'}</span>
      <span class="chip">Fundado ${equipo.founded || '—'}</span>
      <span class="chip">${equipo.stadium || '—'}</span>
    `;
  }
  // Position (calculated from standings)
  const heroPosition = document.getElementById('team-hero-position');
  if (heroPosition) {
    fetch('data/matches.json')
      .then(response => response.json())
      .then(matchesData => {
        // Calculate standings
        const standings = {};
        matchesData.matches.forEach(match => {
          [match.teamA, match.teamB].forEach(teamId => {
            if (!standings[teamId]) standings[teamId] = { points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
          });
          if (typeof match.scoreA === 'number' && typeof match.scoreB === 'number') {
            standings[match.teamA].played++;
            standings[match.teamB].played++;
            standings[match.teamA].goalsFor += match.scoreA;
            standings[match.teamA].goalsAgainst += match.scoreB;
            standings[match.teamB].goalsFor += match.scoreB;
            standings[match.teamB].goalsAgainst += match.scoreA;
            if (match.scoreA > match.scoreB) {
              standings[match.teamA].won++;
              standings[match.teamA].points += 3;
              standings[match.teamB].lost++;
            } else if (match.scoreA < match.scoreB) {
              standings[match.teamB].won++;
              standings[match.teamB].points += 3;
              standings[match.teamA].lost++;
            } else {
              standings[match.teamA].draw++;
              standings[match.teamB].draw++;
              standings[match.teamA].points += 1;
              standings[match.teamB].points += 1;
            }
          }
        });
        // Sort teams by points, then goal difference, then goals for
        const sorted = Object.entries(standings).sort((a, b) => {
          if (b[1].points !== a[1].points) return b[1].points - a[1].points;
          const gdA = a[1].goalsFor - a[1].goalsAgainst;
          const gdB = b[1].goalsFor - b[1].goalsAgainst;
          if (gdB !== gdA) return gdB - gdA;
          return b[1].goalsFor - a[1].goalsFor;
        });
        const pos = sorted.findIndex(([id]) => id === equipo.id);
        heroPosition.textContent = pos >= 0 ? `Posición: ${pos + 1}°` : '';
      });
  }
  const container = document.getElementById('team-content');
  if (!container) return;
  // Render team info dynamically
  const infoCards = document.getElementById('team-info-cards');
  if (infoCards) {
    infoCards.innerHTML = `
      <article class="card">
        <h3>Ciudad</h3>
        <p>${equipo.city || '—'}</p>
      </article>
      <article class="card">
        <h3>Fundado</h3>
        <p>${equipo.founded || '—'}</p>
      </article>
      <article class="card">
        <h3>Estadio</h3>
        <p>${equipo.stadium || '—'}</p>
      </article>
      <article class="card">
        <h3>Colores</h3>
        <p>
          ${(equipo.colors || []).map(c => `<span class='dot' style='--c:${c}'></span>`).join('')}
        </p>
      </article>
    `;
  }
}
