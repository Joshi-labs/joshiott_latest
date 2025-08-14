import { useState, useEffect, useCallback, useRef } from 'react';
import MovieCard from './MovieCard';
import { useCustomMovies } from '../hooks/useCustomMovies';

export default function MovieRow({ title, onLoad }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(true);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);
  const { movies: customMovies, loading: customLoading } = useCustomMovies();

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scroll = useCallback((direction) => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (!customLoading) {
      // Randomize the movies for each row
      const shuffled = [...customMovies].sort(() => Math.random() - 0.5);
      setMovies(shuffled.slice(0, 9));
      setLoading(false);
    }
    if (onLoad) {
      onLoad();
    }
  }, [customLoading, customMovies]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      return () => scrollContainerRef.current?.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 px-4 md:px-6">{title}</h2>
        <div className="flex space-x-4 overflow-x-scroll scrollbar-hide px-4 md:px-6 pb-4">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="w-[200px] md:w-[250px] flex-shrink-0 mx-2">
              <div className="w-full h-[100px] md:h-[125px] bg-neutral-800 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 relative">
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 px-4 md:px-6">{title}</h2>
      
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-[60%] transform -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full ml-2 opacity-100 transition-opacity duration-300 hover:bg-black/70"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-[60%] transform -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full mr-2 opacity-100 transition-opacity duration-300 hover:bg-black/70"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="relative overflow-hidden px-4 md:px-6">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-scroll scrollbar-hide pb-4 pt-4"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="w-[200px] md:w-[250px] flex-shrink-0 mx-2 ">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 