const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');
const cookieBanner = document.getElementById('cookieBanner');
const cookieChoices = document.querySelectorAll('[data-cookie-choice]');
const manageCookieButtons = document.querySelectorAll('[data-manage-cookies]');
const cookieConsentKey = 'noir-cookie-consent';

const readCookieConsent = () => {
  try {
    return localStorage.getItem(cookieConsentKey);
  } catch (error) {
    return null;
  }
};

const writeCookieConsent = (choice) => {
  try {
    localStorage.setItem(cookieConsentKey, choice);
    document.body.dataset.cookieConsent = choice;
  } catch (error) {
    // Ignore storage errors and keep the banner visible.
  }
};

const setCookieBannerVisibility = (visible) => {
  if (!cookieBanner) return;

  cookieBanner.classList.toggle('is-visible', visible);
};

if (cookieBanner) {
  const savedChoice = readCookieConsent();

  if (savedChoice) {
    document.body.dataset.cookieConsent = savedChoice;
    setCookieBannerVisibility(false);
  } else {
    requestAnimationFrame(() => setCookieBannerVisibility(true));
  }
}

cookieChoices.forEach((button) => {
  button.addEventListener('click', () => {
    writeCookieConsent(button.dataset.cookieChoice || 'necessary');
    setCookieBannerVisibility(false);
  });
});

manageCookieButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setCookieBannerVisibility(true);
  });
});

if (menuButton) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

let headerFrameId = null;
const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};

window.addEventListener('scroll', () => {
  if (!headerFrameId) {
    headerFrameId = requestAnimationFrame(() => {
      updateHeaderState();
      headerFrameId = null;
    });
  }
}, { passive: true });
updateHeaderState();

const revealElements = document.querySelectorAll('.service, .gallery-item, .about, .quote-section, .stats div');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -2% 0px' });

  revealElements.forEach((element) => {
    element.classList.add('reveal');
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const serviceAvailability = {
  'Classic Cut': ['09:00', '10:30', '12:00', '14:00', '16:30'],
  'Skin Fade': ['10:00', '11:30', '13:00', '15:00', '17:30'],
  'Beard Trim': ['09:30', '11:00', '13:30', '15:30', '18:00'],
  'Hair & Beard': ['08:30', '10:15', '12:30', '14:30', '16:00'],
  'Kids Cut': ['09:00', '10:00', '11:00', '12:00', '13:00']
};

const bookingModal = document.getElementById('booking-form');
const serviceNameSelect = document.getElementById('serviceName');
const bookingDateSelect = document.getElementById('bookingDate');
const bookingTimeSelect = document.getElementById('bookingTime');
const bookingForm = document.getElementById('bookingForm');
const bookingStatus = document.getElementById('bookingStatus');

function buildDateOptions() {
  const options = [];
  const today = new Date();

  for (let i = 1; i <= 5; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const value = date.toISOString().split('T')[0];
    const label = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);

    options.push({ value, label });
  }

  return options;
}

function populateServices() {
  if (!serviceNameSelect) return;

  const options = Object.keys(serviceAvailability)
    .map(service => `<option value="${service}">${service}</option>`)
    .join('');

  serviceNameSelect.innerHTML = options;
}

function populateBookingSlots(serviceName) {
  if (!serviceNameSelect || !bookingDateSelect || !bookingTimeSelect) return;

  const dates = buildDateOptions();
  const dayOptions = dates
    .map(date => `<option value="${date.value}">${date.label}</option>`)
    .join('');

  bookingDateSelect.innerHTML = dayOptions;
  bookingTimeSelect.innerHTML = (serviceAvailability[serviceName] || serviceAvailability['Classic Cut'])
    .map(time => `<option value="${time}">${time}</option>`)
    .join('');

  if (serviceNameSelect.value !== serviceName) {
    serviceNameSelect.value = serviceName;
  }
}

function openBookingForm(serviceName) {
  if (!serviceNameSelect || !bookingModal) return;

  serviceNameSelect.value = serviceName;
  populateBookingSlots(serviceName);
  bookingModal.classList.add('is-open');
  bookingModal.setAttribute('aria-hidden', 'false');

  const nameField = document.getElementById('customerName');
  setTimeout(() => nameField?.focus(), 50);
}

function closeBookingForm() {
  if (!bookingModal) return;

  bookingModal.classList.remove('is-open');
  bookingModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.booking-link').forEach(link => {
  link.addEventListener('click', event => {
    const serviceName = link.getAttribute('data-service') || 'Classic Cut';
    event.preventDefault();
    openBookingForm(serviceName);
  });
});

bookingModal?.addEventListener('click', event => {
  if (event.target.matches('[data-close-booking]')) {
    closeBookingForm();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && bookingModal?.classList.contains('is-open')) {
    closeBookingForm();
  }
});

serviceNameSelect?.addEventListener('change', event => {
  populateBookingSlots(event.target.value);
});

bookingForm?.addEventListener('submit', event => {
  event.preventDefault();

  const name = document.getElementById('customerName')?.value.trim();
  const email = document.getElementById('customerEmail')?.value.trim();
  const phone = document.getElementById('customerPhone')?.value.trim();

  if (!name || !email || !phone) {
    bookingStatus.textContent = 'Please fill in your name, email and phone number to continue.';
    bookingStatus.style.color = '#8b3a2f';
    return;
  }

  const selectedService = serviceNameSelect.value;
  const selectedDate = bookingDateSelect.value;
  const selectedTime = bookingTimeSelect.value;

  bookingStatus.textContent = `Demo request received: ${selectedService} on ${selectedDate} at ${selectedTime}. We will contact ${name} at ${email}.`;
  bookingStatus.style.color = '#2d5c3d';
});

populateServices();
populateBookingSlots('Classic Cut');

const allInternalLinks = document.querySelectorAll('a[href^="#"]');
allInternalLinks.forEach(link => {
  const targetId = link.getAttribute('href');

  if (targetId === '#booking-form' || targetId === '#contact') {
    return;
  }

  link.addEventListener('click', event => {
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'auto' });
    }
  });
});
