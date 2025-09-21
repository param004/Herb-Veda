import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('[backfill] MONGO_URI is not set in server/.env');
    process.exit(1);
  }

  console.log('[backfill] Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('[backfill] Connected');

  const orders = await Order.find({});
  console.log(`[backfill] Loaded ${orders.length} orders`);

  let totalItemsUpdated = 0;
  let ordersUpdated = 0;

  for (const order of orders) {
    let changed = false;
    const items = order.items || [];
    for (const item of items) {
      // Compute productId flexibly
      const existingPid = item.productId;
      const possiblePid = item.productId || item.id || (item._id && item._id.toString && item._id.toString());
      if (!existingPid && possiblePid) {
        item.productId = possiblePid;
        changed = true;
      }

      // Compute name flexibly
      const existingName = item.name;
      const possibleName = item.name || item.title || item.productName || undefined;
      if (!existingName && possibleName) {
        item.name = possibleName;
        changed = true;
      }
    }

    if (changed) {
      try {
        await order.save();
        ordersUpdated += 1;
        totalItemsUpdated += items.length;
        console.log(`[backfill] Updated order ${order._id} (${items.length} items)`);
      } catch (err) {
        console.error(`[backfill] Failed to update order ${order._id}:`, err.message);
      }
    }
  }

  console.log(`[backfill] Done. Orders updated: ${ordersUpdated}, Items touched: ${totalItemsUpdated}`);
  await mongoose.disconnect();
  console.log('[backfill] Disconnected');
}

main().catch((err) => {
  console.error('[backfill] Fatal error:', err);
  process.exit(1);
});
