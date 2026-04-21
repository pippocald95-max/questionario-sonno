// CONFIGURAZIONE
// ✅ L'URL del backend intermedio (nessun segreto esposto nel browser)
// Sostituisci con il tuo endpoint reale una volta creato il backend
const BACKEND_URL = 'https://api.cosimosgobba.it/questionario';

// ─── GESTIONE CONDIZIONALI ────────────────────────────────────────────────────

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

// ─── INVIO FORM ───────────────────────────────────────────────────────────────

document.getElementById('questionarioForm').addEventListener('submit', async function (e) {
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

  // ✅ Invio al backend intermedio con application/json
  // Il backend (Vercel/Cloudflare) si occuperà di chiamare Apps Script
  // in modo sicuro lato server, senza esporre l'URL al browser.
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Errore dal server: ' + response.status);
    }

    // ✅ Il successo viene mostrato SOLO se il backend conferma la ricezione
    document.getElementById('questionarioForm').style.display = 'none';
    document.getElementById('successView').classList.remove('hidden');
    window.scrollTo(0, 0);

  } catch (err) {
    console.error('Errore invio:', err);
    btn.disabled = false;
    btn.innerText = 'INVIA QUESTIONARIO';
    alert("Errore durante l'invio. Controlla la connessione e riprova.");
  }
});
