import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import MyList from './pages/MyList';
import Search from './pages/Search';
import Watching from './pages/Watching';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mylist" element={<MyList />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watch/:id" element={<Watching />} />
      </Routes>
    </ErrorBoundary>
  );
}
