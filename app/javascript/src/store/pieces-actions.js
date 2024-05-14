import { API_URL } from '../constants/constants';
import { piecesActions } from './pieces';
import { getAuthToken } from '../util/auth';

export const fetchPieces = (page) => {
  return async (dispatch) => {
    try {
      const response = await fetch(`${API_URL}?page=${page}`);

      if (!response.ok) {
        throw new Error('Failed to fetch pieces');
      }

      const data = await response.json();

      await dispatch(piecesActions.setPieces(data));

      return {
        data,
        hasMore: data.length > 0,
      };
    } catch (error) {
      console.error('Error: ', error.message);
      return Promise.reject(new Error('Failed to fetch pieces'));
    }
  };
};

export const fetchChannelPieces = ({ channelId, page }) => {
  return async (dispatch) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/channels/${channelId}?page=${page}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pieces for this channel');
      }

      const data = await response.json();

      await dispatch(piecesActions.setPieces(data.pieces));

      return {
        data,
        hasMore: data.pieces.length > 0,
      };
    } catch (error) {
      console.error('Error: ', error.message);
      return Promise.reject(
        new Error('Failed to fetch pieces for this channel')
      );
    }
  };
};

export const fetchUserPieces = ({ userId, page }) => {
  return async (dispatch) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/users/${userId}?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pieces for this user');
      }

      const data = await response.json();

      await dispatch(piecesActions.setPieces(data.pieces));

      return {
        data,
        hasMore: data.pieces.length > 0,
      };
    } catch (error) {
      console.error('Error: ', error.message);
      return Promise.reject(new Error('Failed to fetch pieces for this user'));
    }
  };
};

export const fetchPersonalPieces = (page) => {
  return async (dispatch) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/personal_feed?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pieces');
      }

      const data = await response.json();

      await dispatch(piecesActions.setPieces(data));

      return {
        data,
        hasMore: data.length > 0,
      };
    } catch (error) {
      console.error('Error: ', error.message);
      return Promise.reject(new Error('Failed to fetch pieces'));
    }
  };
};
