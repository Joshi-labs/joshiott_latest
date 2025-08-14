import React, { useState, useEffect } from 'react';

const decodeJWT = (token) => {
  try {
    // Get the payload from the token
    const base64Url = token.split('.')[1]; 
    // Convert Base64Url to standard Base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Decode, handle UTF-8 characters, and parse
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
};

const AuthModal = ({ isOpen, onClose }) => {
  // State to manage which view is active: 'signIn', 'signUp', or 'userDetails'
  const [view, setView] = useState('signIn');
  
  // State for the authenticated user's data
  const [user, setUser] = useState(null);
  
  // State for the input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // fuck


  // Check for an existing session in localStorage when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('joshi-ott-token');
      if (token) {
        const userData = decodeJWT(token);
        if (userData) {
          setUser(userData);
          setView('userDetails');
        }
      } else {
        // If no token, reset to the sign-in view
        setView('signIn');
        setUser(null);
      }
    }
  }, [isOpen]);

  // Don't render the modal if it's not open
  if (!isOpen) return null;

  // --- Event Handlers --- //

const handleSignIn = async () => {
    // A simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    if (password.length < 8 || password.length > 60) {
        setError('Password must be between 8 and 60 characters.');
        return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://aws.vpjoshi.in/ott/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          projectId: "JoshiOTT"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign-in failed. Please check your credentials.');
      }
      
      const { token } = data;
      localStorage.setItem('joshi-ott-token', token);
      const userData = decodeJWT(token);
      
      // Add avatarSeed for the UI, as it's not in the token
      const enhancedUserData = { ...userData, name: userData.name || 'User', avatarSeed: userData.email };

      setUser(enhancedUserData);
      setView('userDetails');
      setEmail(''); 
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

const handlePerformSignUp = async () => {
// --- Start of new validation logic --- //

if (fullName.length > 60) {
    setError('Full name cannot exceed 60 characters.');
    return;
}

// A simple regex for basic email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    if (password.length < 8 || password.length > 60) {
        setError('Password must be between 8 and 60 characters.');
        return;
    }

    // Regex to check if the mobile number is exactly 10 digits
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
        setError('Mobile number must be exactly 10 digits.');
        return;
    }

    // Check if any field is empty after trimming whitespace
    if (!fullName.trim() || !email.trim() || !password.trim() || !mobile.trim()) {
        setError('Please fill out all fields.');
        return;
    }

    // --- End of new validation logic --- //

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://aws.vpjoshi.in/ott/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          fullName: fullName,
          mobileNumber: mobile, // API expects 'mobileNumber'
          projectId: "JoshiOTT"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign-up failed. The user might already exist.');
      }
      
      const { token } = data;
      localStorage.setItem('joshi-ott-token', token);
      const userData = decodeJWT(token);
      
      const enhancedUserData = { ...userData, name: userData.name || fullName, avatarSeed: userData.email };

      setUser(enhancedUserData);
      setView('userDetails');
      // Clear all fields
      setFullName('');
      setEmail('');
      setPassword('');
      setMobile('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('joshi-ott-token');
    setUser(null);
    setView('signIn');
    setError('');
  };

  // --- View Renderers --- //

  const renderSignInView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Welcome back! Please sign in to continue. You can use the Guest ID.
      </p>

      <div className="space-y-4 mb-4">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
        <input type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
      </div>
      
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <p className="text-sm text-gray-500 mb-6"><strong>Guest ID :</strong> guest@example.com / password123</p>

      <div className="flex flex-col space-y-3">
        <button onClick={handleSignIn} className="w-full px-6 py-3 rounded-md text-white font-semibold bg-red-600 hover:bg-red-700 transition duration-200">  {isLoading ? 'Signing In...' : 'Sign In'}</button>
        <p className="text-center text-gray-600">
          New here?{' '}
          <button onClick={() => { setView('signUp'); setError(''); }} className="font-semibold text-red-600 hover:underline">Create an account</button>
        </p>
      </div>
    </>
  );

  const renderSignUpView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <p className="text-gray-600 mb-6">Join us! It only takes a minute.</p>
      <div className="space-y-4 mb-4">
        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
        <input type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
        <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
      </div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <div className="flex flex-col space-y-3">
        <button onClick={handlePerformSignUp} className="w-full px-6 py-3 rounded-md text-white font-semibold bg-red-600 hover:bg-red-700 transition">Sign Up</button>
        <p className="text-center text-gray-600">
          Already have an account?{' '}
          <button onClick={() => { setView('signIn'); setError(''); }} className="font-semibold text-red-600 hover:underline">Sign In</button>
        </p>
      </div>
    </>
  );

  const renderUserDetailsView = () => {
    const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.avatarSeed}`;
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Account Details</h2>
           <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <img src={avatarUrl} alt="User Avatar" className="h-20 w-20 rounded-full bg-gray-200 border-2 border-gray-400" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/80x80/cccccc/ffffff?text=User'; }} />
          <div>
            <p className="text-xl font-semibold text-gray-800">{user.name}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <p className="text-gray-600 mb-8">Welcome back! You can continue browsing or manage your account settings from your profile page.</p>
        <div className="flex justify-end">
          <button onClick={handleSignOut} className="px-6 py-3 rounded-md text-white font-semibold bg-gray-700 hover:bg-gray-800 transition">Sign Out</button>
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch(view) {
        case 'signIn':
            return renderSignInView();
        case 'signUp':
            return renderSignUpView();
        case 'userDetails':
            return renderUserDetailsView();
        default:
            return renderSignInView();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-5000 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out">
        {renderContent()}
      </div>
    </div>
  );
};

export default AuthModal;
