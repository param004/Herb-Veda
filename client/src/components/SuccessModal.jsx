export default function SuccessModal({ isOpen, onClose, message, type = 'success' }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'var(--green)';
      case 'error':
        return 'var(--danger)';
      case 'warning':
        return '#ff9800';
      default:
        return 'var(--green)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-content">
          <div className="success-icon" style={{ color: getColor() }}>
            {getIcon()}
          </div>
          <h3>{type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Notice'}</h3>
          <p>{message}</p>
          <button 
            className="primary-btn success-ok-btn" 
            onClick={onClose}
            style={{ backgroundColor: getColor() }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}