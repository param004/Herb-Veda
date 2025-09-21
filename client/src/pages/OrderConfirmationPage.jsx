import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrderApi } from '../lib/api.js';
import Navbar from '../components/Navbar.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const parsePrice = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    const n = parseFloat(cleaned);
    return Number.isNaN(n) ? 0 : n;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderApi(token, orderId);
        setOrder(response.order);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token, navigate]);

  const handleDownloadPDF = async () => {
    try {
      if (!invoiceRef.current) return;
      // Ensure styles are applied and content is visible during capture
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `HerbVeda-Order-${order?.orderNumber || order?.id || orderId}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // As a fallback, trigger browser print
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="main-layout">
        <Navbar />
        <div className="page-container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="main-layout">
        <Navbar />
        <div className="page-container">
          <div className="error">Order not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <div className="order-confirmation" ref={invoiceRef}>
          <div className="success-header">
            <div className="success-icon" aria-hidden="true"></div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order. Your order has been successfully placed.</p>
          </div>

          <div className="order-details">
            <div className="order-info">
              <h2>Order Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Order ID:</span>
                  <span className="value">{order.id}</span>
                </div>
                <div className="info-item">
                  <span className="label">Order Date:</span>
                  <span className="value">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value status-confirmed">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="customer-details">
              <h2>Delivery Information</h2>
              <div className="customer-card">
                <p><strong>{order.customerInfo.name}</strong></p>
                <p>{order.customerInfo.email}</p>
                <p>{order.customerInfo.phone}</p>
                <p>{order.customerInfo.address}</p>
                <p>{order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.pincode}</p>
              </div>
            </div>

            <div className="order-items">
              <h2>Ordered Items</h2>
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    {typeof item.image === 'string' && item.image.includes('.') ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="product-emoji">{item.image}</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{parsePrice(item.price).toFixed(2)}</p>
                  </div>
                  <div className="item-total">
                    ₹{(parsePrice(item.price) * (item.quantity || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="billing-summary">
              <h2>Bill Summary</h2>
              <div className="bill-details">
                <div className="bill-row">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="bill-row free">
                  <span>Delivery Charge:</span>
                  <span>FREE</span>
                </div>
                <div className="bill-row total">
                  <span>Total Amount:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="order-actions">
              <button className="primary-btn" onClick={() => navigate('/')}>
                Continue Shopping
              </button>
              <button className="secondary-btn" onClick={() => window.print()}>
                Print Order
              </button>
              <button className="secondary-btn" onClick={handleDownloadPDF}>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}