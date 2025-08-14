import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';

export default function MyList() {
  const [watchlist, setWatchlist] = useState([]);

useEffect(() => {
  try {
    const stored = localStorage.getItem('watchlist');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert object values to array
      const moviesArray = Object.values(parsed);
      setWatchlist(moviesArray);
    }
  } catch {
    setWatchlist([]);
  }
}, []);


  const clearWatchlist = () => {
    localStorage.removeItem('watchlist');
    setWatchlist([]);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="pt-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">My List</h1>
            {watchlist.length > 0 && (
              <button
                onClick={clearWatchlist}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {watchlist.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-8">
                <svg className="w-24 h-24 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-2xl font-bold mb-4">Your List is Empty</h2>
                <p className="text-gray-400 text-lg mb-8">
                  Start building your watchlist by adding movies you want to watch later.
                </p>
              </div>
              
              <Link 
                to="/" 
                className="btn-primary inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Browse Movies
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
