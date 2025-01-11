import { useState } from 'react'
import { Link } from 'react-router-dom'

import classes from './Tabs.module.css'

const Tabs = ({ tabs, initialActiveTab, onTabChange, isUsersPage }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || tabs[0]?.key)

  const handleTabClick = tabKey => {
    setActiveTab(tabKey)
    if (onTabChange) {
      onTabChange(tabKey)
    }
  }

  return (
    <div className={classes.tabs}>
      <div className={classes['tab-list']} role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${classes.tab} ${
              activeTab === tab.key ? classes.active : ''
            }`}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => handleTabClick(tab.key)}
          >
            <span className={classes.icon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      {isUsersPage && activeTab === 'attempts' && (
        <>
          <hr className={classes.divider} />
          <Link to="pending-attempts" className={classes.link}>
            View Pending Attempts
          </Link>
        </>
      )}
      <div className={classes['tab-content']}>
        {tabs.find(tab => tab.key === activeTab)?.content}
      </div>
    </div>
  )
}

export default Tabs
