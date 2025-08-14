import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_KEY = 'joshiott_watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem(WATCHLIST_KEY);
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        setWatchlist(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error parsing watchlist from localStorage:', error);
        setWatchlist([]);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = useCallback((movie) => {
    setWatchlist(prev => {
      // Check if movie already exists in watchlist
      const exists = prev.some(item => item.id === movie.id);
      if (exists) {
        return prev; // Don't add if already exists
      }
      return [...prev, movie];
    });
  }, []);

  const removeFromWatchlist = useCallback((movieId) => {
    setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
  }, []);

  const isInWatchlist = useCallback((movieId) => {
    return watchlist.some(movie => movie.id === movieId);
  }, [watchlist]);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
  };
}; 