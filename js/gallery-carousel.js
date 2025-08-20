// js/gallery-carousel.js
// Carrusel Galería (botones)
document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  const track = carousel.querySelector('.c-track');
  carousel.querySelector('.prev').addEventListener('click', ()=> track.scrollBy({left:-360, behavior:'smooth'}));
  carousel.querySelector('.next').addEventListener('click', ()=> track.scrollBy({left: 360, behavior:'smooth'}));
});
