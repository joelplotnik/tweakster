import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useRouteLoaderData } from 'react-router-dom';
import { RiSendPlaneLine } from 'react-icons/ri';

import { API_URL } from '../../constants/constants';
import { getUserData } from '../../util/auth';
import { CableContext } from '../../context/cable';

import classes from './ConversationPage.module.css';

const ConversationPage = () => {
  const { cable } = useContext(CableContext);
  const { id: convoId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const token = useRouteLoaderData('root');
  const userData = getUserData();
  const userId = userData ? parseInt(userData.userId) : null;

  useEffect(() => {
    // Subscribe to WebSocket channel when component mounts
    const subscription = cable.subscriptions.create(
      { channel: 'MessagesChannel' },
      {
        received: (data) => {
          // Handle incoming WebSocket message
          setMessages((prevMessages) => [...prevMessages, data]);
        },
      }
    );

    // Unsubscribe when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [cable, token]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`${API_URL}/conversations/${convoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversation');
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    fetchConversation();
  }, [token, convoId]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      return;
    }

    const newMessage = {
      receiver_id: convoId,
      body: message.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      setMessage('');
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.heading}>(Avatar) Username</h1>
      <hr className={classes.divider} />
      <div ref={chatContainerRef} className={classes['chat-container']}>
        <ul className={classes.chat}>
          {messages.map((message) => (
            <li
              key={message.id}
              className={`${classes.message} ${
                message.sender_id === userId
                  ? classes['your-message']
                  : classes['other-message']
              }`}
            >
              <span className={classes['message-content']}>{message.body}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={classes['input-container']}>
        <textarea
          value={message}
          onChange={handleMessageChange}
          placeholder="Message..."
          className={classes.input}
        />
        <button onClick={handleSendMessage} className={classes.button}>
          <RiSendPlaneLine className={classes.icon} />
        </button>
      </div>
    </div>
  );
};

export default ConversationPage;
