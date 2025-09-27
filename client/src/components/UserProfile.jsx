import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfileApi } from '../lib/api.js';
import SuccessModal from './SuccessModal.jsx';
import { getCityStateFromPincode, isValidIndianPincode, formatIndianPhoneNumber } from '../utils/indianData.js';

export default function UserProfile({ onClose }) {
  const { user, setUser, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || ''
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!userInfo.name.trim()) {
      newErrors.name = 'Full name is mandatory';
    }

    // Email validation
    if (!userInfo.email.trim()) {
      newErrors.email = 'Email is mandatory';
    } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!userInfo.phone.trim()) {
      newErrors.phone = 'Phone number is mandatory';
    } else {
      const digits = userInfo.phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 12) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Pincode validation
    if (!userInfo.pincode.trim()) {
      newErrors.pincode = 'Pin code is mandatory';
    } else if (!isValidIndianPincode(userInfo.pincode)) {
      newErrors.pincode = 'Pin code must be exactly 6 digits';
    }

    // City validation
    if (!userInfo.city.trim()) {
      newErrors.city = 'City is mandatory';
    }

    // State validation
    if (!userInfo.state.trim()) {
      newErrors.state = 'State is mandatory';
    }

    // Address validation
    if (!userInfo.address.trim()) {
      newErrors.address = 'Address is mandatory';
    }

    // Date of Birth validation
    if (!userInfo.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is mandatory';
    }

    // Gender validation
    if (!userInfo.gender) {
      newErrors.gender = 'Gender is mandatory';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle pincode changes to auto-suggest city and state
    if (name === 'pincode') {
      const cleanPincode = value.replace(/\D/g, '');
      if (cleanPincode.length <= 6) {
        setUserInfo(prev => ({
          ...prev,
          [name]: cleanPincode
        }));

        // Auto-suggest city and state when pincode is 6 digits
        if (cleanPincode.length === 6 && isValidIndianPincode(cleanPincode)) {
          const cityStateData = getCityStateFromPincode(cleanPincode);
          if (cityStateData) {
            setUserInfo(prev => ({
              ...prev,
              city: cityStateData.city,
              state: cityStateData.state
            }));
          }
        }
      }
    }
    // Handle phone number formatting
    else if (name === 'phone') {
      const formattedPhone = formatIndianPhoneNumber(value);
      setUserInfo(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    }
    // Handle other inputs normally
    else {
      setUserInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const showNotification = (type, title, message) => {
    setModalConfig({ type, title, message });
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      showNotification('error', 'Validation Error', 'Please fill all mandatory fields correctly');
      return;
    }

    setLoading(true);
    try {
      // Call API to update profile
      const response = await updateProfileApi(token, {
        name: userInfo.name,
        phone: userInfo.phone,
        address: userInfo.address,
        city: userInfo.city,
        state: userInfo.state,
        pincode: userInfo.pincode,
        dateOfBirth: userInfo.dateOfBirth,
        gender: userInfo.gender
      });

      // Update local user state with the response from server
      setUser(response.user);
      setIsEditing(false);
      showNotification('success', 'Success!', 'Profile updated successfully!');
      
      // Auto-close the modal after successful save
      setTimeout(() => {
        setShowModal(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Update Failed', error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUserInfo({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || ''
    });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <>
      <div className="user-profile-modal">
        <div className="user-profile-content">
          <div className="profile-header">
            <h2>Personal Information</h2>
            <div className="header-buttons">
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button 
                className="close-btn"
                onClick={onClose}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+91 "
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={userInfo.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={userInfo.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>
              <div className="form-group">
                <label>Pin Code *</label>
                <input
                  type="text"
                  name="pincode"
                  value={userInfo.pincode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="123456"
                  maxLength="6"
                  className={errors.pincode ? 'error' : ''}
                />
                {errors.pincode && <span className="error-text">{errors.pincode}</span>}
              </div>
            </div>

            <div className="form-group full-width">
              <label>Address *</label>
              <textarea
                name="address"
                value={userInfo.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="3"
                placeholder="Enter your full address"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={userInfo.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="City will be suggested from pincode"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={userInfo.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="State will be suggested from pincode"
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button 
                  className="save-btn" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <SuccessModal
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}