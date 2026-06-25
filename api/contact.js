const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@onenexsys.com';
const SUBJECT = 'New OneNexsys Website Enquiry';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.headers?.['content-type']?.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(req.body));
  }
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br>');
}

function validate(fields) {
  const errors = {};

  if (!fields.name) errors.name = 'Please enter your name.';
  if (!fields.email) errors.email = 'Please enter your email address.';
  else if (!isEmail(fields.email)) errors.email = 'Please enter a valid email address.';
  if (!fields.message) errors.message = 'Please enter a message.';

  return errors;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const body = parseBody(req);
  const fields = {
    name: clean(body.name, 120),
    company: clean(body.company, 160),
    email: clean(body.email, 180),
    phone: clean(body.phone, 80),
    message: clean(body.message, 4000)
  };

  const errors = validate(fields);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Please check the highlighted fields.', errors });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return res.status(500).json({ message: 'Email delivery is not configured yet.' });
  }

  const text = [
    `Name: ${fields.name}`,
    `Company: ${fields.company || 'Not provided'}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone || 'Not provided'}`,
    '',
    'Message:',
    fields.message
  ].join('\n');

  const html = `
    <h2>${SUBJECT}</h2>
    <p><strong>Name:</strong> ${escapeHtml(fields.name)}</p>
    <p><strong>Company:</strong> ${escapeHtml(fields.company || 'Not provided')}</p>
    <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(fields.phone || 'Not provided')}</p>
    <p><strong>Message:</strong><br>${escapeHtml(fields.message)}</p>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        reply_to: fields.email,
        subject: SUBJECT,
        text,
        html
      })
    });

    if (!response.ok) {
      return res.status(502).json({ message: 'The enquiry could not be sent. Please try again shortly.' });
    }

    return res.status(200).json({ message: 'Thank you. Your enquiry has been sent.' });
  } catch {
    return res.status(502).json({ message: 'The enquiry could not be sent. Please try again shortly.' });
  }
};
