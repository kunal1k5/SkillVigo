const fs = require('fs');
const content = import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Reusable Input Field Component
const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700" htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-sm"
    />
  </div>
);

// Role Selector Component
const RoleSelector = ({ selectedRole, onChange }) => {
  return (
    <div className="flex flex-col gap-2 mb-2">
      <label className="text-sm font-semibold text-slate-700">I am looking to... <span className="text-red-500">*</span></label>
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => onChange('provider')}
          className={\cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center shadow-sm \\}
        >
          <div className={\p-2 rounded-full \\}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <div className="font-bold text-slate-900">Earn</div>
            <div className="text-xs mt-0.5 opacity-80">(Provider)</div>
          </div>
        </div>

        <div 
          onClick={() => onChange('seeker')}
          className={\cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center shadow-sm \\}
        >
          <div className={\p-2 rounded-full \\}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div>
            <div className="font-bold text-slate-900">Hire</div>
            <div className="text-xs mt-0.5 opacity-80">(Seeker)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    role: 'seeker',
    primarySkill: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Dummy Registration payload:', formData);
      navigate('/login');
    } catch (err) {
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-3xl -z-10 -translate-x-1/4 translate-y-1/4" />

        <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 relative z-10">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Create Your Account</h1>
            <p className="text-slate-500 font-medium">Join SkillVigo and start earning or hiring today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <RoleSelector selectedRole={formData.role} onChange={handleRoleChange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField 
                label="Full Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="John Doe" 
                required 
              />
              <InputField 
                label="Email Address" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="hello@example.com" 
                required 
              />
            </div>

            {formData.role === 'provider' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <InputField 
                  label="Primary Skill" 
                  name="primarySkill" 
                  value={formData.primarySkill} 
                  onChange={handleChange} 
                  placeholder="e.g. Graphic Designer, Plumber, Tutor" 
                  required 
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField 
                label="Password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                required 
              />
              <InputField 
                label="Confirm Password" 
                name="confirmPassword" 
                type="password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="••••••••" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField 
                label="Phone Number" 
                name="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="(555) 123-4567" 
                required 
              />
              <InputField 
                label="Location (City)" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="New York, NY" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={\w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-white shadow-sm transition-all focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 \\}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
          </form>

          <div className="mt-8 text-center">
            <span className="text-slate-500 font-medium">Already have an account? </span>
            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
              Log in
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
;
fs.writeFileSync('src/pages/Register.jsx', content);
