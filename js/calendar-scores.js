// js/calendar-scores.js
(function(){
  // Table (desktop)
  document.querySelectorAll('.calendar-table tbody tr').forEach(row=>{
    const score = row.getAttribute('data-score');
    if(!score) return;
    row.classList.add('played');
    const [h,a] = score.split('-').map(n=>parseInt(n,10));
    const homeEl = row.querySelector('.versus .team:first-child b');
    const awayEl = row.querySelector('.versus .team:last-child  b');
    if(Number.isFinite(h) && Number.isFinite(a)){
      if(h>a) homeEl.classList.add('winner');
      else if(a>h) awayEl.classList.add('winner');
      else { homeEl.classList.add('draw'); awayEl.classList.add('draw'); }
    }
  });

  // Cards (mobile)
  document.querySelectorAll('.match-card').forEach(card=>{
    const score = card.getAttribute('data-score');
    if(!score) return;
    card.classList.add('played');
    const [h,a] = score.split('-').map(n=>parseInt(n,10));
    const homeEl = card.querySelector('.match-versus .team:first-child .name');
    const awayEl = card.querySelector('.match-versus .team:last-child  .name');
    if(Number.isFinite(h) && Number.isFinite(a)){
      if(h>a) homeEl.classList.add('winner');
      else if(a>h) awayEl.classList.add('winner');
      else { homeEl.classList.add('draw'); awayEl.classList.add('draw'); }
    }
  });
})();
