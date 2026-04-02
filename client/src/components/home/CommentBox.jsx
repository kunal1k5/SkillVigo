export default function CommentBox({ comments }) {
  if (!comments.length) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">
      {comments.map((comment) => (
        <div key={comment.id} className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{comment.name}</span>
          <span className="ml-2">{comment.text}</span>
        </div>
      ))}
    </div>
  );
}
