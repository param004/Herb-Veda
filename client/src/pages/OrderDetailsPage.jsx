import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrderApi } from '../lib/api.js';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Normalize price strings like "₹1,299" to numbers for calculations
  const parsePrice = (price) => {
    if (typeof price === 'number' && !Number.isNaN(price)) return price;
    if (typeof price === 'string') {
      const cleaned = price.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      return Number.isNaN(num) ? 0 : num;
    }
    return 0;
  };

  useEffect(() => {
    if (token && orderId) {
      fetchOrder();
    }
  }, [token, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrderApi(token, orderId);
      setOrder(response.order);
      setError('');
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError('Order not found or you do not have access to this order.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'confirmed': '#27ae60',
      'processing': '#3498db',
      'shipped': '#9b59b6',
      'delivered': '#2ecc71',
      'cancelled': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  if (!token) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h1>Please Login</h1>
          <p>You need to be logged in to view order details.</p>
          <Link to="/login" className="primary-btn">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container">
        <div className="error-state">
          <div className="alert error">{error || 'Order not found'}</div>
          <div className="order-actions">
            <button 
              className="secondary-btn" 
              onClick={() => navigate('/orders')}
            >
              Back to Orders
            </button>
            <button 
              className="primary-btn" 
              onClick={fetchOrder}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="order-details-page">
        <div className="page-header">
          <button 
            className="back-btn" 
            onClick={() => navigate('/orders')}
            title="Back to Orders"
          >
            Back to Orders
          </button>
          <div className="header-content">
            <h1>Order #{order._id.slice(-8)}</h1>
            <div className="order-meta">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className="order-date">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="order-content">
          <div className="order-timeline">
            <h2>Order Timeline</h2>
            <div className="timeline">
              <div className={`timeline-item ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : 'pending'}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>Order Confirmed</h4>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className={`timeline-item ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : order.status === 'confirmed' ? 'current' : 'pending'}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>Processing</h4>
                  <p>Your order is being prepared</p>
                </div>
              </div>
              <div className={`timeline-item ${['shipped', 'delivered'].includes(order.status) ? 'completed' : order.status === 'processing' ? 'current' : 'pending'}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>Shipped</h4>
                  <p>Your order is on the way</p>
                </div>
              </div>
              <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : order.status === 'shipped' ? 'current' : 'pending'}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>Delivered</h4>
                  <p>Order delivered successfully</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-info-grid">
            <div className="customer-details">
              <h2>Delivery Information</h2>
              <div className="customer-card">
                <p><strong>{order.customerInfo.name}</strong></p>
                <p>{order.customerInfo.phone}</p>
                <p>{order.customerInfo.email}</p>
                <div className="address">
                  <p>{order.customerInfo.address}</p>
                  <p>{order.customerInfo.city}, {order.customerInfo.state}</p>
                  <p>PIN: {order.customerInfo.pincode}</p>
                </div>
              </div>
            </div>

            <div className="billing-summary">
              <h2>Order Summary</h2>
              <div className="bill-details">
                <div className="bill-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="bill-row free">
                  <span>Delivery:</span>
                  <span>FREE</span>
                </div>
                <div className="bill-row total">
                  <span>Total Amount:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-items">
            <h2>Items Ordered ({order.items.length})</h2>
            <div className="items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span className="product-emoji">🌿</span>
                    )}
                  </div>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="item-description">{item.description}</p>
                    {item.benefits && (
                      <div className="item-benefits">
                        {item.benefits.map((benefit, i) => (
                          <span key={i} className="benefit-tag">{benefit}</span>
                        ))}
                      </div>
                    )}
                    <div className="item-pricing">
                      <span className="quantity">Quantity: {item.quantity}</span>
                      <span className="unit-price">{formatPrice(parsePrice(item.price))} each</span>
                    </div>
                  </div>
                  <div className="item-total">
                    {formatPrice(parsePrice(item.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-actions">
            {order.status === 'pending' && (
              <button className="danger-btn">
                Cancel Order
              </button>
            )}
            <button className="secondary-btn">
              Download Invoice
            </button>
            <button 
              className="primary-btn"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}