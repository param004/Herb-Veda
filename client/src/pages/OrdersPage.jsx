import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserOrdersApi, getOrdersSummaryByProductApi } from '../lib/api.js';
import Navbar from '../components/Navbar.jsx';

export default function OrdersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([]);

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
    const fetchOrders = async () => {
      try {
        const [ordersRes, summaryRes] = await Promise.all([
          getUserOrdersApi(token),
          getOrdersSummaryByProductApi(token)
        ]);
        setOrders(ordersRes.orders || []);
        setSummary(summaryRes.summary || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="main-layout">
        <Navbar />
        <div className="page-container">
          <div className="loading-state">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <header className="page-header">
          <h1>Your Orders</h1>
          <p>Track and manage your ayurvedic wellness orders</p>
        </header>

        {orders.length === 0 ? (
          <div className="empty-state">
            <h2>No orders yet</h2>
            <p>Start your wellness journey by placing your first order!</p>
            <button className="cta-button" onClick={() => navigate('/products')}>
              Shop Now
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={(order.id || order._id)} className="order-card">
                <div className="order-header">
                  <h3>Order #{(order.orderNumber || order.id || order._id).toString().slice(-8)}</h3>
                  <span className={`order-status ${order.status?.toLowerCase?.() || 'confirmed'}`}>
                    {order.status || 'confirmed'}
                  </span>
                </div>
                <div className="order-details">
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                  <p><strong>Items:</strong> {order.items.length} product(s)</p>
                </div>

                {/* Full item list */}
                <div className="items-list">
                  {order.items.map((item, idx) => (
                    <div key={`${order.id || order._id}-${idx}`} className="confirmation-item">
                      <div className="item-image">
                        {typeof item.image === 'string' && item.image.includes('.') ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="product-emoji">{item.image}</div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                        {item.benefits && item.benefits.length > 0 && (
                          <div className="item-benefits">
                            {item.benefits.map((benefit, bIdx) => (
                              benefit && <span key={bIdx} className="benefit-tag">{benefit}</span>
                            ))}
                          </div>
                        )}
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
            ))}
          </div>
        )}

        {summary.length > 0 && (
          <div className="orders-summary">
            <h2>Products Ordered Summary</h2>
            <ul className="summary-list">
              {summary.map((s) => (
                <li key={s.productName} className="summary-item">
                  <span className="product-name">{s.productName}</span>
                  <span className="product-qty">Total Qty: {s.totalQuantity}</span>
                  <span className="product-orders">Orders: {s.ordersCount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}