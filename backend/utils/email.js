const nodemailer = require('nodemailer');

// Create transporter (works with Gmail, Outlook, any SMTP)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Beautiful HTML email template
const emailTemplate = (title, body, ctaText = null, ctaLink = null) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🛍️ CarryHand</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">On-Demand Shopping Assistance</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;font-weight:700;">${title}</h2>
          ${body}
          ${ctaText && ctaLink ? `
          <div style="text-align:center;margin:32px 0 0;">
            <a href="${ctaLink}" style="background:#f97316;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">${ctaText}</a>
          </div>` : ''}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f8f8;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;color:#999;font-size:12px;">© 2024 CarryHand. All rights reserved.</p>
          <p style="margin:6px 0 0;color:#bbb;font-size:11px;">New Delhi, India • support@carryhand.in</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── Email Senders ────────────────────────────────────────────────

// 1. Booking Confirmed (to customer)
const sendBookingConfirmation = async (customerEmail, customerName, booking) => {
  const transporter = createTransporter();
  const body = `
    <p style="color:#555;font-size:15px;line-height:1.6;">Hi <strong>${customerName}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;">Your booking has been confirmed! We're finding the best available assistant near you.</p>
    
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:#ea580c;font-size:16px;">📋 Booking Details</h3>
      <table width="100%" cellpadding="6" cellspacing="0">
        <tr><td style="color:#777;font-size:14px;width:40%;">📍 Location</td><td style="color:#1a1a1a;font-size:14px;font-weight:600;">${booking.location.name}</td></tr>
        <tr><td style="color:#777;font-size:14px;">📌 Address</td><td style="color:#1a1a1a;font-size:14px;">${booking.location.address}</td></tr>
        <tr><td style="color:#777;font-size:14px;">⏱️ Duration</td><td style="color:#1a1a1a;font-size:14px;font-weight:600;">${booking.duration} hour${booking.duration > 1 ? 's' : ''}</td></tr>
        <tr><td style="color:#777;font-size:14px;">💰 Amount</td><td style="color:#f97316;font-size:16px;font-weight:700;">₹${booking.price}</td></tr>
        <tr><td style="color:#777;font-size:14px;">💳 Payment</td><td style="color:#1a1a1a;font-size:14px;text-transform:capitalize;">${booking.paymentMethod}</td></tr>
      </table>
    </div>

    <p style="color:#555;font-size:14px;line-height:1.6;">⚡ An assistant will accept your booking shortly. You'll receive another email when they're on their way!</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">🆘 Remember: You can press the <strong>SOS button</strong> anytime during your session if you need emergency help.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'CarryHand <noreply@carryhand.in>',
    to: customerEmail,
    subject: `✅ Booking Confirmed — ${booking.location.name} | CarryHand`,
    html: emailTemplate('Booking Confirmed!', body, 'Track Your Booking', `${process.env.FRONTEND_URL}/customer/dashboard`)
  });
};

// 2. Booking Accepted (to customer — assistant accepted)
const sendBookingAccepted = async (customerEmail, customerName, booking, assistantName) => {
  const transporter = createTransporter();
  const body = `
    <p style="color:#555;font-size:15px;line-height:1.6;">Great news, <strong>${customerName}</strong>! 🎉</p>
    <p style="color:#555;font-size:15px;line-height:1.6;"><strong>${assistantName}</strong> has accepted your booking and is on their way to assist you!</p>
    
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 12px;color:#16a34a;font-size:16px;">🧑‍💼 Your Assistant</h3>
      <p style="margin:0;color:#1a1a1a;font-size:18px;font-weight:700;">${assistantName}</p>
      <p style="margin:6px 0 0;color:#555;font-size:14px;">📍 Heading to: ${booking.location.name}</p>
    </div>

    <p style="color:#555;font-size:14px;line-height:1.6;">Please be at <strong>${booking.location.name}</strong> and look out for your assistant. You can track them live from your dashboard.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'CarryHand <noreply@carryhand.in>',
    to: customerEmail,
    subject: `🧑‍💼 ${assistantName} is on the way! | CarryHand`,
    html: emailTemplate('Assistant Accepted Your Booking!', body, 'Track Live', `${process.env.FRONTEND_URL}/customer/dashboard`)
  });
};

