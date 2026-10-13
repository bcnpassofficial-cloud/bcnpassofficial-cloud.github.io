/*
 * BCN Pass Official — outbound click tracking
 * ------------------------------------------------------------------
 * Counts every click on an external link (official ticket pages, maps,
 * PayPal, ...) together with WHICH place and category it came from.
 *
 * TO TURN IT ON, paste ONE (or both) of these below:
 *   ga4          Google Analytics 4 Measurement ID, e.g. 'G-ABC123XYZ'
 *                -> loads only AFTER the visitor accepts the cookie banner
 *   goatcounter  GoatCounter site code, e.g. 'bcnpass'  (= bcnpass.goatcounter.com)
 *                -> cookie-free, no banner needed
 * Leave both empty and nothing is sent anywhere.
 *
 * TO TEST: open any page with  ?trackdebug=1  added to the address and
 * look in the browser console (F12) for  "[bcn-track]"  lines when you
 * click a link.
 */
(function () {
  'use strict';
  var CONFIG = {
    ga4: '',
    goatcounter: ''
  };
  var CFG = window.BCN_ANALYTICS || CONFIG;   // (window.BCN_ANALYTICS only used for testing)
  var DEBUG = /[?&]trackdebug=1/.test(location.search);
  var LANG = (document.documentElement.lang || 'en').slice(0, 2);
  var KEY = 'bcn_consent';

  var TXT = {
    en: ["We'd like to count clicks on links to official ticket pages to see what's useful. No personal details are collected.", 'Accept', 'Decline', 'Privacy'],
    es: ['Nos gustaría contar los clics en los enlaces a las páginas oficiales de entradas para saber qué resulta útil. No se recogen datos personales.', 'Aceptar', 'Rechazar', 'Privacidad'],
    fr: ['Nous aimerions compter les clics sur les liens vers les pages de billetterie officielles pour savoir ce qui est utile. Aucune donnée personnelle n’est collectée.', 'Accepter', 'Refuser', 'Confidentialité'],
    de: ['Wir möchten Klicks auf Links zu den offiziellen Ticketseiten zählen, um zu sehen, was nützlich ist. Es werden keine persönlichen Daten erfasst.', 'Akzeptieren', 'Ablehnen', 'Datenschutz'],
    ja: ['公式チケットページへのリンクのクリック数を集計し、役立つ内容の把握に役立てたいと考えています。個人情報は収集しません。', '同意する', '同意しない', 'プライバシー'],
    nl: ["We willen graag klikken op links naar officiële ticketpagina's tellen om te zien wat nuttig is. Er worden geen persoonlijke gegevens verzameld.", 'Accepteren', 'Weigeren', 'Privacy']
  };

  function store(get, v) {
    try { return get ? localStorage.getItem(KEY) : (v === null ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, v)); } catch (e) { return null; }
  }

  // ---------- Google Analytics 4 (only after consent) ----------
  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded || !CFG.ga4) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.ga4);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', CFG.ga4, { anonymize_ip: true });
  }

  // ---------- GoatCounter (cookie-free) ----------
  function loadGoatCounter() {
    if (!CFG.goatcounter) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + CFG.goatcounter + '.goatcounter.com/count');
    document.head.appendChild(s);
  }

  // ---------- consent banner ----------
  function showBanner() {
    var t = TXT[LANG] || TXT.en;
    var bar = document.createElement('div');
    bar.className = 'consent-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookies');
    var p = document.createElement('p');
    p.textContent = t[0] + ' ';
    var a = document.createElement('a');
    a.href = (LANG === 'en' ? '' : '/' + LANG) + '/privacy/';
    a.textContent = t[3];
    p.appendChild(a);
    var ok = document.createElement('button');
    ok.type = 'button'; ok.className = 'btn btn-primary'; ok.textContent = t[1];
    var no = document.createElement('button');
    no.type = 'button'; no.className = 'btn btn-outline'; no.textContent = t[2];
    ok.onclick = function () { store(false, 'granted'); bar.remove(); loadGA(); };
    no.onclick = function () { store(false, 'denied'); bar.remove(); };
    var row = document.createElement('div');
    row.className = 'consent-actions';
    row.appendChild(ok); row.appendChild(no);
    bar.appendChild(p); bar.appendChild(row);
    document.body.appendChild(bar);
  }

  window.bcnConsentReset = function () {      // used by the "change your choice" link on the Privacy page
    store(false, null);
    location.reload();
  };

  // ---------- click tracking ----------
  function slug(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  function describe(a) {
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return null; }
    var mail = u.protocol === 'mailto:';
    if (!mail && !/^https?:$/.test(u.protocol)) return null;
    var host = u.hostname.replace(/^www\./, '');
    if (!mail && (host === location.hostname.replace(/^www\./, '') || /(^|\.)bcnpassofficial\.com$/.test(host))) return null;
    var type = mail ? 'contact'
      : /(^|\.)paypal\.(me|com)$/.test(host) ? 'donate'
      : (/(^|\.)google\.[a-z.]+$/.test(host) && /\/maps/.test(u.pathname)) ? 'map'
      : 'ticket';
    var card = a.closest('.ticket-card');
    var h = card && card.querySelector('h4');
    var panel = a.closest('.cat-panel');
    var sub = '';
    var grid = a.closest('.ticket-grid');
    for (var p = grid && grid.previousElementSibling; p; p = p.previousElementSibling) {
      if (p.classList.contains('subcat-heading')) { sub = clean(p.textContent); break; }
    }
    return {
      link_type: type,
      link_url: mail ? 'mailto' : u.origin + u.pathname,
      link_domain: mail ? 'mailto' : host,
      link_text: clean(a.textContent).slice(0, 80),
      item_name: h ? clean(h.textContent) : '',
      item_category: panel ? panel.id.replace(/^cat-/, '') : '',
      item_subcategory: sub,
      page_path: location.pathname,
      page_lang: LANG
    };
  }

  function send(d) {
    if (DEBUG) console.log('[bcn-track]', d);
    if (window.gtag && gaLoaded) window.gtag('event', 'outbound_click', d);
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({
        path: 'outbound/' + d.link_type + '/' + (slug(d.item_name) || slug(d.link_domain)),
        title: (d.item_name || d.link_domain) + ' → ' + d.link_domain,
        event: true
      });
    }
  }

  function onClick(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var d = describe(a);
    if (d) send(d);
  }
  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);

  // ---------- start ----------
  function start() {
    if (CFG.goatcounter) loadGoatCounter();
    if (CFG.ga4) {
      var c = store(true);
      if (c === 'granted') loadGA();
      else if (c !== 'denied') showBanner();
      document.querySelectorAll('[data-consent-only]').forEach(function (el) { el.hidden = false; });
    }
    if (CFG.ga4 || CFG.goatcounter) {
      document.querySelectorAll('[data-analytics-note]').forEach(function (el) { el.hidden = false; });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
