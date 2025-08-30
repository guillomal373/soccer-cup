// js/teams.js
// Carga y muestra los equipos en la página principal

document.addEventListener('DOMContentLoaded', function() {
  fetch('data/teams.json')
    .then(response => response.json())
    .then(data => {
      mostrarEquipos(data.teams);
    });
});

function mostrarEquipos(equipos) {
  const container = document.getElementById('teams-container');
  if (!container) return;
  container.innerHTML = '';
  equipos.forEach(equipo => {
    const card = document.createElement('a');
    card.className = 'team-card';
  card.href = `team.html?team=${equipo.id}`;
    card.setAttribute('aria-label', equipo.name);
    card.innerHTML = `
      <div class="badge">
        <img src="${equipo.logo}" alt="${equipo.name} logo">
      </div>
      <div class="team-meta">
        <h3 class="team-name">${equipo.name}</h3>
        <span class="team-colors">
          <i style="background:${equipo.colors && equipo.colors[0] ? equipo.colors[0] : '#165b3a'}"></i>
          <i style="background:${equipo.colors && equipo.colors[1] ? equipo.colors[1] : '#21a36c'}"></i>
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}
