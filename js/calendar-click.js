// js/calendar-click.js
// Navegación al detalle del partido desde el calendario (delegación de eventos)

document.addEventListener('DOMContentLoaded', function () {
  const tbody = document.querySelector('.calendar-table tbody');
  if (tbody) {
    tbody.style.cursor = 'pointer';
    tbody.addEventListener('click', function (ev) {
      const tr = ev.target && ev.target.closest && ev.target.closest('tr[data-match-id]');
      if (!tr) return;
      const id = tr.getAttribute('data-match-id');
      if (id) window.location.href = `match.html?match=${id}`;
    });
  }

  const cards = document.querySelector('.calendar-cards');
  if (cards) {
    cards.addEventListener('click', function (ev) {
      const card = ev.target && ev.target.closest && ev.target.closest('.match-card[data-match-id]');
      if (!card) return;
      const id = card.getAttribute('data-match-id');
      if (id) window.location.href = `match.html?match=${id}`;
    });
  }
});

