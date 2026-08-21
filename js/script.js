// ===== Main tab navigation (Home / Tickets / Affiliation / Feedback) =====
const navBtns = document.querySelectorAll('.nav-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const footerLinks = document.querySelectorAll('.footer-links a');

function activateTab(tabName){
  tabPanels.forEach(p => p.classList.toggle('active', p.id === tabName));
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
  window.scrollTo({top:0, behavior:'smooth'});
  document.getElementById('mainNav').classList.remove('open');
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

footerLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    activateTab(link.dataset.tab);
  });
});

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// ===== Ticket category switching =====
const catBtns = document.querySelectorAll('.cat-btn');
const catPanels = document.querySelectorAll('.cat-panel');

catBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    catBtns.forEach(b => b.classList.toggle('active', b === btn));
    catPanels.forEach(p => p.classList.toggle('active', p.id === 'cat-' + cat));
  });
});

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
feedbackForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thanks for your feedback! (Connect this form to an email service or backend to start receiving real messages.)');
  feedbackForm.reset();
  stars.forEach(s => s.classList.remove('filled'));
  selectedRating = 0;
});
