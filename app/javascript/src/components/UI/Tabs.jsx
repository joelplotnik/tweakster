import { useState } from 'react'

import classes from './Tabs.module.css'

const Tabs = ({ tabs, initialActiveTab, onTabChange }) => {
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
      <div className={classes['tab-content']}>
        {tabs.find(tab => tab.key === activeTab)?.content}
      </div>
    </div>
  )
}

export default Tabs
