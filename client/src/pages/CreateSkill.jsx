import { useState } from 'react';
import { Link } from 'react-router-dom';
import SkillCard from '../components/skill/SkillCard';
import SkillForm from '../components/skill/SkillForm';
import { SKILL_CATEGORIES, SUGGESTED_SKILL_NAMES } from '../components/skill/skillCatalog';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import { createSkill } from '../services/skillService';

function normalizeText(value) {
  return `${value || ''}`.trim();
}

function normalizeTags(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags.map((item) => normalizeText(item)).filter(Boolean);
  }

  return normalizeText(rawTags)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSkillPayload(skillData = {}) {
  return {
    title: normalizeText(skillData.title),
    description: normalizeText(skillData.description),
    category: normalizeText(skillData.category),
    location: normalizeText(skillData.location),
    mode: normalizeText(skillData.mode),
    level: normalizeText(skillData.level),
    availability: normalizeText(skillData.availability),
    serviceRadius: normalizeText(skillData.serviceRadius),
    price: Number(skillData.price),
    experience: Number(skillData.experience),
    tags: normalizeTags(skillData.tags),
    imageFileName: normalizeText(skillData.imageFileName),
  };
}

function validateSkillPayload(payload) {
  if (
    !payload.title ||
    !payload.description ||
    !payload.category ||
    !payload.location ||
    !Number.isFinite(payload.price) ||
    !Number.isFinite(payload.experience)
  ) {
    return 'Title, description, category, location, price, and experience are required.';
  }

  if (payload.price < 0) {
    return 'Price must be 0 or more.';
  }

  if (payload.experience < 0) {
    return 'Experience must be 0 or more.';
  }

  return '';
}

function buildPreviewSkill(draftSkill) {
  const tags = normalizeTags(draftSkill.tags);

  return {
    id: 'preview-skill',
    title: draftSkill.title || 'Your skill title will appear here',
    category: draftSkill.category || 'Community skill',
    instructorName: 'You',
    rating: 5,
    price: Number(draftSkill.price || 0),
    mode: draftSkill.mode || 'Local meetup',
    level: draftSkill.level || 'Beginner',
    distanceLabel: draftSkill.serviceRadius ? `Service radius: ${draftSkill.serviceRadius}` : 'Nearby service',
    area: draftSkill.location || 'Your locality',
    responseTime: 'Quick local replies',
    availability: draftSkill.availability || 'Add your slots',
    description:
      draftSkill.description ||
      'People near you will see this skill summary first, so keep it practical and trust-building.',
    tags: tags.length ? tags : ['Local skill', 'Community', 'Nearby'],
  };
}

export default function CreateSkill() {
  const [draftSkill, setDraftSkill] = useState({});
  const [savedSkill, setSavedSkill] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const previewSkill = buildPreviewSkill(draftSkill);

  const handleSubmit = async (skillData) => {
    const payload = buildSkillPayload(skillData);
    const validationError = validateSkillPayload(payload);

    if (validationError) {
      setErrorMessage(validationError);
      setStatusMessage('');
      return;
    }

    setStatusMessage('Publishing your listing...');
    setErrorMessage('');

    try {
      const createdSkill = await createSkill(payload);
      setSavedSkill(createdSkill);
      setStatusMessage(
        `${createdSkill.title} is live now. Search page par refresh ke baad sab users ko listing dikhegi.`,
      );
    } catch (requestError) {
      setErrorMessage(requestError.message);
      setStatusMessage('');
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pb-16 pt-4">
        <PageContainer>
          <div className="grid gap-6">
            <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
              <div className="absolute -left-20 -top-20 h-44 w-44 rounded-full bg-emerald-100/80 blur-2xl" />
              <div className="absolute -bottom-16 right-0 h-36 w-36 rounded-full bg-sky-100/70 blur-2xl" />

              <div className="relative grid gap-4">
                <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Provider workspace
                </span>

                <div className="grid gap-2">
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 'clamp(1.7rem, 4vw, 2.7rem)',
                      lineHeight: 1.08,
                      fontFamily: 'var(--sv-font-display)',
                      color: '#0f172a',
                    }}
                  >
                    Publish a clear skill listing people can trust instantly.
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                    Is page ka flow backend schema ke saath aligned hai, isliye form submit predictable rahega aur
                    listing search feed me sahi render hogi.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open marketplace
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back to profile
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Step 1</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Fill required fields</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Step 2</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Publish to backend</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Step 3</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Visible in search feed</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-4">
              {statusMessage ? (
                <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-800">
                  {statusMessage}
                </section>
              ) : null}

              {errorMessage ? (
                <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700">
                  {errorMessage}
                </section>
              ) : null}

              <SkillForm onSubmit={handleSubmit} onDataChange={setDraftSkill} />
              </div>

              <aside className="grid content-start gap-4 xl:sticky xl:top-24 xl:self-start">
              {savedSkill ? (
                <section className="grid gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-[0_16px_32px_rgba(15,118,110,0.08)]">
                  <strong style={{ color: '#0f766e', fontSize: '1.05rem' }}>Skill saved in backend</strong>
                  <p style={{ margin: 0, color: '#115e59', lineHeight: 1.7 }}>
                    {savedSkill.title} API ke through save ho chuki hai. Search page se isse verify kar sakte ho.
                  </p>
                </section>
              ) : null}

              <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
                <div style={{ display: 'grid', gap: '6px' }}>
                  <h2
                    style={{
                      margin: 0,
                      color: '#0f172a',
                      fontSize: '1.2rem',
                      fontFamily: 'var(--sv-font-display)',
                    }}
                  >
                    Live preview
                  </h2>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                    Log tumhari skill ko roughly aise dekhenge.
                  </p>
                </div>

                <SkillCard skill={previewSkill} actionLabel="Preview only" />
              </section>

              <section className="grid gap-3 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
                <div style={{ display: 'grid', gap: '6px' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>Good starter skill names</h3>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                    Yahan se idea le lo, baad me real users apne titles khud daalenge.
                  </p>
                </div>

                <div className="grid gap-2.5">
                  {SKILL_CATEGORIES.slice(0, 4).map((category) => (
                    <div
                      key={category.id}
                      className="grid gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
                    >
                      <strong style={{ color: '#0f172a' }}>{category.label}</strong>
                      <span style={{ color: '#475569', lineHeight: 1.6 }}>
                        {category.sampleSkills.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-900 p-5 text-slate-50 shadow-[0_16px_36px_rgba(15,23,42,0.22)]">
                <div style={{ display: 'grid', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Quick naming guide</h3>
                  <p style={{ margin: 0, color: 'rgba(248, 250, 252, 0.72)', lineHeight: 1.6 }}>
                    Title ko vague mat rakho. Clear skill + use case likho.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILL_NAMES.slice(0, 8).map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-100"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </section>
              </aside>
            </section>
          </div>
        </PageContainer>
      </main>

      <Footer />
    </>
  );
}
