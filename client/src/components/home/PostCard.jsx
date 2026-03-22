import { useEffect, useRef, useState } from 'react';
import CommentBox from './CommentBox';
import { createShareLink, formatRelativeTime } from './homeHelpers';

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

export default function PostCard({ post, currentUserId, onToggleLike, onAddComment }) {
  const [commentText, setCommentText] = useState('');
  const [shareLabel, setShareLabel] = useState('Share');
  const commentInputRef = useRef(null);
  const isLiked = post.likedBy.includes(currentUserId);

  useEffect(() => {
    if (shareLabel === 'Share') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShareLabel('Share');
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shareLabel]);

  const handleCommentSubmit = () => {
    const wasAdded = onAddComment(post.id, commentText);

    if (wasAdded) {
      setCommentText('');
    }
  };

  const handleShare = async () => {
    const shareLink = createShareLink(post.id);

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setShareLabel('Copied');
        return;
      } catch {
        // Fall back to a manual copy prompt below.
      }
    }

    window.prompt('Copy this post link', shareLink);
    setShareLabel('Ready');
  };

  return (
    <article
      id={post.id}
      className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
          {getInitials(post.user.name)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{post.user.name}</p>
              <p className="text-xs text-slate-500">{post.user.role}</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
          {post.text ? <p className="mt-3 text-sm leading-relaxed text-slate-700">{post.text}</p> : null}
        </div>
      </div>

      {post.image ? (
        <div className="mt-4 overflow-hidden rounded-xl">
          <img src={post.image} alt="Post media" className="h-48 w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
        <button
          type="button"
          onClick={() => onToggleLike(post.id)}
          className={`rounded-full px-3 py-1.5 transition ${
            isLiked ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100'
          }`}
        >
          {isLiked ? 'Unlike' : 'Like'} {post.likes}
        </button>
        <button
          type="button"
          onClick={() => commentInputRef.current?.focus()}
          className="rounded-full px-3 py-1.5 transition hover:bg-slate-100"
        >
          Comment {post.comments.length}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full px-3 py-1.5 transition hover:bg-slate-100"
        >
          {shareLabel}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={commentInputRef}
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleCommentSubmit();
              }
            }}
            placeholder="Write a comment"
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCommentSubmit}
            className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Add Comment
          </button>
        </div>

        <CommentBox comments={post.comments} />
      </div>
    </article>
  );
}
