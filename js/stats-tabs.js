// js/stats-tabs.js
// Tabs Estadísticas

document.querySelectorAll('.stats-tabs .tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // activar botón
    document.querySelectorAll('.stats-tabs .tab').forEach(b=>b.classList.remove('is-active'));
    btn.classList.add('is-active');
    // activar panel
    const id = btn.dataset.tab;
    document.querySelectorAll('.stats-panel').forEach(p=>{ p.hidden = true; p.classList.remove('is-active'); });
    const panel = document.getElementById('panel-'+id);
    if(panel){ panel.hidden = false; panel.classList.add('is-active'); }
  });
});
