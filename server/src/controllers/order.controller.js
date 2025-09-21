import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { generateInvoicePdfBuffer } from '../lib/invoice.js';
import { sendOrderInvoiceEmail } from '../lib/mailer.js';
import { buildInvoiceEmailHtml, buildInvoiceText } from '../lib/emailTemplates.js';
import { User } from '../models/User.js';

export async function createOrder(req, res) {
  try {
    const userId = req.user.sub;
    const { items, subtotal, deliveryCharge, total, customerInfo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      return res.status(400).json({ message: 'Complete customer information is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = new Order({
      userId,
      // Be flexible with incoming item shape so we always capture productId and name
      items: items.map(item => ({
        productId: (
          item.productId ||
          item.id ||
          (typeof item._id === 'object' && item._id ? item._id.toString() : item._id) ||
          ''
        ),
        name: item.name || item.title || 'Unknown Product',
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        description: item.description,
        benefits: item.benefits
      })),
      subtotal,
      deliveryCharge,
      total,
      customerInfo
    });

    await order.save();

    // Optionally send invoice email if enabled; never block order creation
    if (String(process.env.INVOICE_EMAIL_ENABLED).toLowerCase() === 'true') {
      (async () => {
        try {
          const safe = order.toSafeJSON();
          const pdfBuffer = await generateInvoicePdfBuffer(safe);
          const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER; // BCC admin copy
          const subject = `Invoice for Order ${safe.orderNumber}`;
          const customerEmail = safe.customerInfo?.email;
          if (customerEmail) {
            await sendOrderInvoiceEmail({
              to: customerEmail,
              adminBcc: adminEmail,
              subject,
              html: buildInvoiceEmailHtml({ customerName: safe.customerInfo?.name, orderNumber: safe.orderNumber }),
              text: buildInvoiceText({ customerName: safe.customerInfo?.name, orderNumber: safe.orderNumber }),
              attachments: [{ filename: `${safe.orderNumber}.pdf`, content: pdfBuffer }]
            });
            console.log(`[order] Invoice email sent for ${safe.orderNumber} to ${customerEmail}${adminEmail ? ` (bcc: ${adminEmail})` : ''}`);
          } else {
            console.warn('[order] Missing customer email; skipping invoice email');
          }
        } catch (err) {
          console.error('[order] Failed to generate/send invoice:', err?.message || err);
        }
      })();
    } else {
      console.log('[order] Invoice email disabled by INVOICE_EMAIL_ENABLED flag');
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: order.toSafeJSON()
    });

  } catch (error) {
    console.error('Create order error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid order data', 
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ message: 'Server error while creating order' });
  }
}

export async function getOrder(req, res) {
  try {
    const userId = req.user.sub;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order: order.toSafeJSON() });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
}

// List all orders for the authenticated user, newest first.
// Optional filter: ?productName=Ashwagandha (matches exact item name)
export async function listOrders(req, res) {
  try {
    const userId = req.user.sub;
    const { productName } = req.query;

    const query = { userId };
    if (productName) {
      query['items.name'] = productName;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ orders: orders.map(o => o.toSafeJSON()) });
  } catch (error) {
    console.error('List orders error:', error);
    res.status(500).json({ message: 'Server error while listing orders' });
  }
}

// Aggregate summary: count of items grouped by product name for this user
export async function getOrdersSummaryByProduct(req, res) {
  try {
    const userId = req.user.sub;
    const pipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQuantity: { $sum: '$items.quantity' }, ordersCount: { $sum: 1 } } },
      { $project: { productName: '$_id', _id: 0, totalQuantity: 1, ordersCount: 1 } },
      { $sort: { totalQuantity: -1 } }
    ];

    const summary = await Order.aggregate(pipeline);
    res.json({ summary });
  } catch (error) {
    console.error('Orders summary error:', error);
    res.status(500).json({ message: 'Server error while aggregating orders' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const userId = req.user.sub;
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order: order.toSafeJSON()
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error while updating order' });
  }
}
