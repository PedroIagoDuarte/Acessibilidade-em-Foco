/* Acessibilidade em Foco - script.js
   Recursos: ajuste de tamanho da fonte, alto contraste (com preferência salva),
   anúncios para leitores de tela e validação acessível do formulário. */

(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'acessibilidade-prefs';
  var MIN_SCALE = 100;
  var MAX_SCALE = 150;
  var STEP = 10;

  var prefs = { scale: 100, contrast: false };

  function loadPrefs() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved.scale === 'number') {
        prefs.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, saved.scale));
        prefs.contrast = !!saved.contrast;
      } else if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
        prefs.contrast = true;
      }
    } catch (e) { /* armazenamento indisponível: segue com padrão */ }
  }

  function savePrefs() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) { /* ignora */ }
  }

  function applyPrefs() {
    root.style.fontSize = prefs.scale + '%';
    if (prefs.contrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }
  }

  function announce(message) {
    var status = document.getElementById('status');
    if (!status) return;
    status.textContent = '';
    window.setTimeout(function () { status.textContent = message; }, 50);
  }

  /* Aplica as preferências o quanto antes para evitar "piscada" */
  loadPrefs();
  applyPrefs();

  document.addEventListener('DOMContentLoaded', function () {
    var toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.hidden = false; /* os botões só aparecem se o JS funcionar */

      var btnInc = document.getElementById('btn-aumentar');
      var btnDec = document.getElementById('btn-diminuir');
      var btnReset = document.getElementById('btn-padrao');
      var btnContrast = document.getElementById('btn-contraste');

      btnContrast.setAttribute('aria-pressed', String(prefs.contrast));

      btnInc.addEventListener('click', function () {
        if (prefs.scale >= MAX_SCALE) { announce('Tamanho máximo do texto atingido.'); return; }
        prefs.scale += STEP;
        applyPrefs(); savePrefs();
        announce('Tamanho do texto: ' + prefs.scale + '%.');
      });

      btnDec.addEventListener('click', function () {
        if (prefs.scale <= MIN_SCALE) { announce('Tamanho mínimo do texto atingido.'); return; }
        prefs.scale -= STEP;
        applyPrefs(); savePrefs();
        announce('Tamanho do texto: ' + prefs.scale + '%.');
      });

      btnReset.addEventListener('click', function () {
        prefs.scale = 100;
        prefs.contrast = false;
        btnContrast.setAttribute('aria-pressed', 'false');
        applyPrefs(); savePrefs();
        announce('Preferências restauradas para o padrão.');
      });

      btnContrast.addEventListener('click', function () {
        prefs.contrast = !prefs.contrast;
        btnContrast.setAttribute('aria-pressed', String(prefs.contrast));
        applyPrefs(); savePrefs();
        announce(prefs.contrast ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
      });
    }

    initForm();
  });

  /* ===== Formulário de contato ===== */
  function initForm() {
    var form = document.getElementById('form-contato');
    if (!form) return;

    var summary = document.getElementById('resumo-erros');
    var success = document.getElementById('sucesso');

    var rules = [
      { id: 'nome', msg: 'Informe seu nome.', test: function (v) { return v.trim().length >= 2; } },
      { id: 'email', msg: 'Informe um e-mail válido, por exemplo nome@exemplo.com.',
        test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
      { id: 'mensagem', msg: 'Escreva sua mensagem (mínimo de 10 caracteres).', test: function (v) { return v.trim().length >= 10; } }
    ];

    function clearErrors() {
      summary.hidden = true;
      summary.innerHTML = '';
      rules.forEach(function (r) {
        var field = document.getElementById(r.id);
        var err = document.getElementById(r.id + '-erro');
        field.removeAttribute('aria-invalid');
        err.textContent = '';
        err.hidden = true;
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      success.hidden = true;
      clearErrors();

      var errors = [];
      rules.forEach(function (r) {
        var field = document.getElementById(r.id);
        if (!r.test(field.value)) {
          errors.push(r);
          field.setAttribute('aria-invalid', 'true');
          var err = document.getElementById(r.id + '-erro');
          err.textContent = r.msg;
          err.hidden = false;
        }
      });

      if (errors.length > 0) {
        var html = '<h2 id="titulo-erros">Há ' + errors.length +
          (errors.length === 1 ? ' campo' : ' campos') + ' para corrigir</h2><ul>';
        errors.forEach(function (r) {
          html += '<li><a href="#' + r.id + '">' + r.msg + '</a></li>';
        });
        html += '</ul>';
        summary.innerHTML = html;
        summary.hidden = false;
        summary.focus(); /* leva o foco ao resumo para leitores de tela */
        return;
      }

      /* Simulação de envio (projeto acadêmico, sem back-end) */
      form.reset();
      success.hidden = false;
      success.focus();
    });
  }
})();
