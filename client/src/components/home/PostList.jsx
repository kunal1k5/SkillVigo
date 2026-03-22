import PostCard from './PostCard';

export default function PostList({ posts, currentUserId, onToggleLike, onAddComment }) {
  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-soft">
        <p className="text-lg font-semibold text-slate-900">No posts yet</p>
        <p className="mt-2 text-sm text-slate-500">
          Your next update will show up here with likes, comments, and image previews.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onToggleLike={onToggleLike}
          onAddComment={onAddComment}
        />
      ))}
    </div>
  );
}
