const aliases={voz:'practica-1',logro:'practica-2',pista:'practica-3',aula:'practica-4'};
function routeLegacy(){const h=location.hash.slice(1);if(h==='proceso')location.replace('/alba-portafolio-respaldo/proceso/');else if(/^recurso-practica-[1-4]$/.test(h))location.replace('/alba-portafolio-respaldo/'+h.slice(8)+'/');else if(/^(practicas|practica-[1-4])$/.test(h)||aliases[h])location.replace('/alba-portafolio-respaldo/actividades/#'+(aliases[h]||h));}
addEventListener('hashchange',routeLegacy);routeLegacy();
