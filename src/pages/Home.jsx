import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <HeroBanner />
      
      <div className="space-y-8 pt-8">
        <MovieRow title="Featured Movies" />
        <MovieRow title="Action Movies" />
        <MovieRow title="Animation" />
        <MovieRow title="Adventure" />
      </div>
    </div>
  );
}
