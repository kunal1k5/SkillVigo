import PostForm from './PostForm';
import PostList from './PostList';

export default function HomeFeed({ user, posts, currentUserId, onPost, onToggleLike, onAddComment }) {
  return (
    <section className="space-y-5">
      <PostForm user={user} onPost={onPost} />
      <PostList
        posts={posts}
        currentUserId={currentUserId}
        onToggleLike={onToggleLike}
        onAddComment={onAddComment}
      />
    </section>
  );
}
