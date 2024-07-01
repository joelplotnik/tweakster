import { Link, NavLink, useRouteLoaderData, useSubmit } from 'react-router-dom';
import {
  RiAddFill,
  RiArrowDownSLine,
  RiChat3Line,
  RiDashboardLine,
  RiInformationLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiNotification3Line,
  RiQuestionLine,
  RiUserLine,
} from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState, useContext } from 'react';

import { AuthModal } from '../UI/Modals/AuthModal';
import LoginButton from '../UI/Buttons/LoginButton';
import Logo from '../../assets/logo.svg';
import SearchBar from '../UI/SearchBar';
import Sidebar from './Sidebar';
import SignupButton from '../UI/Buttons/SignupButton';
import { API_URL } from '../../constants/constants';
import classes from './MainNavigation.module.css';
import defaultAvatar from '../../assets/default-avatar.png';
import { getUserData } from '../../util/auth';
import { userActions } from '../../store/user';
import { notificationsActions } from '../../store/notifications';
import { CableContext } from '../../context/cable';

const MainNavigation = () => {
  const token = useRouteLoaderData('root');
  const cableContext = useContext(CableContext);
  const cable = cableContext ? cableContext.cable : null;
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [authType, setAuthType] = useState('');
  const dropdownRef = useRef(null);
  const submit = useSubmit();
  const user = useSelector((state) => state.user.user);
  const { userId, userRole } = getUserData() || {};
  const dispatch = useDispatch();
  const hasNewNotifications = useSelector(
    (state) => state.notifications.hasNewNotifications
  );

  useEffect(() => {
    if (!token) return;

    const subscription = cable.subscriptions.create(
      { channel: 'NotificationsChannel' },
      {
        received: () => {
          dispatch(notificationsActions.setHasNewNotifications(true));
        },
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchUnseenNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications/unseen`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch unseen notifications');
        }

        const data = await response.json();

        dispatch(
          notificationsActions.setHasNewNotifications(
            data.has_unseen_notifications
          )
        );
      } catch (error) {
        console.error('Error fetching unseen notifications: ', error);
      }
    };

    fetchUnseenNotifications();
  }, [token]);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleModalToggle = (type) => {
    setAuthType(type);
    setShowModal(!showModal);
  };

  const handleSidebarToggle = () => {
    setShowSidebar(!showSidebar);
  };

  const handleClickOutside = (event) => {
    if (
      !dropdownRef.current?.contains(event.target) &&
      !document
        .querySelector(`.${classes['hamburger-button']}`)
        .contains(event.target)
    ) {
      setShowMenu(false);
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    dispatch(userActions.clearUser());
    submit(null, { action: '/logout', method: 'POST' });
  };

  return (
    <>
      <header className={classes.navbar}>
        <div className={classes.title}>
          <button
            className={classes['hamburger-button']}
            onClick={handleSidebarToggle}
          >
            <RiMenuLine />
          </button>
          <div className={classes.logo}>
            <Link
              to="/"
              className={classes['title-link']}
              onClick={() => setShowMenu(false)}
            >
              <img className={classes.icon} src={Logo} alt="Tweakster" />
            </Link>
            <Link
              to="/"
              className={classes['title-link']}
              onClick={() => setShowMenu(false)}
            >
              <h1 className={classes.company}>tweakster</h1>
            </Link>
          </div>
        </div>
        <SearchBar />
        <nav className={classes['navbar-nav']}>
          {/* {token && (
            <NavLink to="messages" className={classes['icon-button']}>
              <RiChat3Line />
            </NavLink>
          )} */}
          {token && (
            <NavLink to="new" className={classes['icon-button']}>
              <RiAddFill />
            </NavLink>
          )}
          {token && (
            <NavLink
              reloadDocument
              to="notifications"
              className={classes['icon-button']}
            >
              <RiNotification3Line />
              {hasNewNotifications && (
                <span className={classes['notification-dot']}></span>
              )}
            </NavLink>
          )}
          {!token && (
            <LoginButton onClick={() => handleModalToggle('login')}>
              Log In
            </LoginButton>
          )}
          {!token && (
            <SignupButton onClick={() => handleModalToggle('signup')}>
              Sign Up
            </SignupButton>
          )}
          <div className={classes['dropdown-container']} ref={dropdownRef}>
            <button
              className={classes['dropdown-button']}
              onClick={handleMenuToggle}
            >
              {token ? (
                <div className={classes['user-avatar']}>
                  <img
                    src={user?.avatar_url || defaultAvatar}
                    alt={`${user?.username}'s Avatar`}
                    className={classes['avatar-image']}
                  />
                  <span className={classes.username}>{user?.username}</span>
                </div>
              ) : (
                <RiUserLine />
              )}
              <RiArrowDownSLine />
            </button>
            {showMenu && (
              <div className={classes['dropdown-menu']}>
                {token && userRole === 'admin' && (
                  <NavLink
                    to={`admin`}
                    className={({ isActive }) =>
                      isActive ? classes.active : undefined
                    }
                    end
                    onClick={() => setShowMenu(false)}
                  >
                    <RiDashboardLine />
                    <span>Admin</span>
                  </NavLink>
                )}
                {token && (
                  <NavLink
                    to={`users/${userId}`}
                    className={({ isActive }) =>
                      isActive ? classes.active : undefined
                    }
                    end
                    onClick={() => setShowMenu(false)}
                  >
                    <RiUserLine />
                    <span>Profile</span>
                  </NavLink>
                )}
                <NavLink
                  to="about"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                  end
                  onClick={() => setShowMenu(false)}
                >
                  <RiInformationLine />
                  <span>About</span>
                </NavLink>
                <a
                  href="mailto:support@tweakster.com"
                  className={classes['support-link']}
                  onClick={() => setShowMenu(false)}
                >
                  <RiQuestionLine />
                  <span>Support</span>
                </a>
                {!token && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleModalToggle('login');
                    }}
                  >
                    <RiLoginBoxLine />
                    <span>Log In/Sign Up</span>
                  </button>
                )}
                {token && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                  >
                    <RiLogoutBoxLine />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>
      {/* <img src={Banner} className={classes.banner} alt="Banner" /> */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      {showModal && (
        <AuthModal authType={authType} onClick={handleModalToggle} />
      )}
    </>
  );
};

export default MainNavigation;
