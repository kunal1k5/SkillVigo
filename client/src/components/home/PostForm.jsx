import { useRef, useState } from 'react';

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

export default function PostForm({ user, onPost }) {
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageName, setImageName] = useState('');
  const fileInputRef = useRef(null);

  const clearImageSelection = () => {
    setImagePreview('');
    setImageName('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      clearImageSelection();
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(`${reader.result || ''}`);
      setImageName(file.name);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage && !imagePreview) {
      return;
    }

    onPost({
      text: trimmedMessage,
      image: imagePreview,
    });

    setMessage('');
    clearImageSelection();
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-soft backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-xs font-semibold text-white">
          {getInitials(user.name)}
        </div>
        <div className="flex-1 space-y-4">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share an update, ask for help, or post a new skill highlight"
            rows={4}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
          />

          {imagePreview ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img src={imagePreview} alt="Post preview" className="max-h-80 w-full object-cover" />
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="truncate text-xs font-semibold text-slate-500">{imageName}</p>
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
          <label className="cursor-pointer rounded-full border border-slate-200 px-3 py-1.5 transition hover:border-blue-200 hover:text-blue-700">
            Upload Image
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {imageName && <span className="text-slate-400">{imageName}</span>}
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
