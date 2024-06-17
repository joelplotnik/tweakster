import React, { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';

import { API_URL } from '../../constants/constants';
import Tweak from './Tweak';
import SortDropdown from '../UI/SortDropdown';

import classes from './Tweaks.module.css';

const Tweaks = ({ piece, pieceClassModalRef }) => {
  const [tweaks, setTweaks] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState('top');
  const selectedSortOptionRef = useRef(selectedSortOption);
  const [isScrollableTargetAvailable, setScrollableTargetAvailable] =
    useState(false);

  useEffect(() => {
    if (pieceClassModalRef?.current || pieceClassModalRef === 'page') {
      setScrollableTargetAvailable(true);
    }
  }, [pieceClassModalRef]);

  const handleSortChange = useCallback(
    (option) => {
      if (option === selectedSortOptionRef.current) {
        return;
      }
      setTweaks([]); // Reset tweaks
      setSelectedSortOption(option);
      setPage(1);
      setHasMore(true);
    },
    [selectedSortOptionRef]
  );

  const fetchTweaks = async (currentPage) => {
    try {
      const response = await fetch(
        `${API_URL}/channels/${piece.channel_id}/pieces/${piece.id}/tweaks?page=${currentPage}&sort=${selectedSortOption}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pieces');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error: ', error.message);
      toast.error('Error fetching pieces');
    }
  };

  const fetchData = async () => {
    if (!isLoading) {
      setIsLoading(true);

      const tweaksFromServer = await fetchTweaks(page);

      if (tweaksFromServer) {
        if (selectedSortOption !== selectedSortOptionRef.current) {
          // If the selectedSortOption has changed, reset tweaks
          selectedSortOptionRef.current = selectedSortOption;
          setTweaks(tweaksFromServer);
        } else {
          // If the selectedSortOption is the same, append fetched data to existing tweaks.
          setTweaks((prevTweaks) => [...prevTweaks, ...tweaksFromServer]);
        }

        if (tweaksFromServer.length === 0) {
          setHasMore(false);
        }
        setPage(page + 1);
      }

      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes.tweaks}>
      {tweaks.length > 0 && (
        <SortDropdown
          onSortChange={handleSortChange}
          selectedSortOption={selectedSortOption}
        />
      )}
      {isScrollableTargetAvailable && (
        <div className={classes['tweak-layout']}>
          {tweaks.length === 0 && (
            <p className={classes.note}>Be the first to tweak this piece!</p>
          )}
          <InfiniteScroll
            dataLength={tweaks.length}
            next={fetchData}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            scrollableTarget={pieceClassModalRef?.current}
            endMessage={<span></span>}
          >
            {tweaks.map((tweak, index) => (
              <Tweak key={tweak.id} tweak={tweak} />
            ))}
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};

export default Tweaks;
