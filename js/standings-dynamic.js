// js/standings-dynamic.js
// Genera la tabla de posiciones y cards de forma dinámica

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
    fetch('data/matches.json').then(r => r.json()),
    fetch('data/teams.json').then(r => r.json())
  ]).then(([matchesData, teamsData]) => {
    const teams = {};
    teamsData.teams.forEach(t => {
      teams[t.id] = {
        id: t.id,
        name: t.name,
        logo: t.logo,
        stats: {
          played: 0, won: 0, draw: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, points: 0
        }
      };
    });
    // Calcular estadísticas a partir de los partidos
    matchesData.matches.forEach(match => {
      const teamA = teams[match.teamA];
      const teamB = teams[match.teamB];
      if (!teamA || !teamB) return;
      // Solo contar partidos con resultado
      if (typeof match.scoreA === 'number' && typeof match.scoreB === 'number') {
        teamA.stats.played++;
        teamB.stats.played++;
        teamA.stats.goalsFor += match.scoreA;
        teamA.stats.goalsAgainst += match.scoreB;
        teamB.stats.goalsFor += match.scoreB;
        teamB.stats.goalsAgainst += match.scoreA;
        if (match.scoreA > match.scoreB) {
          teamA.stats.won++;
          teamB.stats.lost++;
          teamA.stats.points += 3;
        } else if (match.scoreA < match.scoreB) {
          teamB.stats.won++;
          teamA.stats.lost++;
          teamB.stats.points += 3;
        } else {
          teamA.stats.draw++;
          teamB.stats.draw++;
          teamA.stats.points += 1;
          teamB.stats.points += 1;
        }
      }
    });
    // Generar array ordenado por puntos, diferencia de goles, goles a favor
    const standings = Object.values(teams).sort((a, b) => {
      if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
      const dgA = a.stats.goalsFor - a.stats.goalsAgainst;
      const dgB = b.stats.goalsFor - b.stats.goalsAgainst;
      if (dgB !== dgA) return dgB - dgA;
      return b.stats.goalsFor - a.stats.goalsFor;
    });
    // Desktop: tabla
    const tbody = document.querySelector('.standings-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      standings.forEach((team, idx) => {
        tbody.innerHTML += `
          <tr${idx === 0 ? ' class="is-leader"' : idx >= standings.length-2 ? ' class="is-bottom"' : ''}>
            <td>${idx+1}</td>
            <td class="t"><img src="${team.logo}" alt="${team.name}" class="logo sm"> ${team.name}</td>
            <td>${team.stats.played}</td><td>${team.stats.won}</td><td>${team.stats.draw}</td><td>${team.stats.lost}</td>
            <td>${team.stats.goalsFor}</td><td>${team.stats.goalsAgainst}</td><td>${team.stats.goalsFor-team.stats.goalsAgainst >= 0 ? '+' : ''}${team.stats.goalsFor-team.stats.goalsAgainst}</td><td>${team.stats.points}</td>
          </tr>
        `;
      });
    }
    // Mobile: cards
    const cards = document.querySelector('.standings-cards');
    if (cards) {
      cards.innerHTML = '';
      standings.forEach((team, idx) => {
        cards.innerHTML += `
          <li class="standing-card${idx === 0 ? ' is-leader' : idx >= standings.length-2 ? ' is-bottom' : ''}">
            <span class="rank">${idx+1}</span>
            <img src="${team.logo}" class="logo sm" alt="${team.name}">
            <span class="name">${team.name}</span>
            <span class="pts chip">${team.stats.points} pts</span>
            <div class="statline">
              <span>PJ ${team.stats.played}</span><span>PG ${team.stats.won}</span><span>PE ${team.stats.draw}</span><span>PP ${team.stats.lost}</span>
              <span>GF ${team.stats.goalsFor}</span><span>GC ${team.stats.goalsAgainst}</span><span>DG ${team.stats.goalsFor-team.stats.goalsAgainst >= 0 ? '+' : ''}${team.stats.goalsFor-team.stats.goalsAgainst}</span>
            </div>
          </li>
        `;
      });
    }
  });
});
