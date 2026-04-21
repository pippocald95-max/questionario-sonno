// CONFIGURAZIONE
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwt6GmnrVZlMZ9fMH-kVUMmdzWxT9rHzZMqrGi3iqIRp71Ua0pGZjMkU2TDwlBX5utyjQ/exec';

// GESTIONE CONDIZIONALI
const chkInizio = document.getElementById('chk_inizio');
const condInizio = document.getElementById('cond_inizio');
if (chkInizio) {
  chkInizio.addEventListener('change', function () {
    condInizio.classList.toggle('hidden', !this.checked);
  });
}

const chkRisvegli = document.getElementById('chk_risvegli');
const condRisvegli = document.getElementById('cond_risvegli');
if (chkRisvegli) {
  chkRisvegli.addEventListener('change', function () {
    condRisvegli.classList.toggle('hidden', !this.checked);
  });
}

const selTurni = document.getElementById('lavoro_turni');
const inpTurni = document.getElementById('lavoro_turni_spec');
if (selTurni) {
  selTurni.addEventListener('change', function () {
    inpTurni.classList.toggle('hidden', this.value !== 'Si');
  });
}

// INVIO FORM
document.getElementById('questionarioForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerText = 'Invio in corso...';

  // Raccolta dati dal form
  const formData = new FormData(this);
  const data = {};

  formData.forEach((val, key) => {
    if (data[key]) {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(val);
    } else {
      data[key] = val;
    }
  });

  // Appiattisci array in stringhe
  Object.keys(data).forEach(k => {
    if (Array.isArray(data[k])) data[k] = data[k].join(', ');
  });

  // Invio con fetch POST (no-cors necessario per Google Apps Script)
  // IMPORTANTE: usare 'text/plain' come Content-Type per evitare
  // il CORS preflight OPTIONS che Google Apps Script non supporta.
  // Con 'application/json' il browser invia prima una richiesta OPTIONS
  // che GAS non gestisce, causando il 405 Not Allowed.
  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' }, // ← chiave: evita il preflight
    body: JSON.stringify(data)
  })
    .then(() => {
      document.getElementById('questionarioForm').style.display = 'none';
      document.getElementById('successView').classList.remove('hidden');
      window.scrollTo(0, 0);
    })
    .catch(() => {
      btn.disabled = false;
      btn.innerText = 'INVIA QUESTIONARIO';
      alert("Errore durante l'invio. Controlla la connessione e riprova.");
    });
});
