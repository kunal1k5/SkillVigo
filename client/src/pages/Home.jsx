import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageContainer from '../components/layout/PageContainer';
import useAuth from '../hooks/useAuth';
import HomeFeed from '../components/home/HomeFeed';
import SidebarLeft from '../components/home/SidebarLeft';
import SidebarRight from '../components/home/SidebarRight';
import { fetchHomeFeed } from '../components/home/homeData';
import { buildUserProfile } from '../components/home/homeHelpers';

export default function Home() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ skills: 0, bookings: 0, rating: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadFeed = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchHomeFeed();

        if (!active) {
          return;
        }

        setPosts(response.posts);
        setStats(response.stats);
        setSuggestions(response.suggestions);
        setTrending(response.trending);
      } catch (fetchError) {
        if (active) {
          setError(fetchError?.message || 'Unable to load the feed right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      active = false;
    };
  }, []);

  const user = useMemo(() => buildUserProfile(currentUser), [currentUser]);

  const handlePost = (message) => {
    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        name: user.name,
        role: user.role,
        avatar: '',
      },
      time: 'Just now',
      content: message,
      image: '',
      likes: 0,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-16 pt-6" style={{ backgroundColor: '#C7EABB' }}>
        <PageContainer className="space-y-6">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_300px]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SidebarLeft user={user} stats={stats} />
            </div>

            <HomeFeed user={user} loading={loading} posts={posts} onPost={handlePost} />

            <div className="lg:sticky lg:top-24 lg:self-start">
              <SidebarRight suggestions={suggestions} trending={trending} />
            </div>
          </section>
        </PageContainer>
      </main>
      <Footer />
    </>
  );
}
