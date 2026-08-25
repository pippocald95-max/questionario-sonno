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

      // Invio tramite fetch con no-cors per evitare errori CORS
      // Il payload viene inviato come JSON nel body
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data),
      })
        .then(() => {
          // Con no-cors non possiamo leggere la risposta, ma l'invio e' avvenuto
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
          alert('Si \u00e8 verificato un errore durante l\'invio. Riprova.');
        });

    } catch (error) {
      console.error('Errore durante la preparazione del submit:', error);
      submitBtn.disabled = false;
      submitBtn.innerText = 'Invia';
      alert('Si \u00e8 verificato un errore durante l\'invio. Riprova.');
    }
  });
}
