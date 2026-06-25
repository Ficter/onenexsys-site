(() => {
  const originalForm = document.getElementById('contactForm');
  if (!originalForm) return;

  const contactForm = originalForm.cloneNode(true);
  originalForm.replaceWith(contactForm);

  const formStatus = document.getElementById('formStatus');
  const contactSubmit = document.getElementById('contactSubmit');
  const fieldErrors = {
    name: document.getElementById('contactNameError'),
    email: document.getElementById('contactEmailError'),
    message: document.getElementById('contactMessageError')
  };

  function setFormStatus(message, type = '') {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`.trim();
  }

  function clearFieldErrors() {
    Object.entries(fieldErrors).forEach(([name, element]) => {
      if (!element) return;
      element.textContent = '';
      const field = contactForm.elements[name];
      if (field) field.removeAttribute('aria-invalid');
    });
  }

  function setFieldErrors(errors = {}) {
    Object.entries(errors).forEach(([name, message]) => {
      const element = fieldErrors[name];
      const field = contactForm.elements[name];
      if (element) element.textContent = message;
      if (field) field.setAttribute('aria-invalid', 'true');
    });
  }

  function validateContactForm() {
    const data = new FormData(contactForm);
    const errors = {};
    const email = String(data.get('email') || '').trim();

    if (!String(data.get('name') || '').trim()) errors.name = 'Please enter your name.';
    if (!email) errors.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
    if (!String(data.get('message') || '').trim()) errors.message = 'Please enter a message.';

    return errors;
  }

  const storedPlan = sessionStorage.getItem('onenexsysPlannerResult');
  if (storedPlan) {
    try {
      const plan = JSON.parse(storedPlan);
      const message = document.getElementById('contactMessage');
      message.value = [
        `Infrastructure Planner result: ${plan.title}`,
        `Complexity: ${plan.complexity}`,
        `Recommended services: ${(plan.services || []).join(', ')}`,
        `Suggested rollout: ${(plan.phases || []).join(' -> ')}`,
        '',
        'Additional details:'
      ].join('\n');
      sessionStorage.removeItem('onenexsysPlannerResult');
    } catch {
      sessionStorage.removeItem('onenexsysPlannerResult');
    }
  }

  contactForm.addEventListener('input', event => {
    const name = event.target.name;
    if (fieldErrors[name]) {
      fieldErrors[name].textContent = '';
      event.target.removeAttribute('aria-invalid');
    }
    setFormStatus('');
  });

  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    clearFieldErrors();
    setFormStatus('');

    const clientErrors = validateContactForm();
    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors);
      setFormStatus('Please check the highlighted fields.', 'error');
      return;
    }

    contactSubmit.disabled = true;
    contactSubmit.textContent = 'Sending...';
    setFormStatus('Sending your enquiry...', 'pending');

    const payload = Object.fromEntries(new FormData(contactForm).entries());

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.errors) setFieldErrors(result.errors);
        setFormStatus(result.message || 'The enquiry could not be sent. Please try again shortly.', 'error');
        return;
      }

      contactForm.reset();
      setFormStatus(result.message || 'Thank you. Your enquiry has been sent.', 'success');
    } catch {
      setFormStatus('The enquiry could not be sent. Please check your connection and try again.', 'error');
    } finally {
      contactSubmit.disabled = false;
      contactSubmit.textContent = 'Request Consultation';
    }
  });
})();
