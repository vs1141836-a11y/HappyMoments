import nodemailer from 'nodemailer';

// Helper to create mail transporter
const getTransporter = async () => {
  const isDummy = !process.env.SMTP_USER || 
                  process.env.SMTP_USER.includes('dummy') || 
                  process.env.SMTP_USER === 'your_smtp_username';

  if (isDummy) {
    console.log('Using Ethereal Mail fallback for Nodemailer...');
    try {
      // Create a test account on mailtrap/ethereal dynamically
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('Failed to create Ethereal SMTP transporter, falling back to console mailer.');
      return {
        sendMail: async (options) => {
          console.log('======= CONSOLE EMAIL =======');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Body Snippet: ${options.html.substring(0, 500)}...`);
          console.log('=============================');
          return { messageId: 'console-mock-id' };
        }
      };
    }
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// 1. Send Customer booking confirmation
export const sendBookingConfirmationEmail = async (booking, user) => {
  try {
    const transporter = await getTransporter();
    const from = process.env.SMTP_FROM || 'HappyMoments <noreply@happymoments.com>';

    const itemsListHtml = booking.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f0e6cc; font-size: 14px; color: #333;">
          <strong>${item.title}</strong>
          ${item.color ? `<br/><span style="font-size: 12px; color: #666;">Color: ${item.color}</span>` : ''}
          ${item.size ? `<br/><span style="font-size: 12px; color: #666;">Size: ${item.size}</span>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #f0e6cc; font-size: 14px; color: #333; text-align: center;">
          ${item.itemType === 'Decoration' ? 'Complete Service' : 'Prop Rental'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #f0e6cc; font-size: 14px; color: #333; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #f0e6cc; font-size: 14px; color: #333; text-align: right;">
          ₹${item.price.toLocaleString()}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation - HappyMoments</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfbf7; margin: 0; padding: 20px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e8dfc5; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #121212 0%, #2c2512 100%); padding: 40px 20px; border-bottom: 3px solid #d4af37;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">HappyMoments</h1>
              <p style="color: #eaeaea; margin: 5px 0 0 0; font-size: 14px; font-style: italic;">Premium Event Decoration & Rentals</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #745217; margin-top: 0; font-size: 20px; border-bottom: 1px solid #f0e6cc; padding-bottom: 10px;">Booking Confirmed!</h2>
              <p style="font-size: 15px; color: #444; line-height: 1.6;">Dear <strong>${user.name}</strong>,</p>
              <p style="font-size: 15px; color: #444; line-height: 1.6;">Thank you for choosing HappyMoments. Your payment was verified successfully and your booking is officially <strong>Confirmed</strong>. Here are your booking details:</p>
              
              <!-- Quick Info Card -->
              <table width="100%" style="background-color: #faf7ef; border-left: 4px solid #d4af37; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <tr>
                  <td style="font-size: 14px; color: #555; padding-bottom: 5px;"><strong>Booking ID:</strong> ${booking.bookingId}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #555; padding-bottom: 5px;"><strong>Event Date:</strong> ${booking.eventDate}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #555; padding-bottom: 5px;"><strong>Setup Time Slot:</strong> ${booking.eventTime}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #555; padding-bottom: 5px;"><strong>Payment Transaction ID:</strong> ${booking.razorpayPaymentId}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #555;"><strong>Event Location:</strong> ${booking.eventLocation}</td>
                </tr>
              </table>
              
              <!-- Items Table -->
              <h3 style="color: #745217; font-size: 16px; margin-top: 25px;">Booked Services & Rentals</h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #f0e6cc; border-radius: 4px; overflow: hidden; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #faf7ef;">
                    <th style="padding: 10px; text-align: left; font-size: 13px; color: #745217; border-bottom: 2px solid #f0e6cc;">Item</th>
                    <th style="padding: 10px; text-align: center; font-size: 13px; color: #745217; border-bottom: 2px solid #f0e6cc;">Type</th>
                    <th style="padding: 10px; text-align: center; font-size: 13px; color: #745217; border-bottom: 2px solid #f0e6cc;">Qty</th>
                    <th style="padding: 10px; text-align: right; font-size: 13px; color: #745217; border-bottom: 2px solid #f0e6cc;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                </tbody>
              </table>

              <!-- Pricing summary -->
              <table width="100%" style="font-size: 14px; color: #444; border-top: 2px solid #f0e6cc; padding-top: 15px;">
                <tr>
                  <td style="text-align: right; padding-bottom: 5px; width: 80%;">GST (18%):</td>
                  <td style="text-align: right; padding-bottom: 5px; font-weight: bold;">₹${booking.taxAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="text-align: right; padding-bottom: 5px;">Delivery & Setup Fee:</td>
                  <td style="text-align: right; padding-bottom: 5px; font-weight: bold;">₹${booking.shippingFee.toLocaleString()}</td>
                </tr>
                <tr style="font-size: 18px; color: #745217;">
                  <td style="text-align: right; padding-top: 10px; font-weight: bold;">Total Amount Paid:</td>
                  <td style="text-align: right; padding-top: 10px; font-weight: bold; border-top: 1px solid #d4af37;">₹${booking.totalAmount.toLocaleString()}</td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #888; text-align: center; margin-top: 30px; line-height: 1.5;">
                Need help with your booking? Reply to this email or call our client experience team.<br/>
                <strong>HappyMoments Decor Platform</strong>
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from,
      to: user.email,
      subject: `Booking Confirmed! ID: ${booking.bookingId} - HappyMoments`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Customer Confirmation Email Sent: ${info.messageId}`);
    
    // If it's ethereal email, print URL to review
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('Error sending confirmation email to customer:', error);
  }
};

// 2. Send Admin alert
export const sendAdminNotificationEmail = async (booking, user) => {
  try {
    const transporter = await getTransporter();
    const from = process.env.SMTP_FROM || 'HappyMoments <noreply@happymoments.com>';
    const adminEmail = 'admin@happymoments.com'; // Standard admin mailbox

    const itemsHtml = booking.items.map(item => `
      <li>
        <strong>${item.title}</strong> (${item.itemType}) x ${item.quantity} - ₹${item.price.toLocaleString()}
        ${item.color ? `[Color: ${item.color}]` : ''} ${item.size ? `[Size: ${item.size}]` : ''}
      </li>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Event Booking Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 6px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto; overflow: hidden;">
          <div style="background-color: #121212; border-bottom: 3px solid #d4af37; padding: 20px; color: #fff;">
            <h2 style="margin: 0; color: #d4af37;">Alert: New Booking Received</h2>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #bbb;">Booking ID: ${booking.bookingId}</p>
          </div>
          <div style="padding: 20px; font-size: 14px; color: #333; line-height: 1.5;">
            <p>Admin Team,</p>
            <p>A new event booking has been placed and payment has been verified. Here are the client and event logistics details:</p>
            
            <h3 style="color: #745217; border-bottom: 1px solid #eee; padding-bottom: 5px;">Client Information</h3>
            <table width="100%" style="font-size: 14px;">
              <tr><td width="30%"><strong>Name:</strong></td><td>${user.name}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${user.email}</td></tr>
              <tr><td><strong>Contact:</strong></td><td>${user.contact || 'N/A'}</td></tr>
            </table>

            <h3 style="color: #745217; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Event Logistics</h3>
            <table width="100%" style="font-size: 14px;">
              <tr><td width="30%"><strong>Event Date:</strong></td><td><strong>${booking.eventDate}</strong></td></tr>
              <tr><td><strong>Setup Slot:</strong></td><td>${booking.eventTime}</td></tr>
              <tr><td><strong>Venue Address:</strong></td><td>${booking.eventLocation}</td></tr>
            </table>

            <h3 style="color: #745217; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Order Details</h3>
            <ul>
              ${itemsHtml}
            </ul>
            <p><strong>Total Amount Collected:</strong> <span style="color: #745217; font-weight: bold; font-size: 16px;">₹${booking.totalAmount.toLocaleString()}</span></p>
            <p><strong>Razorpay Payment ID:</strong> ${booking.razorpayPaymentId}</p>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background-color: #d4af37; color: #000; text-decoration: none; padding: 12px 20px; font-weight: bold; border-radius: 4px; display: inline-block;">Manage Booking on Admin Dashboard</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from,
      to: adminEmail,
      subject: `[ALERT] New Booking Received - ID: ${booking.bookingId} (${booking.eventDate})`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin Booking Notification Email Sent.`);
  } catch (error) {
    console.error('Error sending alert email to admin:', error);
  }
};
