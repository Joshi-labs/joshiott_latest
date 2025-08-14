import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import { useCustomMovies } from '../hooks/useCustomMovies';

export default function Watching() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchlist, setWatchlist] = useState({});
  const { movies: customMovies, loading: customLoading } = useCustomMovies();

  // Load watchlist from localStorage whenever the movie changes
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
  }, [movie]);

  // Handler to add/remove the current movie from the watchlist
  const handleWatchlistToggle = () => {
    if (!movie) return;
    const currentWatchlist = JSON.parse(localStorage.getItem('watchlist') || '{}');
    const updatedWatchlist = { ...currentWatchlist };

    if (updatedWatchlist[movie.id]) {
      delete updatedWatchlist[movie.id];
    } else {
      updatedWatchlist[movie.id] = movie;
    }
    
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    setWatchlist(updatedWatchlist); // Update state to reflect change immediately
  };

  const fetchMovieData = useCallback(() => {
    if (!id || customLoading) return;
    window.scrollTo(0, 0);
    setLoading(true);
    setIsPlaying(false);
    const movieData = customMovies.find(m => m.resource_name === id);
    if (movieData) {
      setMovie(movieData);
      const otherMovies = customMovies.filter(m => m.resource_name !== id);
      setRecommendations(otherMovies);
    }
    setLoading(false);
  }, [id, customLoading, customMovies]);

  useEffect(() => {
    fetchMovieData();
  }, [id, fetchMovieData]);

  if (loading || customLoading) {
    return <div className="bg-zinc-900 min-h-screen" />;
  }

  if (!movie) {
    return (
        <div className="bg-zinc-900 min-h-screen text-white flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
            <Link to="/" className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                Return Home
            </Link>
        </div>
    );
  }

  // Check if the current movie is in the watchlist
  const inWatchlist = movie ? Boolean(watchlist[movie.id]) : false;
  const { title, description, background, resource_name, release_date, vote_average } = movie;
  const videoSrc = `https://aws.vpjoshi.in/ott/stream/${resource_name}/master.m3u8`;

  return (
    <div className="bg-zinc-900 min-h-screen text-white">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 lg:flex lg:gap-x-8">
            <div className="lg:w-[calc(100%-24rem)]">
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg shadow-black/30 aspect-video">
                    {isPlaying ? (
                        <VideoPlayer src={videoSrc} />
                    ) : (
                        <div className="absolute inset-0 w-full h-full group">
                            <img
                                src={background || 'https://via.placeholder.com/1920x1080'}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-colors group-hover:bg-black/60">
                                <button
                                    onClick={() => setIsPlaying(true)}
                                    className="text-white transform transition-transform duration-300 group-hover:scale-110"
                                    aria-label={`Play ${title}`}
                                >
                                    <svg className="h-20 w-20 drop-shadow-lg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="py-6 border-b border-zinc-700/50">
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">{title}</h1>
                    <div className="flex items-center space-x-4 text-zinc-400 mb-4">
                        <span>{release_date}</span>
                        <span className="flex items-center">
                            <svg className="h-4 w-4 text-yellow-400 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {vote_average}
                        </span>
                        <button
                            onClick={handleWatchlistToggle}
                            className="flex items-center text-zinc-400 hover:text-white transition-colors duration-200"
                            aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                        >
                            <svg className={`h-5 w-5 mr-1.5 transition-colors ${inWatchlist ? 'text-red-500' : 'text-zinc-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                        </button>
                    </div>

                    <p className="text-zinc-300 leading-relaxed max-w-3xl"><b>Description</b>: {description}</p>
                    <p className="text-zinc-300 leading-relaxed max-w-3xl"><b>Note</b>: 30 Mins / Day is free then. You have to Sign in. You can use Guest ID.</p>
                    <p className="text-zinc-300 leading-relaxed max-w-3xl"><b>Note</b>: If you dont see anything even with guest id then guest id quota has been reached. Sign up or wait 24 hours.</p>

                </div>
            </div>

            <aside className="lg:w-96 flex-shrink-0 mt-8 lg:mt-0">
                <h2 className="text-xl font-semibold mb-4 text-white">More Like This</h2>
                <div className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                    {recommendations.map((rec) => (
                    <Link to={`/watch/${rec.resource_name}`} key={rec.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors duration-200 group">
                        <img
                            src={rec.background || 'https://via.placeholder.com/300x150'}
                            alt={rec.title}
                            className="w-40 h-24 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-md text-white line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">{rec.title}</h3>
                            <p className="text-sm text-zinc-400 mt-1">{rec.release_date}</p>
                        </div>
                    </Link>
                    ))}
                </div>
            </aside>
        </div>
      </main>
    </div>
  );
}