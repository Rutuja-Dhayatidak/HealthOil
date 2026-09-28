import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewsDetailModal({ news, isOpen, onClose, onShopNow }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let animTimer;
    let unmountTimer;

    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
      // Trigger smooth entry transition on next frame
      animTimer = setTimeout(() => {
        setAnimate(true);
      }, 25);
    } else {
      setAnimate(false);
      unmountTimer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = 'unset';
      }, 280);
    }

    return () => {
      clearTimeout(animTimer);
      clearTimeout(unmountTimer);
    };
  }, [isOpen]);

  const handleSmoothClose = () => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 260);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleSmoothClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted || !news) return null;

  const benefits = news.benefits && news.benefits.length > 0
    ? news.benefits
    : [
        '100% Pure, Wood-Pressed Kolhu extraction',
        'Rich in natural Omega-3 and antioxidants',
        'Zero chemicals or artificial preservatives',
        'Directly sourced from certified organic farms'
      ];

  const handleActionClick = () => {
    handleSmoothClose();
    setTimeout(() => {
      if (onShopNow) {
        onShopNow(news);
      } else if (news.customUrl) {
        if (news.customUrl.startsWith('http')) {
          window.open(news.customUrl, '_blank');
        } else {
          navigate(news.customUrl);
        }
      } else {
        navigate('/shop-details');
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      
      {/* Smooth Backdrop with Fade Transition */}
      <div
        onClick={handleSmoothClose}
        className={`fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300 ease-out cursor-pointer ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Modern Luxury Modal Card with Smooth Spring Scale/Slide Animation */}
      <div
        className={`relative w-full max-w-4xl bg-white rounded-none shadow-2xl overflow-hidden z-10 border border-gray-200 flex flex-col md:flex-row max-h-[90vh] md:max-h-[580px] transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animate
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-5 pointer-events-none'
        }`}
      >
        {/* Floating Close Button */}
        <button
          onClick={handleSmoothClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-none bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md border border-white/30"
          title="Close (ESC)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Hero Image & Badge */}
        <div className="relative md:w-[52%] h-56 sm:h-72 md:h-auto bg-gray-900 shrink-0 overflow-hidden group">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/85 via-black/35 to-transparent" />

          {/* Badge Tag */}
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 rounded-none bg-amber-400 text-black text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 border border-white">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              {news.badgeText || news.linkType || 'Special Launch'}
            </span>
          </div>

          {/* Organic / Quality Leaf Seal */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-20">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-emerald-950/80 border border-emerald-400/40 text-[10px] text-emerald-200 font-bold backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
              100% Traditional Cold Wood Pressed
            </span>
          </div>
        </div>

        {/* Right Side: Content & Actions */}
        <div className="md:w-[48%] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          
          {/* Header & Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-none bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-200">
                HealthyFood Spotlight
              </span>
              {news.linkType && (
                <span className="text-[10px] text-gray-400 font-medium">
                  • {news.linkType}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {news.title}
            </h2>
            
            {news.description && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed font-normal">
                {news.description}
              </p>
            )}
          </div>

          {/* Benefits Section */}
          <div className="my-5">
            <h3 className="text-[11px] font-black text-emerald-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Key Highlights & Health Benefits
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-none bg-emerald-50/50 border border-emerald-200 text-gray-800 text-xs font-medium leading-snug hover:bg-emerald-50 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust points strip */}
          <div className="flex items-center justify-between py-2 px-3 rounded-none bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-medium mb-5">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Pure & Natural
            </span>
            <span className="text-gray-300">•</span>
            <span>Zero Chemicals</span>
            <span className="text-gray-300">•</span>
            <span>Fast Home Delivery</span>
          </div>

          {/* Action Buttons Footer */}
          <div className="flex items-center gap-2.5 pt-2 border-t border-gray-200">
            <button
              onClick={handleSmoothClose}
              className="px-4 py-2.5 rounded-none border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                handleSmoothClose();
                setTimeout(() => {
                  if (news.customUrl) {
                    if (news.customUrl.startsWith('http')) {
                      window.open(news.customUrl, '_blank');
                    } else {
                      navigate(news.customUrl);
                    }
                  } else {
                    navigate('/nearby-shops');
                  }
                }, 200);
              }}
              className="flex-1 px-4 py-2.5 rounded-none border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Read More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleActionClick}
              className="flex-1 px-5 py-2.5 rounded-none bg-[#064e3b] hover:bg-[#043327] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Shop Now</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
