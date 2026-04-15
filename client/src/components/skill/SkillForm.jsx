import { useEffect, useMemo, useState } from 'react';
import Input from '../common/Input';
import { SKILL_CATEGORIES } from './skillCatalog';

const defaultData = {
  title: '',
  description: '',
  category: SKILL_CATEGORIES[0].label,
  level: 'all levels',
  mode: 'Local meetup',
  price: '',
  experience: '',
  location: '',
  serviceRadius: '10 km',
  availability: '',
  tags: '',
};

export default function SkillForm({ onSubmit, onDataChange, initialData }) {
  const [formData, setFormData] = useState(defaultData);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || SKILL_CATEGORIES[0].label,
        level: initialData.level || 'all levels',
        mode: initialData.mode || 'Local meetup',
        price: initialData.price ?? '',
        experience: initialData.experience ?? '',
        location: initialData.location || initialData.area || '',
        serviceRadius: initialData.serviceRadius || '10 km',
        availability: initialData.availability || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    onDataChange?.({
      ...formData,
      imageFileName: imageFile?.name || '',
    });
  }, [formData, imageFile, onDataChange]);

  const selectedCategory = useMemo(
    () => SKILL_CATEGORIES.find((category) => category.label === formData.category) || SKILL_CATEGORIES[0],
    [formData.category],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!onSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedPrice = Number(formData.price);
      const parsedExperience = Number(formData.experience);

      await onSubmit({
        ...formData,
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        experience: Number.isFinite(parsedExperience) ? parsedExperience : 0,
        location: formData.location.trim(),
        availability: formData.availability.trim(),
        tags: formData.tags
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        imageFileName: imageFile?.name || '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full gap-5"
    >
      <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="grid gap-1.5">
          <h2
            style={{
              margin: 0,
              color: '#0f172a',
              fontSize: 'clamp(1.25rem, 2.3vw, 1.65rem)',
              fontFamily: 'var(--sv-font-display)',
            }}
          >
            Add your local skill
          </h2>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.65 }}>
            Clean details improve two things: backend validation passes, and the listing is easier to understand on
            the search page.
          </p>
        </div>

        <div className="grid gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <strong style={{ color: '#0f172a' }}>{selectedCategory.label}</strong>
          <span style={{ color: '#475569', lineHeight: 1.6 }}>{selectedCategory.description}</span>
          <div className="flex flex-wrap gap-2">
            {selectedCategory.sampleSkills.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, title: name }))}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] sm:p-6">
        <Input
          label="Skill title"
          name="title"
          value={formData.title}
          placeholder="Example: Spoken English practice"
          onChange={handleChange}
          required
        />

        <div className="grid gap-3 md:grid-cols-2">
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Category</span>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 12px',
                borderRadius: '16px',
                border: '1px solid #d5dbe5',
                fontSize: '14px',
                color: '#111827',
                background: '#ffffff',
              }}
            >
              {SKILL_CATEGORIES.map((category) => (
                <option key={category.id} value={category.label}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Level</span>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 12px',
                borderRadius: '16px',
                border: '1px solid #d5dbe5',
                fontSize: '14px',
                color: '#111827',
                background: '#ffffff',
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all levels">All levels</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Delivery mode</span>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 12px',
                borderRadius: '16px',
                border: '1px solid #d5dbe5',
                fontSize: '14px',
                color: '#111827',
                background: '#ffffff',
              }}
            >
              <option value="Local meetup">Local meetup</option>
              <option value="Home visit">Home visit</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </label>

          <Input
            label="Location / locality"
            name="location"
            value={formData.location}
            placeholder="Example: Indirapuram"
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Price"
            name="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="Example: 800"
            required
          />

          <Input
            label="Experience (years)"
            name="experience"
            type="number"
            min="0"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Example: 2"
            required
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Service radius</span>
            <select
              name="serviceRadius"
              value={formData.serviceRadius}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 12px',
                borderRadius: '16px',
                border: '1px solid #d5dbe5',
                fontSize: '14px',
                color: '#111827',
                background: '#ffffff',
              }}
            >
              <option value="2 km">2 km</option>
              <option value="5 km">5 km</option>
              <option value="10 km">10 km</option>
              <option value="15 km">15 km</option>
              <option value="Online only">Online only</option>
            </select>
          </label>

          <Input
            label="Availability text"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            placeholder="Example: Mon 7 PM, Sat 11 AM"
          />
        </div>

        <Input
          label="Tags (comma separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Example: Figma, mobile UI, startup"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            placeholder="Describe what you teach or help with, and why someone nearby should hire you."
            onChange={handleChange}
            rows={5}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '16px',
              border: '1px solid #d5dbe5',
              outline: 'none',
              fontSize: '14px',
              resize: 'vertical',
              boxSizing: 'border-box',
              lineHeight: 1.6,
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            style={{ fontSize: '14px', color: '#334155' }}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-w-[170px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update skill' : 'Publish skill'}
        </button>

        <span style={{ alignSelf: 'center', color: '#475569', lineHeight: 1.6 }}>
          Required fields are mapped exactly to backend schema to avoid save errors.
        </span>
      </div>
    </form>
  );
}
