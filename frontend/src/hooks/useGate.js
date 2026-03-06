const SK = 'sv_gate_email';
const SK2 = 'sv_gate_full';
const EXPIRY_DAYS = 90;

const HS_PID = '143576889';
const HS_FORM_ID = 'ff2f34a7-9084-4811-a3ae-7efe8faf1098';

function saveWithExpiry(key, value) {
  localStorage.setItem(key, JSON.stringify({
    value,
    expires: Date.now() + (EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  }));
}

function getWithExpiry(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (typeof obj !== 'object' || !obj.expires) return obj;
    if (Date.now() > obj.expires) {
      localStorage.removeItem(key);
      return null;
    }
    return obj.value;
  } catch {
    return localStorage.getItem(key);
  }
}

function hasConsent(category) {
  try {
    const m = document.cookie.match('(^|;)\\s*fs-consent\\s*=\\s*([^;]+)');
    if (m) {
      const obj = JSON.parse(decodeURIComponent(m[2]));
      const c = obj.choices || {};
      return c[category] === true || c[category.charAt(0).toUpperCase() + category.slice(1)] === true;
    }
  } catch { /* ignore */ }
  return false;
}

function getCookie(name) {
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? m.pop() : null;
}

function identifyUser(email) {
  if (!email || !hasConsent('analytics')) return;
  if (window.hj) window.hj('identify', null, { email });
  if (window.clarity) window.clarity('set', 'email', email);
  if (window.gtag) window.gtag('set', 'user_properties', { email });
}

function fireAnalytics(event, params) {
  if (!hasConsent('analytics')) return;
  if (window.gtag) window.gtag('event', event, params);
  if (window.hj) window.hj('event', event);
  if (window.clarity) window.clarity('set', 'gate_event', event);
}

export function isUnlocked() {
  const email = getWithExpiry(SK);
  return !!(email && getWithExpiry(SK2) === email);
}

export function getStoredEmail() {
  return getWithExpiry(SK) || '';
}

export function isFastTrackEligible(email) {
  return !!(email && getWithExpiry(SK2) === email);
}

export function saveEmail(email) {
  saveWithExpiry(SK, email);
}

export function completeFull(email) {
  saveWithExpiry(SK2, email);
}

export function submitGate({ email, firstName, lastName, jobTitle, organisation }) {
  const fields = [{ name: 'email', value: email }];
  if (firstName) fields.push({ name: 'firstname', value: firstName });
  if (lastName) fields.push({ name: 'lastname', value: lastName });
  if (jobTitle) fields.push({ name: 'jobtitle', value: jobTitle });
  if (organisation) fields.push({ name: 'company', value: organisation });

  const ctx = { pageUri: location.href, pageName: document.title };
  if (hasConsent('marketing')) {
    const hutk = getCookie('hubspotutk');
    if (hutk) ctx.hutk = hutk;
  }

  fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${HS_PID}/${HS_FORM_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, context: ctx })
  }).catch(() => {});

  identifyUser(email);
  fireAnalytics('gate_unlocked', { content_type: 'calculator', page: location.pathname });
}

export function identifyOnLoad() {
  const email = getWithExpiry(SK);
  if (email && getWithExpiry(SK2) === email) {
    identifyUser(email);
  }
}
