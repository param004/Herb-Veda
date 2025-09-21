import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import UserProfile from '../components/UserProfile.jsx';

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <UserProfile onClose={() => navigate(-1)} />
        </div>
      </div>
    </div>
  );
}
