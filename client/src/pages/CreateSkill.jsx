import { useState } from 'react';
import { Link } from 'react-router-dom';
import SkillCard from '../components/skill/SkillCard';
import SkillForm from '../components/skill/SkillForm';
import { SKILL_CATEGORIES, SUGGESTED_SKILL_NAMES } from '../components/skill/skillCatalog';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { createSkill } from '../services/skillService';

function buildPreviewSkill(draftSkill) {
  return {
    id: 'preview-skill',
    title: draftSkill.title || 'Your skill title will appear here',
    category: draftSkill.category || 'Community skill',
    instructorName: 'You',
    rating: 5,
    price: Number(draftSkill.price || 0),
    mode: draftSkill.mode || 'Local meetup',
    level: draftSkill.level || 'Beginner',
    distanceLabel: draftSkill.serviceRadius ? `${draftSkill.serviceRadius} service range` : 'Nearby service',
    area: draftSkill.area || 'Your locality',
    responseTime: 'Quick local replies',
    availability: draftSkill.availability || 'Add your slots',
    accent: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
    description:
      draftSkill.description ||
      'People near you will see this skill summary first, so keep it practical and trust-building.',
    tags: draftSkill.tags
      ? draftSkill.tags
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : ['Local skill', 'Community', 'Nearby'],
  };
}

