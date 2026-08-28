// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

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
