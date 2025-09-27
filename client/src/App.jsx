import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider, ToastContainer } from './context/ToastContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutConfirmationPage from './pages/CheckoutConfirmationPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailsPage from './pages/OrderDetailsPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
// AboutPage removed
import ContactPage from './pages/ContactPage.jsx';
import PersonalInfoPage from './pages/PersonalInfoPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  
  if (!token) {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem('hv_has_visited');
    
    if (!hasVisited) {
      // Mark as visited and redirect to signup for first-time users
      localStorage.setItem('hv_has_visited', 'true');
      return <Navigate to="/signup" replace />;
    }
    
    // Return visitors go to login
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  
  if (token) {
    // User is authenticated, redirect to home
    return <Navigate to="/" replace />;
  }
  
  // For signup page, mark that user has visited if they reach signup
  if (window.location.pathname === '/signup') {
    localStorage.setItem('hv_has_visited', 'true');
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContainer />
        <CartProvider>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } 
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <ProductsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <CartPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout-confirmation"
            element={
              <PrivateRoute>
                <CheckoutConfirmationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/personal-info"
            element={
              <PrivateRoute>
                <PersonalInfoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-confirmation/:orderId"
            element={
              <PrivateRoute>
                <OrderConfirmationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/order/:orderId"
            element={
              <PrivateRoute>
                <OrderDetailsPage />
              </PrivateRoute>
            }
          />
          {/* About page route removed */}
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <ContactPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
