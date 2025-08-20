// js/summary.js
// Actualiza el resumen de equipos y partidos de forma dinámica

document.addEventListener('DOMContentLoaded', function() {
  // Equipos
  fetch('data/teams.json')
    .then(response => response.json())
    .then(data => {
      if (data.teams) {
        document.getElementById('teams-count').textContent = data.teams.length;
      }
    });

  // Partidos
  fetch('data/matches.json')
    .then(response => response.json())
    .then(data => {
      if (data.matches) {
        document.getElementById('matches-count').textContent = data.matches.length;
      }
    });

  // Meses
  fetch('data/tournament.json')
    .then(response => response.json())
    .then(data => {
      if (data.start && data.end) {
        const start = new Date(data.start);
        const end = new Date(data.end);
        let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        // Si hay días en el mes final, cuenta como un mes más
        if (end.getDate() >= start.getDate()) months++;
        document.getElementById('month-count').textContent = months;
      }
    });
});