// 3. New Booking Alert (to assistant)
const sendNewBookingAlert = async (assistantEmail, assistantName, booking, customerName) => {
  const transporter = createTransporter();
  const body = `
    <p style="color:#555;font-size:15px;line-height:1.6;">Hi <strong>${assistantName}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;">You have a new booking request! Log in quickly to accept it.</p>
    
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:#1d4ed8;font-size:16px;">📋 Booking Request</h3>
      <table width="100%" cellpadding="6" cellspacing="0">
        <tr><td style="color:#777;font-size:14px;width:40%;">👤 Customer</td><td style="color:#1a1a1a;font-size:14px;font-weight:600;">${customerName}</td></tr>
        <tr><td style="color:#777;font-size:14px;">📍 Location</td><td style="color:#1a1a1a;font-size:14px;font-weight:600;">${booking.location.name}</td></tr>
        <tr><td style="color:#777;font-size:14px;">⏱️ Duration</td><td style="color:#1a1a1a;font-size:14px;">${booking.duration} hour${booking.duration > 1 ? 's' : ''}</td></tr>
        <tr><td style="color:#777;font-size:14px;">💰 Your Earnings</td><td style="color:#16a34a;font-size:16px;font-weight:700;">₹${Math.round(booking.price * 0.8)}</td></tr>
      </table>
    </div>

    <p style="color:#f97316;font-size:14px;font-weight:600;">⚡ Accept quickly — other assistants may also receive this request!</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'CarryHand <noreply@carryhand.in>',
    to: assistantEmail,
    subject: `⚡ New Booking Request — ₹${Math.round(booking.price * 0.8)} | CarryHand`,
    html: emailTemplate('New Booking Request!', body, 'Accept Now', `${process.env.FRONTEND_URL}/assistant/dashboard`)
  });
};

// 4. Booking Completed (to customer — with review prompt)
const sendBookingCompleted = async (customerEmail, customerName, booking, assistantName) => {
  const transporter = createTransporter();
  const body = `
    <p style="color:#555;font-size:15px;line-height:1.6;">Hi <strong>${customerName}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;">Your shopping session at <strong>${booking.location.name}</strong> is complete! We hope you had a great experience with <strong>${assistantName}</strong>.</p>
    
    <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="margin:0;color:#854d0e;font-size:18px;">⭐ Rate your experience</p>
      <p style="margin:8px 0 0;color:#92400e;font-size:14px;">Your feedback helps other shoppers find great assistants!</p>
    </div>

    <p style="color:#555;font-size:14px;line-height:1.6;">💰 <strong>Total Paid:</strong> ₹${booking.price}</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Thank you for using CarryHand. See you next time! 🛍️</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'CarryHand <noreply@carryhand.in>',
    to: customerEmail,
    subject: `✅ Session Complete — Rate ${assistantName} | CarryHand`,
    html: emailTemplate('Session Completed!', body, 'Leave a Review', `${process.env.FRONTEND_URL}/customer/dashboard`)
  });
};

// 5. Payment Confirmation
const sendPaymentConfirmation = async (customerEmail, customerName, amount, paymentId, booking) => {
  const transporter = createTransporter();
  const body = `
    <p style="color:#555;font-size:15px;line-height:1.6;">Hi <strong>${customerName}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;">Your payment has been received successfully!</p>
    
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:#16a34a;font-size:16px;">💰 Payment Receipt</h3>
      <table width="100%" cellpadding="6" cellspacing="0">
        <tr><td style="color:#777;font-size:14px;width:45%;">Payment ID</td><td style="color:#1a1a1a;font-size:13px;font-family:monospace;">${paymentId}</td></tr>
        <tr><td style="color:#777;font-size:14px;">Amount Paid</td><td style="color:#16a34a;font-size:18px;font-weight:700;">₹${amount}</td></tr>
        <tr><td style="color:#777;font-size:14px;">For Booking</td><td style="color:#1a1a1a;font-size:14px;">${booking.location.name}</td></tr>
        <tr><td style="color:#777;font-size:14px;">Status</td><td><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:9999px;font-size:12px;font-weight:600;">PAID ✓</span></td></tr>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'CarryHand <noreply@carryhand.in>',
    to: customerEmail,
    subject: `💰 Payment Confirmed ₹${amount} | CarryHand`,
    html: emailTemplate('Payment Successful!', body)
  });
};

// Helper to send silently (don't crash app if email fails)
const sendEmailSafe = async (fn, ...args) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('[Email] Skipped — EMAIL_USER/PASS not configured in .env');
      return;
    }
    await fn(...args);
    console.log('[Email] Sent successfully');
  } catch (err) {
    console.error('[Email] Failed (non-fatal):', err.message);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingAccepted,
  sendNewBookingAlert,
  sendBookingCompleted,
  sendPaymentConfirmation,
  sendEmailSafe
};