export default function CreateSkill() {
  const [draftSkill, setDraftSkill] = useState({});
  const [savedSkill, setSavedSkill] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const previewSkill = buildPreviewSkill(draftSkill);

  const handleSubmit = async (skillData) => {
    setStatusMessage('Saving your skill to the backend...');
    setErrorMessage('');

    try {
      const createdSkill = await createSkill(skillData);
      setSavedSkill(createdSkill);
      setStatusMessage(
        `${createdSkill.title} saved successfully. Search page par refresh ke baad ye listing dikhegi.`,
      );
    } catch (requestError) {
      setErrorMessage(requestError.message);
      setStatusMessage('');
    }
  };

  return (
    <>
      <Navbar />

      <style>
        {`
          .create-skill-page-root {
            min-height: calc(100vh - 73px);
            background:
              radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 30%),
              radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 26%),
              linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%);
          }

          .create-skill-shell {
            max-width: 1320px;
            margin: 0 auto;
            padding: 30px 16px 56px;
            display: grid;
            gap: 24px;
            color: #0f172a;
            font-family: "Manrope", "Segoe UI", sans-serif;
          }

          .create-skill-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 360px;
            gap: 24px;
            align-items: start;
          }

          @media (max-width: 980px) {
            .create-skill-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 640px) {
            .create-skill-shell {
              padding: 22px 14px 42px;
            }
          }
        `}
      </style>

      <main className="create-skill-page-root">
        <div className="create-skill-shell">
          <section
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '32px',
              padding: 'clamp(24px, 4vw, 38px)',
              background: 'linear-gradient(135deg, #020617 0%, #1d4ed8 48%, #0f766e 100%)',
              color: '#f8fafc',
              boxShadow: '0 28px 60px rgba(15, 23, 42, 0.2)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-40% auto auto -10%',
                width: '280px',
                height: '280px',
                borderRadius: '999px',
                background: 'rgba(96, 165, 250, 0.2)',
                filter: 'blur(8px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 'auto -6% -34% auto',
                width: '300px',
                height: '300px',
                borderRadius: '999px',
                background: 'rgba(45, 212, 191, 0.16)',
                filter: 'blur(12px)',
              }}
            />

            <div style={{ position: 'relative', display: 'grid', gap: '18px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  width: 'fit-content',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: '1px solid rgba(248, 250, 252, 0.18)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Let people discover your skill
              </span>

              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(2rem, 5vw, 3.6rem)',
                  lineHeight: 1.05,
                  maxWidth: '11ch',
                  fontFamily: '"Sora", "Segoe UI", sans-serif',
                }}
              >
                Any normal person can add a useful skill here.
              </h1>

              <p
                style={{
                  margin: 0,
                  maxWidth: '68ch',
                  color: 'rgba(248, 250, 252, 0.82)',
                  lineHeight: 1.75,
                }}
              >
                Ab ye form backend se connected hai. Jo skill tum save karoge woh server-side data store me persist ho jayegi.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  to="/search"
                  style={{
                    textDecoration: 'none',
                    color: '#0f172a',
                    fontWeight: 800,
                    background: '#ffffff',
                    borderRadius: '999px',
                    padding: '12px 18px',
                    boxShadow: '0 14px 28px rgba(15, 23, 42, 0.2)',
                  }}
                >
                  Explore listed skills
                </Link>
                <Link
                  to="/chat"
                  style={{
                    textDecoration: 'none',
                    color: '#f8fafc',
                    fontWeight: 700,
                    borderRadius: '999px',
                    padding: '12px 18px',
                    border: '1px solid rgba(248, 250, 252, 0.28)',
                    background: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  Open local chat
                </Link>
              </div>
            </div>
          </section>

          <section className="create-skill-grid">
            <div style={{ display: 'grid', gap: '16px' }}>
              {statusMessage ? (
                <section
                  style={{
                    borderRadius: '22px',
                    padding: '16px 18px',
                    background: 'rgba(15, 118, 110, 0.08)',
                    border: '1px solid rgba(15, 118, 110, 0.14)',
                    color: '#0f766e',
                    fontWeight: 700,
                  }}
                >
                  {statusMessage}
                </section>
              ) : null}

              {errorMessage ? (
                <section
                  style={{
                    borderRadius: '22px',
                    padding: '16px 18px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.14)',
                    color: '#b91c1c',
                    fontWeight: 700,
                  }}
                >
                  {errorMessage}
                </section>
              ) : null}

              <SkillForm onSubmit={handleSubmit} onDataChange={setDraftSkill} />
            </div>

            <aside style={{ display: 'grid', gap: '18px' }}>
              {savedSkill ? (
                <section
                  style={{
                    borderRadius: '28px',
                    padding: '22px',
                    background: 'rgba(15, 118, 110, 0.08)',
                    border: '1px solid rgba(15, 118, 110, 0.14)',
                    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)',
                    display: 'grid',
                    gap: '8px',
                  }}
                >
                  <strong style={{ color: '#0f766e', fontSize: '1.05rem' }}>Skill saved in backend</strong>
                  <p style={{ margin: 0, color: '#115e59', lineHeight: 1.7 }}>
                    `{savedSkill.title}` API ke through save ho chuki hai. Search page se isse verify kar sakte ho.
                  </p>
                </section>
              ) : null}

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
                      fontSize: '1.2rem',
                      fontFamily: '"Sora", "Segoe UI", sans-serif',
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

              <section
                style={{
                  borderRadius: '28px',
                  padding: '22px',
                  background: 'rgba(255, 255, 255, 0.88)',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
                  display: 'grid',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'grid', gap: '6px' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>Good starter skill names</h3>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                    Yahan se idea le lo, baad me real users apne titles khud daalenge.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {SKILL_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      style={{
                        borderRadius: '18px',
                        padding: '14px 16px',
                        background: 'rgba(15, 23, 42, 0.04)',
                        display: 'grid',
                        gap: '8px',
                      }}
                    >
                      <strong style={{ color: '#0f172a' }}>{category.label}</strong>
                      <span style={{ color: '#475569', lineHeight: 1.6 }}>
                        {category.sampleSkills.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                style={{
                  borderRadius: '28px',
                  padding: '22px',
                  background: 'rgba(15, 23, 42, 0.96)',
                  color: '#f8fafc',
                  boxShadow: '0 18px 36px rgba(15, 23, 42, 0.16)',
                  display: 'grid',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'grid', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Quick naming guide</h3>
                  <p style={{ margin: 0, color: 'rgba(248, 250, 252, 0.72)', lineHeight: 1.6 }}>
                    Title ko vague mat rakho. Clear skill + use case likho.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SUGGESTED_SKILL_NAMES.slice(0, 8).map((name) => (
                    <span
                      key={name}
                      style={{
                        borderRadius: '999px',
                        padding: '8px 11px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
