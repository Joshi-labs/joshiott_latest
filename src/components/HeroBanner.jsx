import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCustomMovies } from '../hooks/useCustomMovies';

export default function HeroBanner() {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { movies: customMovies, loading: customLoading } = useCustomMovies();

  const fetchFeaturedMovie = useCallback(async () => {
    setLoading(true);
    try {
      if (!customLoading && customMovies.length > 0) {
        // Always show Despicable Me 4
        const despicableMe = customMovies.find(movie => movie.id === 3);
        if (despicableMe) {
          setFeaturedMovie(despicableMe);
        } else {
          // Fallback to first movie if Despicable Me not found
          setFeaturedMovie(customMovies[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching featured movie:', error);
    } finally {
      setLoading(false);
    }
  }, [customLoading, customMovies]); // will fix the bg issue later ++ background: "/src/assets/Img/gru_head.jpg", and for mobile   |    background: "/src/assets/Img/gru_head_m.jpg",

  useEffect(() => {
    fetchFeaturedMovie();
  }, [fetchFeaturedMovie]);

  if (loading || !featuredMovie) {
    return (
      <div className="relative h-[70vh] w-full bg-neutral-900 flex items-center justify-center hero-image">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const { id, title, description, background, vote_average, release_date } = featuredMovie;
  
  const backdropUrl = "/src/assets/Img/gru_head.jpg" || 'https://via.placeholder.com/1920x1080/333/666?text=No+Image';

  const year = release_date ? new Date(release_date).getFullYear() : '';
  const rating = vote_average ? Math.round(vote_average * 10) / 10 : 'N/A';
  const truncatedDescription = description && description.length > 200 
    ? description.substring(0, 200) + '...' 
    : description;

  return (
    <div 
      className="relative h-[70vh] w-full bg-cover bg-center hero-image hero-background"
    >
      <div className="hero-overlay absolute inset-0" />
      
      <div className="absolute bottom-10 left-6 md:left-10 max-w-xl text-white space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          {title}
        </h1>
        
        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <span>{year}</span>
          <span className="flex items-center">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </span>
        </div>
        
        <p className="text-sm md:text-base text-gray-300 line-clamp-3">
          {truncatedDescription}
        </p>
        
        <Link 
          to={`/watch/dispicable_me_4`}
          className="btn-primary inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Watch Now
        </Link>
      </div>
    </div>
  );
}
