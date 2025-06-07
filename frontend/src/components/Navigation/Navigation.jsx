import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import MyIcon from '../../assets/my-icon.svg';
import { useNavigate } from 'react-router-dom';


function Navigation({ isLoaded }) {
  const sessionUser  = useSelector(state => state.session.user);
  const navigate = useNavigate();

  const handleCreateSpotClick = () => {
    navigate('/spots/new');
  };

  return (
    <nav className="navigation">
      <ul className="nav-list">
        {isLoaded && (
          <>
          {sessionUser && (
            <li className="nav-item create-spot-button">
              <button onClick={handleCreateSpotClick}>
                Create Spot
              </button>
            </li>
             )}
            <li className="nav-item profile-button">
              <ProfileButton user={sessionUser } />
            </li>
          </>
        )}
      </ul>
      <div className="corner-icon">
        <NavLink to="/">
          <img src={MyIcon} alt="My Icon" />
        </NavLink>
      </div>
    </nav>
  );
}
export default Navigation;
