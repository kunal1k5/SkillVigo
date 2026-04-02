import { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { SKILL_CATEGORIES } from './skillCatalog';

const defaultData = {
  title: '',
  description: '',
  category: SKILL_CATEGORIES[0].label,
  level: 'beginner',
  mode: 'Local meetup',
  price: '',
  duration: '',
  area: '',
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
        level: initialData.level || 'beginner',
        mode: initialData.mode || 'Local meetup',
        price: initialData.price ?? '',
        duration: initialData.duration ?? '',
        area: initialData.area || '',
        serviceRadius: initialData.serviceRadius || '10 km',
        availability: Array.isArray(initialData.availability)
          ? initialData.availability.join(', ')
          : initialData.availability || '',
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
      await onSubmit({
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        availability: formData.availability
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
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
      style={{
        display: 'grid',
        gap: '18px',
        width: '100%',
      }}
    >
      <section
        style={{
          borderRadius: '28px',
          padding: '22px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
          display: 'grid',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gap: '6px' }}>
          <h2
            style={{
              margin: 0,
              color: '#0f172a',
              fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
              fontFamily: '"Sora", "Segoe UI", sans-serif',
            }}
          >
            Add your local skill
          </h2>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
            SkillVigo par normal people bhi apni useful skill list kar sakte hain, bas title clear aur offer practical hona chahiye.
          </p>
        </div>

        <div
          style={{
            borderRadius: '20px',
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.04)',
            display: 'grid',
            gap: '10px',
          }}
        >
          <strong style={{ color: '#0f172a' }}>{selectedCategory.label}</strong>
          <span style={{ color: '#475569', lineHeight: 1.6 }}>{selectedCategory.description}</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedCategory.sampleSkills.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, title: name }))}
                style={{
                  border: '1px solid rgba(37, 99, 235, 0.14)',
                  borderRadius: '999px',
                  padding: '8px 11px',
                  background: 'rgba(37, 99, 235, 0.06)',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          borderRadius: '28px',
          padding: '22px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
          display: 'grid',
          gap: '14px',
        }}
      >
        <Input
          label="Skill title"
          name="title"
          value={formData.title}
          placeholder="Example: Spoken English practice"
          onChange={handleChange}
          required
        />

        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Category</span>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 12px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
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
                borderRadius: '12px',
                border: '1px solid #d1d5db',
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

        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Delivery mode</span>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 12px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
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
            label="Area / locality"
            name="area"
            value={formData.area}
            placeholder="Example: Indirapuram"
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
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
            label="Duration (minutes)"
            name="duration"
            type="number"
            min="15"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Example: 60"
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Service radius</span>
            <select
              name="serviceRadius"
              value={formData.serviceRadius}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 12px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
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
            label="Availability"
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
              borderRadius: '14px',
              border: '1px solid #d1d5db',
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
            style={{ fontSize: '14px' }}
          />
        </div>
      </section>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Button
          type="submit"
          disabled={isSubmitting}
          style={{
            minWidth: '160px',
            background: 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)',
            border: 'none',
            boxShadow: '0 16px 28px rgba(37, 99, 235, 0.16)',
          }}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update skill' : 'Publish skill'}
        </Button>

        <span style={{ alignSelf: 'center', color: '#475569', lineHeight: 1.6 }}>
          Keep the title short, local area clear, and offer practical so nearby users trust it fast.
        </span>
      </div>
    </form>
  );
}
