import CommentBox from './CommentBox';

function getInitials(name = '') {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'SV';
  }

  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

export default function PostCard({ post }) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
          {getInitials(post.author.name)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{post.author.name}</p>
              <p className="text-xs text-slate-500">{post.author.role}</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{post.time}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{post.content}</p>
        </div>
      </div>

      {post.image ? (
        <div className="mt-4 overflow-hidden rounded-xl">
          <img src={post.image} alt="Post media" className="h-48 w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
        <button type="button" className="rounded-full px-3 py-1 hover:bg-slate-100">
          Like {post.likes}
        </button>
        <button type="button" className="rounded-full px-3 py-1 hover:bg-slate-100">
          Comment
        </button>
        <button type="button" className="rounded-full px-3 py-1 hover:bg-slate-100">
          Share
        </button>
      </div>

      <CommentBox comments={post.comments} />
    </article>
  );
}
