import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Proper Icons Collection
const Icons = {
  User: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Mail: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Lock: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Phone: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  MapPin: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Skill: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
};

// Guaranteed Fix: Input Field Component using pure Flex Layout (no absolute positioning overlap bugs)
const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required, icon }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-semibold text-gray-700" htmlFor={name}>
      {label} {required && <span className="text-blue-500">*</span>}
    </label>
    <div className="group flex items-center w-full border border-gray-300 rounded-xl bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all overflow-hidden h-[60px]">
      {icon && (
        <span className="flex items-center justify-center pl-4 pr-3 pb-0.5 text-gray-400 group-focus-within:text-blue-500 transition-colors transform -translate-y-0.5">
          {icon}
        </span>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`flex-1 h-full bg-transparent border-none outline-none text-gray-900 text-lg placeholder-gray-400 focus:placeholder-transparent focus:ring-0 ${
          icon ? 'pl-2 pr-4' : 'px-4'
        }`}
      />
    </div>
  </div>
);

// Sexy Role Selection Cards
const RoleSelector = ({ selectedRole, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center px-1">
        <label className="text-lg font-semibold text-gray-800">
          How do you want to use SkillVigo? <span className="text-blue-500">*</span>
        </label>
        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm">
          Selected: {selectedRole === 'provider' ? 'Earn Money' : 'Hire Talent'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provider Card */}
        <div 
          onClick={() => onChange('provider')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
            selectedRole === 'provider' 
              ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]' 
              : 'border-transparent bg-white shadow hover:shadow-md hover:border-blue-200'
          }`}
        >
          <div className="text-4xl mb-2">💼</div>
          <h3 className="font-bold text-gray-900 text-lg">Earn Money</h3>
          <p className="text-sm text-gray-500 mt-1">Offer your skills and get clients</p>
        </div>

        {/* Seeker Card */}
        <div 
          onClick={() => onChange('seeker')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
            selectedRole === 'seeker' 
              ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]' 
              : 'border-transparent bg-white shadow hover:shadow-md hover:border-blue-200'
          }`}
        >
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="font-bold text-gray-900 text-lg">Hire Talent</h3>
          <p className="text-sm text-gray-500 mt-1">Find tutors and services near you</p>
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
  
  const passwordsMatch = formData.confirmPassword === '' || formData.password === formData.confirmPassword;

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

    if (!passwordsMatch) {
      setError('Your passwords do not match. Please check them again.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
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
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#C7EABB' }}>
      <Navbar />

      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12 pb-16">
        
        {/* CENTERED CONTAINER FIX (max-w-4xl mx-auto) */}
        <div className="max-w-4xl mx-auto">
          
          {/* Header Typography */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              Join SkillVigo and start your journey today.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: Role Selection Wrapper Separated */}
            <RoleSelector selectedRole={formData.role} onChange={handleRoleChange} />

            {/* STEP 2: The Core Form Details properly isolated inside a premium white Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100">
              
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-100 pb-3">
                Personal Details
              </h2>
              
              {/* Proper Spacing space-y-5 */}
              <div className="space-y-5">
                
                {/* 2-Column Grid Wrapper */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Full Name" 
                    name="name" 
                    icon={Icons.User}
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="John Doe" 
                    required 
                  />
                  <InputField 
                    label="Email Address" 
                    name="email" 
                    type="email" 
                    icon={Icons.Mail}
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="hello@example.com" 
                    required 
                  />
                </div>

                {/* Conditional Primary Skill (Takes full width logically or half if wrapped) */}
                {formData.role === 'provider' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <InputField 
                      label="Primary Skill" 
                      name="primarySkill" 
                      icon={Icons.Skill}
                      value={formData.primarySkill} 
                      onChange={handleChange} 
                      placeholder="e.g. Graphic Designer, Plumber, Tutor" 
                      required={formData.role === 'provider'}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Phone Number" 
                    name="phone" 
                    type="tel" 
                    icon={Icons.Phone}
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="(555) 123-4567" 
                    required 
                  />
                  <InputField 
                    label="Location (City)" 
                    name="location" 
                    icon={Icons.MapPin}
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder="New York, NY" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputField 
                      label="Password" 
                      name="password" 
                      type="password" 
                      icon={Icons.Lock}
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                  <div className="relative">
                    <InputField 
                      label="Confirm Password" 
                      name="confirmPassword" 
                      type="password" 
                      icon={Icons.Lock}
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      placeholder="••••••••" 
                      required 
                    />
                    {!passwordsMatch && (
                      <span className="absolute -bottom-5 left-1 text-red-500 text-xs font-semibold flex items-center gap-1 animate-in fade-in">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Passwords do not match
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Button Improvement section */}
                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading || !passwordsMatch}
                    className={`w-full py-3 rounded-2xl text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${
                      (loading || !passwordsMatch)
                        ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

              </div>
              
              <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <span className="text-gray-500 font-medium text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
                    Log in
                  </Link>
                </span>
              </div>
              
            </div>

          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
