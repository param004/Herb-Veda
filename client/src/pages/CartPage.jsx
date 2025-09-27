import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';
import PersonalInfoModal from '../components/PersonalInfoModal.jsx';

export default function CartPage() {
  const { user, token } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);

  const subtotal = getCartTotal();
  // Removed GST calculation
  const deliveryCharge = 0; // No delivery charge as requested
  const total = subtotal + deliveryCharge;

  const handleCheckout = async () => {
    if (!user?.phone || !user?.address) {
      setShowPersonalInfoModal(true);
      return;
    }

    // Navigate to checkout confirmation instead of directly placing order
    navigate('/checkout-confirmation');
  };

  if (cartItems.length === 0) {
    return (
      <div className="main-layout">
        <Navbar />
        <div className="page-container">
          <div className="empty-cart">
            <h1>Your Cart is Empty</h1>
            <p>Add some products to your cart to see them here!</p>
            <button className="cta-button" onClick={() => navigate('/products')}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <header className="page-header">
          <h1>Shopping Cart</h1>
          <p>Review your items and proceed to checkout</p>
        </header>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  {typeof item.image === 'string' && item.image.includes('.') ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="product-emoji">{item.image}</div>
                  )}
                </div>
                
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="cart-item-benefits">
                    {item.benefits?.map((benefit, index) => (
                      benefit && <span key={index} className="benefit-tag">{benefit}</span>
                    ))}
                  </div>
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="cart-item-price">
                    <span className="price">{item.price}</span>
                    <span className="total">₹{(parseFloat(item.price.replace('₹', '')) * item.quantity).toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                    title="Remove from cart"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="billing-details">
              <h2>Bill Summary</h2>
              
              <div className="customer-info">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
                <p><strong>Address:</strong> {user?.address || 'Not provided'}</p>
                {user?.city && <p><strong>City:</strong> {user.city}</p>}
                {user?.state && <p><strong>State:</strong> {user.state}</p>}
                {user?.pincode && <p><strong>Pin Code:</strong> {user.pincode}</p>}
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                {/* Removed GST display */}
                
                <div className="summary-row free">
                  <span>Delivery Charge:</span>
                  <span>FREE</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="checkout-btn" 
                onClick={handleCheckout}
              >
                {`Proceed to Checkout - ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <PersonalInfoModal 
        isOpen={showPersonalInfoModal} 
        onClose={() => setShowPersonalInfoModal(false)} 
      />
    </div>
  );
}