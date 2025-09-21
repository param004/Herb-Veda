import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfileApi } from '../lib/api.js';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
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
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
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
  };

  return (
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
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={userInfo.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={userInfo.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={userInfo.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pin Code</label>
              <input
                type="text"
                name="pincode"
                value={userInfo.pincode}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="400001"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <textarea
              name="address"
              value={userInfo.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="3"
              placeholder="Enter your full address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={userInfo.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Mumbai"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={userInfo.state}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Maharashtra"
              />
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
  );
}