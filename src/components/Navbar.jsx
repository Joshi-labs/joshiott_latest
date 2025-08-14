import { Link, useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import SignInModal from './SignInModal';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // State for the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // State for managing the visibility of the sign-in modal
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Callback function to open the sign-in modal
  const openSignInModal = useCallback(() => {
    setIsMobileMenuOpen(false); // Close mobile menu if open
    setIsSignInModalOpen(true);
  }, []);

  // Effect to close mobile menu on window resize if screen gets larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // Tailwind's 'md' breakpoint
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-2xl md:text-3xl font-bold tracking-wide">
            <span className="logo-joshi">JOSHI</span>
            <span className="logo-ott">OTT</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-white">
          <Link to="/" className="font-bold text-lg hover:text-red-500 transition-colors border-b-2 border-transparent hover:border-red-500 pb-1">
            Home
          </Link>
          <Link to="/mylist" className="font-bold text-lg hover:text-red-500 transition-colors border-b-2 border-transparent hover:border-red-500 pb-1">
            My List
          </Link>
          <a
            href="https://vpjoshi.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-lg hover:text-red-500 transition-colors border-b-2 border-transparent hover:border-red-500 pb-1"
          >
            Portfolio
          </a>
          <button
            onClick={openSignInModal}
            className="font-bold text-lg hover:text-red-500 transition-colors border-b-2 border-transparent hover:border-red-500 pb-1"
          >
            Sign In
          </button>
        </div>

        {/* Search Bar & Mobile Menu Icon Container */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search movies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 md:w-44 bg-neutral-800 text-white px-4 py-2 rounded-md border border-neutral-600 focus:border-red-500 focus:outline-none transition-colors text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Mobile Hamburger Menu Button*/}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <div className={`md:hidden fixed top-[68px] left-0 w-full z-5000 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="bg-black/90 mx-4 rounded-lg shadow-lg">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-white text-center py-3 px-4 text-base font-semibold hover:bg-neutral-800 transition-colors rounded-t-lg">Home</Link>
          <Link to="/mylist" onClick={() => setIsMobileMenuOpen(false)} className="block text-white text-center py-3 px-4 text-base font-semibold hover:bg-neutral-800 transition-colors">My List</Link>
          <a href="https://vpjoshi.in" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="block text-white text-center py-3 px-4 text-base font-semibold hover:bg-neutral-800 transition-colors">Portfolio</a>
          <button
            onClick={openSignInModal}
            className="w-full text-white text-center py-3 px-4 text-base font-semibold hover:bg-neutral-800 transition-colors rounded-b-lg"
          >
            Sign In
          </button>
        </div>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}