// ==========================================
// CONFIGURAZIONE
// ==========================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4WawSIJPfs47Tuyp2IoBEw8vpXn0ldZjsU09s3k6D2ggCNjqrQstJ0Atvt6xi7Vf5JQ/exec';
const DIARY_URL = 'https://diario.cosimosgobba.it/';


// ==========================================
// CLIENT ID
// Genera un codice univoco che collega questo questionario
// alle compilazioni future del Diario del Sonno dello stesso cliente.
// ==========================================
function generateClientId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // esclude caratteri ambigui (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'SN-' + code;
}

const clientIdInput = document.getElementById('client_id');
const clientId = generateClientId();
if (clientIdInput) clientIdInput.value = clientId;


// ==========================================
// HELPERS
// ==========================================
function toggleHidden(el, shouldHide) {
  if (!el) return;
  el.classList.toggle('hidden', shouldHide);
}


// ==========================================
// GESTIONE CONDIZIONALI
// ==========================================
const chkInizio = document.getElementById('chk_inizio');
const condInizio = document.getElementById('cond_inizio');

if (chkInizio && condInizio) {
  chkInizio.addEventListener('change', function () {
    toggleHidden(condInizio, !this.checked);
  });
}

const chkRisvegli = document.getElementById('chk_risvegli');
const condRisvegli = document.getElementById('cond_risvegli');

if (chkRisvegli && condRisvegli) {
  chkRisvegli.addEventListener('change', function () {
    toggleHidden(condRisvegli, !this.checked);
  });
}

const selTurni = document.getElementById('lavoro_turni');
const inpTurni = document.getElementById('lavoro_turni_spec');

if (selTurni && inpTurni) {
  selTurni.addEventListener('change', function () {
    toggleHidden(inpTurni, this.value !== 'Si');
  });
}


// ==========================================
// INVIO FORM
// ==========================================
const form = document.getElementById('questionarioForm');
const submitBtn = document.getElementById('submitBtn');
const successView = document.getElementById('successView');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!submitBtn) return;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Invio in corso...';

    try {
      const formData = new FormData(form);
      const data = {};

      formData.forEach((val, key) => {
        if (data[key] !== undefined) {
          if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
          }
          data[key].push(val);
        } else {
          data[key] = val;
        }
      });

      // Appiattisce gli array multipli in stringa
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          data[key] = data[key].join(', ');
        }
      });

      // [PATCH 2026-11-14] niente piu' mode: 'no-cors': la pagina legge la risposta e
      // mostra "Grazie" solo se il backend conferma il salvataggio. Con Content-Type
      // text/plain la richiesta resta "semplice" (nessun preflight) e Apps Script
      // risponde con Access-Control-Allow-Origin: *, quindi la risposta e' leggibile.
      // Contratto col backend (doPost): JSON {"ok":true} se salvato, {"ok":false} se no.
      // Il vecchio testo 'ok' e' accettato per compatibilita' finche' il backend non e'
      // aggiornato. Se la risposta non arriva (rete, errore Google) NON si reinvia in
      // automatico: l'invio potrebbe essere gia' nel foglio "grezzi" e si creerebbero
      // doppioni; si chiede invece alla persona di scriverci.
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data),
      })
        .then((res) => res.text())
        .then((text) => {
          let ok = false;
          try { ok = JSON.parse(text).ok === true; } catch (_) { ok = text.trim() === 'ok'; }
          if (!ok) throw new Error('rifiutato');
          form.style.display = 'none';
          if (successView) {
            const idDisplay = document.getElementById('clientIdDisplay');
            const diaryLink = document.getElementById('diaryLink');
            const diaryUrl = DIARY_URL + '?cid=' + encodeURIComponent(clientId);
            if (idDisplay) idDisplay.textContent = clientId;
            if (diaryLink) {
              diaryLink.href = diaryUrl;
              diaryLink.textContent = diaryUrl;
            }
            successView.classList.remove('hidden');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch((error) => {
          console.error('Errore durante l\'invio:', error);
          submitBtn.disabled = false;
          submitBtn.innerText = 'Invia';
          if (error && error.message === 'rifiutato') {
            alert('Non siamo riusciti a salvare il questionario. Controlla di aver compilato tutti i campi obbligatori e riprova. Se il problema continua scrivici a info@cosimosgobba.it.');
          } else {
            alert('Non abbiamo ricevuto conferma dell\'invio (problema di connessione). Per evitare doppioni non reinviare: scrivici a info@cosimosgobba.it e ti confermiamo se \u00e8 arrivato.');
          }
        });

    } catch (error) {
      console.error('Errore durante la preparazione del submit:', error);
      submitBtn.disabled = false;
      submitBtn.innerText = 'Invia';
      alert('Si \u00e8 verificato un errore durante l\'invio. Riprova.');
    }
  });
}

// [PATCH 2026-10-11] precompila l'email dal link della mail di conferma (?email=...),
// così il questionario si collega in automatico alla prenotazione.
(function () {
  const email = new URLSearchParams(window.location.search).get('email');
  const input = document.querySelector('input[name="email"]');
  if (input && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) input.value = email;
})();