import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const [imageError, setImageError] = useState(false);
  const [watchlist, setWatchlist] = useState({});
  
  const { id, title, poster_path, vote_average, release_date } = movie;
  
  // Load watchlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('watchlist');
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing watchlist:', error);
        setWatchlist({});
      }
    }
  }, []);

  // Determine if current movie is in watchlist
  const inWatchlist = Boolean(watchlist[id]);
  
  const posterUrl = poster_path && !imageError
    ? poster_path
    : 'https://via.placeholder.com/300x150/333/666?text=No+Image';

  const year = release_date ? new Date(release_date).getFullYear() : '';
  const rating = vote_average ? Math.round(vote_average * 10) / 10 : 'N/A';

  const handleImageError = () => {
    setImageError(true);
  };

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // First get the current watchlist from localStorage
    const currentWatchlist = JSON.parse(localStorage.getItem('watchlist') || '{}');
    
    // Update the watchlist
    const updatedWatchlist = { ...currentWatchlist };
    if (updatedWatchlist[id]) {
      delete updatedWatchlist[id];
    } else {
      updatedWatchlist[id] = movie;
    }
    
    // Save back to localStorage
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    
    // Update local state
    setWatchlist(updatedWatchlist);
  };

  return (
    <div className="movie-card group cursor-pointer relative ">
      <Link to={`/watch/${movie.resource_name}`} className="block">
        <div className="relative overflow-hidden rounded-md hover:scale-105 transition-all duration-200 ease-in-out">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-[100px] md:h-[125px] object-cover transition-transform duration-300 hover:scale-115 "
            loading="lazy"
            onError={handleImageError}
          />
          <button
            onClick={handleWatchlistToggle}
            className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-black/70"
          >
            <svg
              className={`w-4 h-4 ${inWatchlist ? 'text-yellow-400' : 'text-white'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1">
              {title}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>{year}</span>
              <span className="flex items-center">
                <svg
                  className="w-3 h-3 text-yellow-400 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
