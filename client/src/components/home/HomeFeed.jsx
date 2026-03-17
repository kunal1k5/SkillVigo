import CreatePost from './CreatePost';
import FeedSkeleton from './FeedSkeleton';
import PostCard from './PostCard';

export default function HomeFeed({ user, loading, posts, onPost }) {
  return (
    <section className="space-y-5">
      <CreatePost user={user} onPost={onPost} />

      {loading ? (
        <FeedSkeleton />
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </section>
  );
}
