import React, { useState, useRef, useEffect } from 'react';
import { RiShareBoxLine, RiShareForwardLine } from 'react-icons/ri';

import classes from './SharePopover.module.css';
import { Link } from 'react-router-dom';

const SharePopover = ({ url, type }) => {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);

  const handleCopyClick = (event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(url);
    setShowPopover(false);
  };

  const handlePopoverClick = (event) => {
    event.stopPropagation();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={classes['share-popover-container']}>
      {type === 'modal' && (
        <button
          className={classes['share-button']}
          onClick={(event) => {
            event.stopPropagation();
            setShowPopover(!showPopover);
          }}
        >
          <RiShareBoxLine />
        </button>
      )}
      {type === 'piece' && (
        <Link
          onClick={(event) => {
            event.stopPropagation();
            setShowPopover(!showPopover);
          }}
          className={`${classes.link} ${classes.share}`}
        >
          <RiShareForwardLine className={classes.icon} />
          <span className={classes.text}>Share</span>
        </Link>
      )}
      {type === 'page' && (
        <Link
          onClick={(event) => {
            event.stopPropagation();
            setShowPopover(!showPopover);
          }}
          className={`${classes.link}`}
        >
          <RiShareForwardLine className={classes.icon} />
          <span className={classes.text}>Share</span>
        </Link>
      )}
      {showPopover && (
        <div
          className={classes['share-popover']}
          ref={popoverRef}
          onClick={handlePopoverClick}
        >
          <input
            type="text"
            value={url}
            readOnly
            className={classes['popover-url-input']}
          />
          <button className={classes['copy-button']} onClick={handleCopyClick}>
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default SharePopover;
