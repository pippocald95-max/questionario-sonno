// ==========================================
// CONFIGURAZIONE
// ==========================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzw45wLWI5Owdpjl4bH6P-XMx1FDXUERvVGmp2jI928tDtxFVejPwh7EjE8HMWHYTg9OQ/exec';


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
const payloadField = document.getElementById('payload');
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

      // Inserisce il payload JSON nel campo hidden
      if (payloadField) {
        payloadField.value = JSON.stringify(data);
      }

      // Imposta action e target del form
      form.action = GOOGLE_SCRIPT_URL;
      form.method = 'post';
      form.target = 'hidden_iframe';

      // Submit classico verso Apps Script
      form.submit();

      // Mostra successo dopo un piccolo ritardo
      setTimeout(() => {
        form.style.display = 'none';
        if (successView) {
          successView.classList.remove('hidden');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);

    } catch (error) {
      console.error('Errore durante la preparazione del submit:', error);
      submitBtn.disabled = false;
      submitBtn.innerText = 'Invia';
      alert('Si è verificato un errore durante l’invio. Riprova.');
    }
  });
}


// ==========================================
// TEST AUTO-COMPILAZIONE (facoltativo)
// Rimuovi o commenta questa sezione in produzione
// ==========================================

/*
(function autoTest() {
  const rnd = Math.floor(Math.random() * 100000);

  const set = (name, value) => {
    const el = document.querySelector(`[name="${name}"]`);
    if (el) el.value = value;
  };

  const check = (name) => {
    const el = document.querySelector(`[name="${name}"]`);
    if (el) el.checked = true;
  };

  set('nome', 'Tester_' + rnd);
  set('cognome', 'Auto');
  set('email', `test${rnd}@mail.com`);
  set('telefono', '3331234567');
  set('occupazione', 'Tester');

  const radios = document.querySelectorAll('input[type="radio"]');
  const radioGroups = {};
  radios.forEach((radio) => {
    if (!radioGroups[radio.name]) {
      radioGroups[radio.name] = true;
      radio.checked = true;
    }
  });

  set('voto_sonno_overall', 6);
  check('consenso_privacy');
  check('disturbo_russa');
  check('disturbo_apnea');

  if (submitBtn) submitBtn.click();
})();
*/
