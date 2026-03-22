import { formatRelativeTime } from './homeHelpers';

export default function CommentBox({ comments }) {
  if (!comments.length) {
    return <p className="mt-4 text-sm text-slate-400">No comments yet. Start the conversation.</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-800">{comment.user.name}</span>
            <span className="text-xs font-semibold text-slate-400">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{comment.text}</p>
        </div>
      ))}
    </div>
  );
}
