import { useState } from 'react';

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

export default function CreatePost({ user, onPost }) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    onPost(trimmed);
    setMessage('');
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-soft backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-xs font-semibold text-white">
          {getInitials(user.name)}
        </div>
        <div className="flex-1">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Start a post"
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1.5 hover:border-blue-200 hover:text-blue-700"
          >
            Add Skill
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1.5 hover:border-blue-200 hover:text-blue-700"
          >
            Upload Image
          </button>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-gradient-to-r from-slate-900 via-blue-700 to-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          Post
        </button>
      </div>
    </div>
  );
}
