// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// ===== Language dropdown =====
const langToggle = document.getElementById('langToggle');
const langMenu = document.getElementById('langMenu');
if (langToggle && langMenu) {
  const closeLangMenu = () => {
    langMenu.classList.remove('open');
    langToggle.setAttribute('aria-expanded', 'false');
  };
  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = langMenu.classList.toggle('open');
    langToggle.setAttribute('aria-expanded', isOpen);
  });
  document.addEventListener('click', (e) => {
    if (langMenu.classList.contains('open') && !langMenu.contains(e.target) && e.target !== langToggle) {
      closeLangMenu();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && langMenu.classList.contains('open')) {
      closeLangMenu();
      langToggle.focus();
    }
  });
}

// ===== Itinerary page: tabs (Barcelona / day trips), 1-5 day plan picker, deep links =====
const itinTabs = document.querySelectorAll('.itin-tab');
const itinPanes = document.querySelectorAll('.itin-pane');
const planBtns = document.querySelectorAll('.plan-btn');
const plans = document.querySelectorAll('.plan');
function showItinTab(name){
  itinTabs.forEach(t => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });
  itinPanes.forEach(p => {
    const on = p.id === 'tab-' + name;
    p.classList.toggle('active', on);
    p.hidden = !on;
  });
}
function showPlan(n){
  planBtns.forEach(b => b.classList.toggle('active', b.dataset.plan === String(n)));
  plans.forEach(p => p.classList.toggle('plan-active', p.dataset.plan === String(n)));
}
function openFromHash(){
  const h = location.hash.replace('#', '');
  if (!h) return;
  if (h.indexOf('trip-') === 0){
    const el = document.getElementById(h);
    if (el){
      showItinTab('daytrips');
      el.open = true;
      setTimeout(() => el.scrollIntoView({behavior: 'smooth', block: 'start'}), 50);
    }
  } else if (h.indexOf('plan-') === 0){
    const m = h.match(/^plan-(\d)/);
    if (m){ showItinTab('barcelona'); showPlan(m[1]); }
  } else if (h === 'daytrips' || h === 'barcelona' || h === 'build' || h === 'build' || h === 'build' || h === 'build' || h === 'build'){
    showItinTab(h);
  }
}
if (itinTabs.length){
  itinTabs.forEach(t => t.addEventListener('click', () => showItinTab(t.dataset.tab)));
  planBtns.forEach(b => b.addEventListener('click', () => showPlan(b.dataset.plan)));
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}

// ===== Ticket category switching (Gaudí / Museums / Sports / etc. within the Tickets page) =====
const catBtns = document.querySelectorAll('.cat-btn');
const catPanels = document.querySelectorAll('.cat-panel');

catBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    catBtns.forEach(b => b.classList.toggle('active', b === btn));
    catPanels.forEach(p => p.classList.toggle('active', p.id === 'cat-' + cat));
  });
});

// ===== Jump straight to the Combined Pass category (used by "pass-pointer" links on the Tickets page) =====
function goToCombinedPass(){
  const combinedBtn = document.querySelector('.cat-btn[data-cat="combined"]');
  if (combinedBtn) combinedBtn.click();
  const combinedPanel = document.getElementById('cat-combined');
  if (combinedPanel) combinedPanel.scrollIntoView({behavior: 'smooth', block: 'start'});
}
window.goToCombinedPass = goToCombinedPass;

// ===== Jump to any ticket category (used by pointer links between categories) =====
function goToCategory(cat){
  const btn = document.querySelector('.cat-btn[data-cat="' + cat + '"]');
  if (btn) btn.click();
  const panel = document.getElementById('cat-' + cat);
  if (panel) panel.scrollIntoView({behavior: 'smooth', block: 'start'});
}
window.goToCategory = goToCategory;

// ===== Star rating (feedback form) =====
const stars = document.querySelectorAll('.star-rating .star');
let selectedRating = 0;
stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = Number(star.dataset.value);
    stars.forEach(s => s.classList.toggle('filled', Number(s.dataset.value) <= selectedRating));
  });
});

// ===== Feedback form (front-end only demo) =====
const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks for your feedback! (Connect this form to an email service or backend to start receiving real messages.)');
    feedbackForm.reset();
    stars.forEach(s => s.classList.remove('filled'));
    selectedRating = 0;
  });
}


// ===== Ticket search (Tickets page): filters every card across all categories =====
const ticketSearch = document.getElementById('ticketSearch');
if (ticketSearch) {
  const section = document.getElementById('tickets');
  const noRes = document.getElementById('ticketNoResults');
  const panels = Array.from(document.querySelectorAll('.cat-panel'));
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const runSearch = () => {
    const q = norm(ticketSearch.value.trim());
    if (q.length < 2) {
      section.classList.remove('searching');
      document.querySelectorAll('.is-hit-hidden').forEach((el) => el.classList.remove('is-hit-hidden'));
      noRes.hidden = true;
      return;
    }
    section.classList.add('searching');
    let total = 0;
    panels.forEach((panel) => {
      let panelHits = 0;
      panel.querySelectorAll('.ticket-grid').forEach((grid) => {
        let hits = 0;
        grid.querySelectorAll('.ticket-card').forEach((card) => {
          const match = norm(card.textContent).includes(q);
          card.classList.toggle('is-hit-hidden', !match);
          if (match) hits++;
        });
        grid.classList.toggle('is-hit-hidden', hits === 0);
        let prev = grid.previousElementSibling;
        while (prev && (prev.classList.contains('subcat-heading') || prev.classList.contains('subcat-intro'))) {
          prev.classList.toggle('is-hit-hidden', hits === 0);
          prev = prev.previousElementSibling;
        }
        panelHits += hits;
      });
      panel.classList.toggle('is-hit-hidden', panelHits === 0);
      total += panelHits;
    });
    noRes.hidden = total > 0;
  };
  ticketSearch.addEventListener('input', runSearch);
  ticketSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { ticketSearch.value = ''; runSearch(); }
  });
  // choosing a category tab leaves search mode
  document.querySelectorAll('.cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (ticketSearch.value) { ticketSearch.value = ''; runSearch(); }
    });
  });
}
