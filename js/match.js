// js/match.js
// Renderiza un partido en match.html según ?match=mID usando data/matches.json y data/teams.json

(function(){
  const qs = new URLSearchParams(location.search);
  const matchId = qs.get('match');

  // Carga datos en paralelo
  Promise.all([
    fetch('data/matches.json').then(r=>r.json()),
    fetch('data/teams.json').then(r=>r.json())
  ]).then(([mData, tData]) => {
    const match = (mData.matches||[]).find(m => m.id === (matchId||m?.id));
    if(!match){
      document.getElementById('timeline')?.insertAdjacentHTML('beforebegin', '<p>No se encontró el partido.</p>');
      return;
    }

    // Mapa rápido de equipos y jugadores
    const teamsById = Object.fromEntries((tData.teams||[]).map(t=>[t.id, t]));
    function teamName(id){ return teamsById[id]?.name || (id? id[0].toUpperCase()+id.slice(1): '-'); }
    function playerName(teamId, playerId){
      const team = teamsById[teamId];
      if(!team) return playerId||'-';
      const p = (team.players||[]).find(x=>x.id===playerId);
      return p?.name || playerId || '-';
    }

    // Banner
    const bannerImg = document.querySelector('.match-banner img');
    if(bannerImg){
      bannerImg.src = `img/matches/${match.id}/01.jpg`;
      bannerImg.alt = `${teamName(match.teamA)} vs ${teamName(match.teamB)}`;
      bannerImg.onerror = ()=>{ bannerImg.src = 'img/torneo.png'; };
    }

    // Chips info
    const info = document.getElementById('match-info');
    if(info){
      const dt = match.date || ''; const tm = match.time || '';
      const statusLabel = match.status==='played' ? 'Finalizado' : (match.status==='scheduled'?'Programado':match.status||'');
      info.innerHTML = `
        <span class="chip"><time datetime="${match.date||''}">${dt}</time></span>
        <span class="chip">${tm}</span>
        <span class="chip">${match.stadium||''}</span>
        <span class="chip ${match.status==='played'?'done':''}">${statusLabel}</span>
      `;
    }

    // Equipos y marcador
    const home = match.home?.id || match.teamA; const away = match.away?.id || match.teamB;
    const hScore = (match.home?.score ?? match.scoreA);
    const aScore = (match.away?.score ?? match.scoreB);
    const h = document.querySelector('.team.home');
    const a = document.querySelector('.team.away');
    const sH = document.querySelector('.score .h');
    const sA = document.querySelector('.score .a');
    if(h){
      h.querySelector('.crest img').src = `img/${home}/logo.png`;
      h.querySelector('.crest img').alt = teamName(home);
      h.querySelector('.t-name').textContent = teamName(home);
    }
    if(a){
      a.querySelector('.crest img').src = `img/${away}/logo.png`;
      a.querySelector('.crest img').alt = teamName(away);
      a.querySelector('.t-name').textContent = teamName(away);
    }
    if(sH) sH.textContent = Number.isFinite(hScore)? hScore : '-';
    if(sA) sA.textContent = Number.isFinite(aScore)? aScore : '-';

    // Resaltar ganador/empate
    const th = h?.querySelector('.t-name');
    const ta = a?.querySelector('.t-name');
    if(Number.isFinite(hScore) && Number.isFinite(aScore)){
      if(hScore>aScore) th?.classList.add('winner');
      else if(aScore>hScore) ta?.classList.add('winner');
      else { th?.classList.add('draw'); ta?.classList.add('draw'); }
    }

    // Cronología
    const tl = document.getElementById('timeline');
    if(tl){
      const ev = (match.events||[]).slice().sort((x,y)=>x.minute-y.minute);
      tl.innerHTML = ev.map(e=>{
        const klass = e.type === 'goal' ? 'goal' : (e.type==='yc' ? 'yc' : (e.type==='rc' ? 'rc' : ''));
        const team = e.teamId || (e.team==='home'?home:away) || '';
        const who = playerName(team, e.playerId);
        const tname = teamName(team);
        const label = e.type==='goal' ? 'Gol' : (e.type==='yc'?'Amarilla': e.type==='rc'?'Roja':'Evento');
        return `
          <div class="t-row">
            <span class="minute">${e.minute}'</span>
            <div class="t-card ${klass}">${label} de ${who} (${tname})</div>
          </div>`;
      }).join('');
    }

    // Resumen de tarjetas por equipo
    const cardsBox = document.getElementById('cards-summary');
    if(cardsBox){
      const base = {yc:0, rc:0};
      const agg = {[home]: {...base}, [away]: {...base}};
      (match.events||[]).forEach(e=>{
        if(e.type==='yc' || e.type==='rc'){
          const team = e.teamId || (e.team==='home'?home:away);
          if(!agg[team]) agg[team] = {...base};
          agg[team][e.type]++;
        }
      });
      function cardItem(id){
        const t = agg[id]||base;
        return `
          <article class="cards-item">
            <div class="cards-head">
              <span class="crest sm"><img src="img/${id}/logo.png" alt="${teamName(id)}" /></span>
              <strong class="team-name">${teamName(id)}</strong>
            </div>
            <div class="cards-stats">
              <span class="stat"><i class="rect yc"></i> ${t.yc} Amarilla${t.yc===1?'':'s'}</span>
              <span class="stat"><i class="rect rc"></i> ${t.rc} Roja${t.rc===1?'':'s'}</span>
            </div>
          </article>`;
      }
      cardsBox.innerHTML = cardItem(home) + cardItem(away);
    }
  }).catch(err=>{
    console.error('Error cargando partido:', err);
  });
})();
