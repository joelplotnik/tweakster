import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import classes from './AdminPage.module.css';

const AdminPage = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <div className={classes['admin-container']}>
      <h2 className={classes.heading}>Admin Dashboard</h2>
      <p className={classes['welcome-message']}>Welcome, {user?.username}!</p>
      <nav>
        <ul className={classes['nav-list']}>
          <li>
            <Link to="/admin/reports" className={classes['nav-link']}>
              View Reports
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminPage;
