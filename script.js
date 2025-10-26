
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      e.preventDefault();
      document.querySelector(id).scrollIntoView({behavior:'smooth'});
    }
  });
});

// Countdown (Buenos Aires time)
(function(){
  const target = new Date(EVENT_ISO).getTime();
  const d = document.getElementById('d');
  const h = document.getElementById('h');
  const m = document.getElementById('m');
  const s = document.getElementById('s');
  function tick(){
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days * (1000*60*60*24);
    const hours = Math.floor(diff / (1000*60*60));
    diff -= hours * (1000*60*60);
    const mins = Math.floor(diff / (1000*60));
    diff -= mins * (1000*60);
    const secs = Math.floor(diff / 1000);
    d.textContent = days;
    h.textContent = String(hours).padStart(2,'0');
    m.textContent = String(mins).padStart(2,'0');
    s.textContent = String(secs).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
})();

// RSVP form handling
// To store in Google Sheets, create an Apps Script Web App endpoint and paste its URL below
const SUBMIT_URL = ""; // e.g., "https://script.google.com/macros/s/AKfycbx.../exec"

const form = document.getElementById('rsvpForm');
const msg = document.getElementById('formMsg');

function toCSVRow(obj){
  // order: timestamp, nombre, asiste, restriccion, cancion
  const row = [
    new Date().toISOString(),
    (obj.nombre||'').replace(/,/g,' '),
    (obj.asiste||'').replace(/,/g,' '),
    (obj.restriccion||'').replace(/,/g,' '),
    (obj.cancion||'').replace(/,/g,' ')
  ];
  return row.join(',') + '\n';
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  msg.textContent = 'Enviando...';

  try {
    if (SUBMIT_URL){
      const resp = await fetch(SUBMIT_URL, {
        method:'POST',
        mode:'no-cors',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      msg.textContent = '¡Listo! Gracias por confirmar.';
      form.reset();
    } else {
      // Fallback: download CSV locally (para usar en GitHub Pages sin backend)
      const csvHeader = 'timestamp,nombre,asiste,restriccion,cancion\n';
      let csv = localStorage.getItem('ambar_rsvp_csv') || csvHeader;
      csv += toCSVRow(data);
      localStorage.setItem('ambar_rsvp_csv', csv);
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rsvps_ambar.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      msg.textContent = '¡Listo! Se descargó un CSV con tu respuesta.';
      form.reset();
    }
  } catch (err){
    console.error(err);
    msg.textContent = 'Ups, hubo un problema. Probá de nuevo en unos segundos.';
  }
});
