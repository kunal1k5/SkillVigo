import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Footer from '../components/layout/Footer';

// --- DUMMY DATA ---
const SERVICE_DATA = {
  provider: {
    name: 'Rahul Kumar',
    rating: '4.8',
    reviews: 42,
    location: 'Agra, UP',
    avatar: 'R',
  },
  skill: {
    title: 'Advanced Mathematics Tutor',
    category: 'Education',
    description: 'Specialized in CBSE Class 10 & 12 board preparations. I help students build a strong foundation in Algebra, Trigonometry, and Calculus with practical real-world examples.',
    experience: '5+ years experience',
    price: 2000,
    priceType: '/ month',
    availability: 'Mon - Fri (4:00 PM - 8:00 PM)',
  }
};

// --- COMPONENTS ---

const ServiceDetails = ({ data }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Provider Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
          {data.provider.avatar}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{data.provider.name}</h2>
              <p className="text-slate-500 text-sm mt-0.5">?? {data.provider.location}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-semibold">
              ? {data.provider.rating} <span className="text-yellow-600/70 font-normal">({data.provider.reviews})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Details Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">
          {data.skill.category}
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">{data.skill.title}</h1>
        <p className="text-slate-600 leading-relaxed mb-6">
          {data.skill.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Experience</p>
            <p className="font-semibold text-slate-800">?? {data.skill.experience}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Availability</p>
            <p className="font-semibold text-slate-800">?? {data.skill.availability}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingForm = ({ price, priceType, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    mode: 'online',
    address: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const platformFee = 150;
  const totalAmount = price + platformFee;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 sticky top-24">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Configure Booking</h3>
      
      <form onSubmit={handleFormSubmit} className="space-y-5">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Date</label>
            <input 
              type="date" 
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Time</label>
            <input 
              type="time" 
              name="time"
              required
              value={formData.time}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Mode of Service</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`cursor-pointer p-3 border rounded-xl text-center text-sm font-medium transition-all ${formData.mode === 'online' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
              <input type="radio" name="mode" value="online" checked={formData.mode === 'online'} onChange={handleChange} className="hidden" />
              🌐 Online
            </label>
            <label className={`cursor-pointer p-3 border rounded-xl text-center text-sm font-medium transition-all ${formData.mode === 'offline' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
              <input type="radio" name="mode" value="offline" checked={formData.mode === 'offline'} onChange={handleChange} className="hidden" />
              🏠 Offline
            </label>
          </div>
        </div>

        {formData.mode === 'offline' && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-semibold text-slate-700">Full Address</label>
            <textarea 
              name="address"
              placeholder="Enter your complete address..."
              required
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Notes for provider (Optional)</label>
          <textarea 
            name="notes"
            placeholder="Any specific requirements or topic you want to cover?"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
          />
        </div>

        {/* Price Breakdown */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-center text-slate-600 text-sm">
            <span>Service Base Price</span>
            <span>?{price}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 text-sm">
            <span>Platform Fee</span>
            <span>?{platformFee}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-slate-900 mt-2 pt-2">
            <span className="text-xl">Total Amount</span>
            <span className="text-xl">?{totalAmount} <span className="text-sm font-normal text-slate-500">{priceType}</span></span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 mt-6 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-70 flex justify-center items-center"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            'Confirm Booking'
          )}
        </button>

      </form>
    </div>
  );
};

// --- MAIN PAGE ---

export default function BookingPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBookingSubmit = (formData) => {
    setIsSubmitting(true);
    
    // Simulate API Call
    setTimeout(() => {
      console.log('--- BOOKING CONFIRMED ---');
      console.log('Provider:', SERVICE_DATA.provider.name);
      console.log('Service:', SERVICE_DATA.skill.title);
      console.log('Booking Details:', formData);
      console.log('Total Price:', SERVICE_DATA.skill.price + 150);
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      
      <PageContainer className="flex-1 py-8">
        
        {/* Top Header & Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            ?
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book a Service</h1>
            <p className="text-slate-500 text-sm mt-1">Review details and secure your slot instantly.</p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {showSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="w-8 h-8 bg-green-500 rounded-full text-white flex items-center justify-center font-bold shrink-0">?</div>
            <div>
              <h3 className="font-bold text-green-900">Booking Confirmed Successfully!</h3>
              <p className="text-green-700 text-sm mt-0.5">Your request has been sent to {SERVICE_DATA.provider.name}. Redirecting to dashboard in a moment...</p>
            </div>
          </div>
        )}

        {/* Main 2-Column Layout */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* LEFT: Service Details */}
          <div className="min-w-0">
            <ServiceDetails data={SERVICE_DATA} />
          </div>

          {/* RIGHT: Booking Form & Checkout */}
          <div className="w-full">
            <BookingForm 
              price={SERVICE_DATA.skill.price} 
              priceType={SERVICE_DATA.skill.priceType}
              onSubmit={handleBookingSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

        </div>

      </PageContainer>
      
      <Footer />
    </div>
  );
}
