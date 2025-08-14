import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { useCustomMovies } from '../hooks/useCustomMovies';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { movies: customMovies, loading: customLoading } = useCustomMovies();
  
  const query = searchParams.get('q') || '';

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (customLoading) {
      setLoading(true);
      return;
    }

    setLoading(true);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Search through custom movies with fuzzy matching
      const results = customMovies.filter(movie => {
        const searchLower = searchQuery.toLowerCase();
        const titleLower = movie.title.toLowerCase();
        const descriptionLower = movie.description.toLowerCase();
        
        // Check if any part of the search query matches the title or description
        const searchWords = searchLower.split(' ').filter(word => word.length > 0);
        
        return searchWords.some(word => 
          titleLower.includes(word) || 
          descriptionLower.includes(word) ||
          movie.title.toLowerCase().includes(searchLower) ||
          movie.description.toLowerCase().includes(searchLower)
        );
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [customMovies, customLoading]);

  const handleSearch = useCallback((newQuery) => {
    setSearchParams({ q: newQuery });
  }, [setSearchParams]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="pt-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            {query ? `Search Results for "${query}"` : 'Search Movies'}
          </h1>
          
          {(loading || customLoading) && (
            <div className="flex justify-center items-center py-8">
              <div className="loading-spinner"></div>
            </div>
          )}
          
          {!loading && !customLoading && query && searchResults.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg mb-4">
                No movies found for "{query}"
              </p>
              <p className="text-gray-500 text-sm">
                Try searching for: Deadpool, Avengers, Interstellar, Minions, etc.
              </p>
            </div>
          )}
          
          {!loading && searchResults.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-400 mb-4">
                Found {searchResults.length} movie{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map((movie) => (
                  <div key={movie.id} className="w-full">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!query && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg mb-4">
                Search for your favorite movies
              </p>
              <p className="text-gray-500 text-sm">
                Try searching for: Deadpool, Avengers, Interstellar, Minions, etc.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}