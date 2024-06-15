import { useRouteLoaderData } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { API_URL } from '../../../constants/constants';
import { channelPageActions } from '../../../store/channel-page';

import classes from './SubscribeButton.module.css';

const SubscribeButton = ({ channelId, isSubscribed, subscriberCount }) => {
  const token = useRouteLoaderData('root');
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);

  const handleSubscribe = async () => {
    try {
      const payload = {
        channel_id: channelId,
      };

      const response = await fetch(
        `${API_URL}/channels/${channelId}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      dispatch(channelPageActions.updateSubscribedState(true));
      dispatch(channelPageActions.updateSubscriberCount(subscriberCount + 1));
    } catch (error) {
      console.error('Error: ', error.message);
      toast.error('Error subscribing');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const payload = {
        channel_id: channelId,
      };

      const response = await fetch(
        `${API_URL}/channels/${channelId}/unsubscribe`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      dispatch(channelPageActions.updateSubscribedState(false));
      dispatch(channelPageActions.updateSubscriberCount(subscriberCount - 1));
    } catch (error) {
      console.error('Error: ', error.message);
      toast.error('Error unsubscribing');
    }
  };

  const buttonContent = isSubscribed
    ? isHovered
      ? 'Unsubscribe'
      : 'Subscribed'
    : 'Subscribe';

  return (
    <>
      <button
        className={classes.btn}
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {buttonContent}
      </button>
    </>
  );
};

export default SubscribeButton;
