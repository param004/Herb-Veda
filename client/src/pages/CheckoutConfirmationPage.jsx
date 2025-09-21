import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { createOrderApi } from '../lib/api.js';
import Navbar from '../components/Navbar.jsx';

export default function CheckoutConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Helper to safely parse price strings like "₹1,299.50" or "1299" to a number
  const parsePrice = (price) => {
    if (typeof price === 'number' && !Number.isNaN(price)) return price;
    if (typeof price === 'string') {
      // Remove currency symbols and commas, keep digits and decimal point
      const cleaned = price.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      return Number.isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // If no cart items, redirect to cart
  if (!cartItems || cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  // Calculate totals (GST removed)
  const subtotal = cartItems.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
  const deliveryCharge = 0; // FREE delivery
  const total = subtotal + deliveryCharge;

  const handleConfirmOrder = async () => {
    if (!user?.phone || !user?.address) {
      alert('Please complete your personal information before checkout');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems,
        subtotal,
        deliveryCharge,
        total,
        customerInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          pincode: user.pincode
        }
      };

      const response = await createOrderApi(token, orderData);
      clearCart();
      const newOrderId = response?.order?.id || response?.order?._id;
      if (!newOrderId) {
        console.warn('Order created but id missing in response:', response);
        alert('Order created, but we could not retrieve the order id. Please check your order history.');
        navigate('/orders');
        return;
      }
      navigate(`/order-confirmation/${newOrderId}`);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <div className="checkout-confirmation">
          <div className="confirmation-header">
            <div className="step-indicator">
              <div className="step completed">
                <span className="step-number">1</span>
                <span className="step-label">Cart Review</span>
              </div>
              <div className="step-divider"></div>
              <div className="step active">
                <span className="step-number">2</span>
                <span className="step-label">Order Confirmation</span>
              </div>
              <div className="step-divider"></div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-label">Payment Complete</span>
              </div>
            </div>
            
            <h1>Confirm Your Order</h1>
            <p>Please review your order details before placing the order</p>
          </div>

          <div className="confirmation-content">
            <div className="order-review">
              <div className="delivery-info">
                <h2>Delivery Information</h2>
                <div className="delivery-card">
                  <div className="customer-details">
                    <h3>{user.name}</h3>
                    <p>{user.phone}</p>
                    <p>{user.email}</p>
                  </div>
                  <div className="delivery-address">
                    <p><strong>Address:</strong></p>
                    <p>{user.address}</p>
                    <p>{user.city}, {user.state} - {user.pincode}</p>
                  </div>
                  <button 
                    className="edit-info-btn"
                    onClick={() => navigate('/personal-info')}
                  >
                    Edit Information
                  </button>
                </div>
              </div>

              <div className="order-items-review">
                <h2>Order Items ({cartItems.length})</h2>
                <div className="items-list">
                  {cartItems.map(item => (
                    <div key={item.id} className="confirmation-item">
                      <div className="item-image">
                        {typeof item.image === 'string' && item.image.includes('.') ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="product-emoji">{item.image}</div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-description">{item.description}</p>
                        <div className="item-benefits">
                          {item.benefits?.map((benefit, index) => (
                            benefit && <span key={index} className="benefit-tag">{benefit}</span>
                          ))}
                        </div>
                        <div className="item-pricing">
                          <span className="quantity">Qty: {item.quantity}</span>
                          <span className="unit-price">₹{parsePrice(item.price).toFixed(2)} each</span>
                        </div>
                      </div>
                      <div className="item-total">
                        ₹{(parsePrice(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-summary-sidebar">
              <div className="billing-summary">
                <h2>Bill Summary</h2>
                
                <div className="bill-breakdown">
                  <div className="bill-section">
                    <h3>Order Details</h3>
                    <div className="bill-row">
                      <span>Subtotal ({cartItems.length} items):</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="bill-row free">
                      <span>Delivery Charge:</span>
                      <span>FREE</span>
                    </div>
                  </div>
                  
                  <div className="bill-section total-section">
                    <div className="bill-row total">
                      <span>Total Amount:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="savings-info">
                    <div className="savings-item">
                      <span>No Delivery Charges</span>
                      <span className="saved">You Saved ₹50</span>
                    </div>
                  </div>
                </div>

                <div className="payment-info">
                  <h3>Payment Method</h3>
                  <div className="payment-option selected">
                    <span className="payment-icon" aria-hidden="true"></span>
                    <span>Cash on Delivery (COD)</span>
                    <span className="payment-fee">FREE</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    className="back-to-cart-btn"
                    onClick={() => navigate('/cart')}
                  >
                    Back to Cart
                  </button>
                  
                  <button 
                    className="confirm-order-btn" 
                    onClick={handleConfirmOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Confirm Order - ₹{total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>

                <div className="order-guarantee">
                  <div className="guarantee-item">
                    <span aria-hidden="true"></span>
                    <span>100% Secure Payment</span>
                  </div>
                  <div className="guarantee-item">
                    <span aria-hidden="true"></span>
                    <span>Free Delivery</span>
                  </div>
                  <div className="guarantee-item">
                    <span aria-hidden="true"></span>
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}