const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);
const gmailUser = String(process.env.GMAIL_USER || '').trim();
const gmailAppPassword = String(process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');
const contactToEmail = String(process.env.CONTACT_TO_EMAIL || gmailUser || '').trim();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname, { index: 'index.html' }));

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isEmailConfigured() {
  return Boolean(gmailUser && gmailAppPassword);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
  });
}

async function verifySmtpConnection() {
  if (!isEmailConfigured()) {
    return false;
  }

  try {
    await createTransporter().verify();
    return true;
  } catch (error) {
    console.error('SMTP verification failed:', {
      code: error && error.code,
      command: error && error.command,
      responseCode: error && error.responseCode,
      message: error && error.message
    });
    return false;
  }
}

app.get('/api/health', async (_req, res) => {
  const smtpReady = await verifySmtpConnection();
  res.json({ ok: true, configured: isEmailConfigured(), smtpReady });
});

app.post('/api/contact', async (req, res) => {
  const { name = '', email = '', phone = '', subject = '', message = '' } = req.body || {};

  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim();
  const trimmedPhone = String(phone).trim();
  const trimmedSubject = String(subject).trim();
  const trimmedMessage = String(message).trim();

  if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields.'
    });
  }

  if (!isValidEmail(trimmedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  if (!isEmailConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Email service is not configured yet. Add your Gmail app credentials in the environment.'
    });
  }

  try {
    const transporter = createTransporter();
    const smtpReady = await verifySmtpConnection();

    if (!smtpReady) {
      return res.status(503).json({
        success: false,
        message: 'The Gmail mail server is not reachable from this environment. Please verify the app credentials and network access.'
      });
    }

    const recipient = contactToEmail || gmailUser;

    await transporter.sendMail({
      from: `"${trimmedName}" <${gmailUser}>`,
      to: recipient,
      replyTo: trimmedEmail,
      subject: `Portfolio Contact: ${trimmedSubject}`,
      text: [
        `Name: ${trimmedName}`,
        `Email: ${trimmedEmail}`,
        trimmedPhone ? `Phone: ${trimmedPhone}` : '',
        '',
        'Message:',
        trimmedMessage
      ].filter(Boolean).join('\n'),
      html: `
        <h3>Portfolio Contact Request</h3>
        <p><strong>Name:</strong> ${trimmedName}</p>
        <p><strong>Email:</strong> ${trimmedEmail}</p>
        ${trimmedPhone ? `<p><strong>Phone:</strong> ${trimmedPhone}</p>` : ''}
        <p><strong>Subject:</strong> ${trimmedSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${trimmedMessage.replace(/\n/g, '<br>')}</p>
      `
    });

    return res.json({
      success: true,
      message: "Message sent successfully. I'll get back to you soon."
    });
  } catch (error) {
    console.error('Failed to send email:', {
      code: error && error.code,
      command: error && error.command,
      responseCode: error && error.responseCode,
      message: error && error.message
    });
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact me directly.'
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
});
