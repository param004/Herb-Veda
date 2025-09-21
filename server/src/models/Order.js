import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
  description: { type: String },
  benefits: [String]
});

const customerInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  pincode: { type: String }
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    customerInfo: customerInfoSchema,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed'
    },
    orderNumber: { type: String, unique: true }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
// Helpful for reporting by product id/name
orderSchema.index({ 'items.productId': 1 });
orderSchema.index({ 'items.name': 1 });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.models.Order.countDocuments();
    this.orderNumber = `HV${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

orderSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    orderNumber: this.orderNumber,
    items: this.items,
    subtotal: this.subtotal,
    deliveryCharge: this.deliveryCharge,
    total: this.total,
    customerInfo: this.customerInfo,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const Order = mongoose.model('Order', orderSchema);

