import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React from 'react';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import MyIcon from '../../assets/my-icon.svg';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className="navigation">
      <ul className="nav-list">
        {isLoaded && (
          <li className="nav-item profile-button">
            <ProfileButton user={sessionUser} />
          </li>
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
