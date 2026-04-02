import { useState } from 'react';

export default function SkillSection({ skills, onAddSkill }) {
  const [skillInput, setSkillInput] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleAddSkill = () => {
    const wasAdded = onAddSkill(skillInput);

    if (wasAdded) {
      setSkillInput('');
      setFeedback('');
      return;
    }

    if (skillInput.trim()) {
      setFeedback('That skill is already in your list.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">My Skills</p>
          <p className="text-xs text-slate-500">Add strengths you want learners to discover.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {skills.length}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <input
          value={skillInput}
          onChange={(event) => {
            setSkillInput(event.target.value);
            setFeedback('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddSkill();
            }
          }}
          placeholder="Add a skill"
          className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAddSkill}
          className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Add Skill
        </button>
      </div>

      {feedback ? <p className="mt-3 text-xs font-semibold text-amber-600">{feedback}</p> : null}

      {skills.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">No skills added yet.</p>
      )}
    </div>
  );
}
