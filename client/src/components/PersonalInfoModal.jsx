import { useNavigate } from 'react-router-dom';

export default function PersonalInfoModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCompleteInfo = () => {
    onClose();
    navigate('/personal-info');
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="personal-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Your Profile</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="modal-content">
          <div className="modal-icon">
            📋
          </div>
          <h3>Personal Information Required</h3>
          <p>Please complete your personal information before proceeding to checkout. We need your phone number and address for delivery.</p>
          
          <div className="missing-info">
            <h4>Required Information:</h4>
            <ul>
              <li>📞 Phone Number</li>
              <li>🏠 Delivery Address</li>
              <li>🌍 City, State & PIN Code</li>
            </ul>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="secondary-btn" onClick={handleGoHome}>
            Maybe Later
          </button>
          <button className="primary-btn" onClick={handleCompleteInfo}>
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
}