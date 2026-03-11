// CONFIGURAZIONE
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxumg01sSaHwOMutYdT-7W2J-04HdkydIwzXOP2rGsDZo2MhtgmfW2OfbGlTMqFMq9ag/exec';

// GESTIONE CONDIZIONALI
const chkInizio = document.getElementById('chk_inizio');
const condInizio = document.getElementById('cond_inizio');
if(chkInizio) {
  chkInizio.addEventListener('change', function() {
    condInizio.classList.toggle('hidden', !this.checked);
  });
}

const chkRisvegli = document.getElementById('chk_risvegli');
const condRisvegli = document.getElementById('cond_risvegli');
if(chkRisvegli) {
  chkRisvegli.addEventListener('change', function() {
    condRisvegli.classList.toggle('hidden', !this.checked);
  });
}

const selTurni = document.getElementById('lavoro_turni');
const inpTurni = document.getElementById('lavoro_turni_spec');
if(selTurni) {
  selTurni.addEventListener('change', function() {
    inpTurni.classList.toggle('hidden', this.value !== 'Si');
  });
}

// INVIO FORM
document.getElementById('questionarioForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerText = "Invio in corso...";

  const formData = new FormData(this);
  const data = {};
  
  formData.forEach((val, key) => {
    if(data[key]) {
      if(!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(val);
    } else {
      data[key] = val;
    }
  });

  // Appiattisci array
  Object.keys(data).forEach(k => {
    if(Array.isArray(data[k])) data[k] = data[k].join(', ');
  });

  // Payload
  document.getElementById('payload').value = JSON.stringify(data);
  
  this.action = GOOGLE_SCRIPT_URL;
  this.target = 'hidden_iframe';
  this.submit();

  setTimeout(() => {
    document.getElementById('questionarioForm').style.display = 'none';
    document.getElementById('successView').classList.remove('hidden');
    window.scrollTo(0,0);
  }, 1500);
});
  const check = (n) => { const el = document.querySelector(`[name="${n}"]`); if(el) el.checked=true; };

  set('nome', 'Tester_'+rnd);
  set('cognome', 'Auto');
  set('email', `test${rnd}@mail.com`);
  set('telefono', '3331234567');
  set('occupazione', 'Tester');
  
  // Seleziona primo radio di ogni gruppo
  const radios = document.querySelectorAll('input[type="radio"]');
  const radioGroups = {};
  radios.forEach(r => {
    if(!radioGroups[r.name]) {
      radioGroups[r.name] = true;
      r.checked = true;
    }
  });
  
  set('voto_sonno_overall', 6);
  check('consenso_privacy');
  
  check('disturbo_russa');
  check('disturbo_apnea');
  
  // Scatena evento submit
  document.getElementById('submitBtn').click();
};
