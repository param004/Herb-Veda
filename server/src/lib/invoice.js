import PDFDocument from 'pdfkit';

function formatCurrency(n) {
  const num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^0-9.]/g, '')) || 0;
  return `₹${num.toFixed(2)}`;
}

export async function generateInvoicePdfBuffer(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (d) => chunks.push(d));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text('Herb & Veda', { align: 'left' });
      doc.fontSize(10).fillColor('#555').text('Natural wellness products', { align: 'left' });
      doc.moveDown();

      doc.fillColor('#000').fontSize(14).text('Invoice', { align: 'right' });
      doc.fontSize(10).text(`Order #: ${order.orderNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Customer
      const ci = order.customerInfo || {};
      doc.fontSize(12).text('Bill To:');
      doc.fontSize(10)
        .text(ci.name || '')
        .text(ci.email || '')
        .text(ci.phone || '')
        .text(ci.address || '')
        .text(`${ci.city || ''} ${ci.state || ''} ${ci.pincode || ''}`)
        .moveDown();

      // Table header
      doc.fontSize(11).text('Product', 50, doc.y, { continued: true })
         .text('Qty', 320, doc.y, { width: 50, align: 'right', continued: true })
         .text('Unit Price', 380, doc.y, { width: 80, align: 'right', continued: true })
         .text('Total', 470, doc.y, { width: 80, align: 'right' });

      doc.moveTo(50, doc.y + 3).lineTo(550, doc.y + 3).stroke();

      // Items
      const items = order.items || [];
      items.forEach((it) => {
        const unit = typeof it.price === 'number' ? it.price : parseFloat(String(it.price).replace(/[^0-9.]/g, '')) || 0;
        const lineTotal = unit * (it.quantity || 1);
        doc.fontSize(10)
          .text(`${it.name || 'Product'}${it.productId ? ` (#${it.productId})` : ''}`, 50, doc.y + 6, { continued: true })
          .text(String(it.quantity || 1), 320, doc.y, { width: 50, align: 'right', continued: true })
          .text(formatCurrency(unit), 380, doc.y, { width: 80, align: 'right', continued: true })
          .text(formatCurrency(lineTotal), 470, doc.y, { width: 80, align: 'right' });
      });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // Totals
      doc.fontSize(11)
        .text('Subtotal:', 380, doc.y + 10, { width: 80, align: 'right', continued: true })
        .text(formatCurrency(order.subtotal || 0), 470, doc.y, { width: 80, align: 'right' });
      doc.fontSize(11)
        .text('Delivery:', 380, doc.y + 6, { width: 80, align: 'right', continued: true })
        .text(order.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.deliveryCharge || 0), 470, doc.y, { width: 80, align: 'right' });
      doc.fontSize(12).fillColor('#000')
        .text('Total:', 380, doc.y + 8, { width: 80, align: 'right', continued: true })
        .text(formatCurrency(order.total || 0), 470, doc.y, { width: 80, align: 'right' });

      doc.moveDown(2);
      doc.fontSize(9).fillColor('#777').text('Thank you for your purchase! For support, contact support@herbveda.example');

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
