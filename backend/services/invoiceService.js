import PDFDocument from 'pdfkit';

/**
 * Generates a PDF invoice dynamically and pipes it to the express response.
 */
export const generateInvoicePDF = (booking, user, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe PDF stream to express response
  doc.pipe(res);

  // Colors
  const darkColor = '#1a1a1a';
  const goldColor = '#b89228';
  const greyColor = '#555555';
  const lightGreyColor = '#eeeeee';

  // 1. Header Section
  doc.fillColor(darkColor)
     .font('Helvetica-Bold')
     .fontSize(22)
     .text('HappyMoments', 50, 45, { letterSpacing: 1 })
     .fontSize(8)
     .fillColor(goldColor)
     .text('PREMIUM EVENT DECORATION & RENTALS', 50, 68)
     .fillColor(greyColor)
     .fontSize(10)
     .font('Helvetica')
     .text('Phone: +91 98765 43210', 50, 85)
     .text('Email: support@happymoments.com', 50, 98)
     .text('Web: www.happymoments.com', 50, 111);

  // Title "INVOICE" right aligned
  doc.fillColor(goldColor)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('INVOICE', 400, 45, { align: 'right' });

  // Invoice Details right aligned
  doc.fillColor(darkColor)
     .font('Helvetica')
     .fontSize(9)
     .text(`Invoice No: INV-${booking.bookingId.split('-')[1] || booking._id.toString().substring(18).toUpperCase()}`, 400, 70, { align: 'right' })
     .text(`Booking ID: ${booking.bookingId}`, 400, 85, { align: 'right' })
     .text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 400, 100, { align: 'right' })
     .text(`Status: ${booking.paymentStatus.toUpperCase()}`, 400, 115, { align: 'right', colors: goldColor });

  // Horizontal Divider Line
  doc.strokeColor(goldColor)
     .lineWidth(1)
     .moveTo(50, 135)
     .lineTo(545, 135)
     .stroke();

  // 2. Client & Event Details Section
  doc.fillColor(goldColor)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('BILL TO:', 50, 150)
     .fillColor(darkColor)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(user.name, 50, 165)
     .font('Helvetica')
     .fillColor(greyColor)
     .text(`Email: ${user.email}`, 50, 178)
     .text(`Contact: ${user.contact || 'N/A'}`, 50, 191);

  doc.fillColor(goldColor)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('EVENT & SETUP LOGISTICS:', 300, 150)
     .fillColor(darkColor)
     .font('Helvetica')
     .fontSize(10)
     .text(`Event Date: ${booking.eventDate}`, 300, 165)
     .text(`Setup Slot: ${booking.eventTime}`, 300, 178)
     .text(`Venue: ${booking.eventLocation}`, 300, 191, { width: 245 });

  // Horizontal Divider Line
  doc.strokeColor(lightGreyColor)
     .lineWidth(1)
     .moveTo(50, 235)
     .lineTo(545, 235)
     .stroke();

  // 3. Table Headers
  let tableTopY = 250;
  doc.fillColor(goldColor)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('Item Description', 50, tableTopY)
     .text('Type', 260, tableTopY)
     .text('Unit Price', 350, tableTopY, { width: 60, align: 'right' })
     .text('Qty', 430, tableTopY, { width: 30, align: 'center' })
     .text('Amount', 480, tableTopY, { width: 65, align: 'right' });

  // Divider under headers
  doc.strokeColor(goldColor)
     .lineWidth(1)
     .moveTo(50, 265)
     .lineTo(545, 265)
     .stroke();

  // 4. Table Rows
  let currentY = 275;
  booking.items.forEach((item) => {
    // Check if we need to add a new page (unlikely for a short invoice but safe)
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    doc.fillColor(darkColor)
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(item.title, 50, currentY, { width: 200 });

    // Display options if any
    let options = [];
    if (item.color) options.push(`Color: ${item.color}`);
    if (item.size) options.push(`Size: ${item.size}`);
    if (options.length > 0) {
      currentY += 12;
      doc.fillColor(greyColor)
         .font('Helvetica-Oblique')
         .fontSize(8)
         .text(options.join(' | '), 50, currentY);
    }

    doc.fillColor(greyColor)
       .font('Helvetica')
       .fontSize(9)
       .text(item.itemType === 'Decoration' ? 'Complete Service' : 'Prop Rental', 260, currentY - (options.length > 0 ? 12 : 0))
       .text(`₹${item.price.toLocaleString()}`, 350, currentY - (options.length > 0 ? 12 : 0), { width: 60, align: 'right' })
       .text(item.quantity.toString(), 430, currentY - (options.length > 0 ? 12 : 0), { width: 30, align: 'center' })
       .fillColor(darkColor)
       .font('Helvetica-Bold')
       .text(`₹${(item.price * item.quantity).toLocaleString()}`, 480, currentY - (options.length > 0 ? 12 : 0), { width: 65, align: 'right' });

    currentY += 25;
    
    // Light line divider between rows
    doc.strokeColor(lightGreyColor)
       .lineWidth(0.5)
       .moveTo(50, currentY - 5)
       .lineTo(545, currentY - 5)
       .stroke();
  });

  // 5. Totals Section
  currentY += 10;
  if (currentY > 700) {
    doc.addPage();
    currentY = 50;
  }

  // Draw box for totals
  doc.rect(320, currentY, 225, 110)
     .fillColor(lightGreyColor)
     .fill();

  doc.fillColor(darkColor)
     .font('Helvetica')
     .fontSize(9);

  // Subtotal (Sum of item amounts)
  const subtotal = booking.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  doc.text('Subtotal:', 340, currentY + 15)
     .font('Helvetica-Bold')
     .text(`₹${subtotal.toLocaleString()}`, 450, currentY + 15, { align: 'right', width: 80 });

  // GST
  doc.font('Helvetica')
     .text('GST (18%):', 340, currentY + 35)
     .font('Helvetica-Bold')
     .text(`₹${booking.taxAmount.toLocaleString()}`, 450, currentY + 35, { align: 'right', width: 80 });

  // Convenience / Delivery
  doc.font('Helvetica')
     .text('Delivery & Setup:', 340, currentY + 55)
     .font('Helvetica-Bold')
     .text(`₹${booking.shippingFee.toLocaleString()}`, 450, currentY + 55, { align: 'right', width: 80 });

  // Line before grand total
  doc.strokeColor(goldColor)
     .lineWidth(1)
     .moveTo(330, currentY + 75)
     .lineTo(535, currentY + 75)
     .stroke();

  // Grand Total
  doc.fillColor(goldColor)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Total Paid:', 340, currentY + 85)
     .text(`₹${booking.totalAmount.toLocaleString()}`, 450, currentY + 85, { align: 'right', width: 80 });

  // 6. Payment info & Footer
  currentY += 130;
  if (currentY > 750) {
    doc.addPage();
    currentY = 50;
  }

  // Draw stamp box
  doc.strokeColor(goldColor)
     .lineWidth(1.5)
     .rect(50, currentY - 110, 220, 80)
     .stroke();

  doc.fillColor(goldColor)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('PAYMENT VERIFIED ONLINE', 60, currentY - 100)
     .fillColor(greyColor)
     .font('Helvetica')
     .fontSize(8)
     .text(`Order ID: ${booking.razorpayOrderId || 'N/A'}`, 60, currentY - 85)
     .text(`Transaction ID: ${booking.razorpayPaymentId || 'N/A'}`, 60, currentY - 73)
     .text(`Date & Time: ${new Date(booking.createdAt).toLocaleString()}`, 60, currentY - 61);

  // General terms footer
  doc.fillColor(greyColor)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Terms & Conditions:', 50, currentY)
     .font('Helvetica')
     .fontSize(8)
     .leading(1.3)
     .text('1. The rental duration is defined as 24 hours from delivery.', 50, currentY + 15)
     .text('2. 100% deposit is required to confirm the booking.', 50, currentY + 27)
     .text('3. Cancellations within 48 hours of the event are non-refundable.', 50, currentY + 39)
     .fillColor(goldColor)
     .font('Helvetica-Bold')
     .text('Thank you for letting us light up your Happy Moments!', 50, currentY + 60, { align: 'center', width: 495 });

  // End Document
  doc.end();
};
