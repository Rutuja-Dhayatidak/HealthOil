import React, { useState, useEffect } from 'react';
import { Megaphone, ShoppingBag, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPublicNews } from '../ApiServices/newsService';
import NewsDetailModal from './NewsDetailModal';

export default function RightSidebarNewsWidget({ onOpenCart }) {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getPublicNews()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setNewsItems(res.data);
        }
      })
      .catch((err) => console.error('Failed to load public news items:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleThumbnailClick = (item) => {
    setSelectedNews(item);
    setIsModalOpen(true);
  };

  const handleShopNow = (item) => {
    if (item && item.customUrl) {
      if (item.customUrl.startsWith('http')) {
        window.open(item.customUrl, '_blank');
      } else {
        navigate(item.customUrl);
      }
    } else if (onOpenCart) {
      onOpenCart();
    } else {
      navigate('/shop-details');
    }
  };

  // If no news items returned and not loading, don't show or show default curated items
  const displayItems = newsItems.length > 0 ? newsItems.slice(0, 5) : [];

  if (!loading && displayItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Right Sidebar Widget Container */}
      <aside
        aria-label="Latest News & Promotions"
        className={`fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ease-out ${isMinimized ? 'translate-x-[calc(100%-18px)]' : 'translate-x-0'
          }`}
      >
        <div className="relative flex items-center">

          {/* Quick Toggle / Peek Tab on left edge of widget */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-5 h-9 rounded-l-lg bg-[#063024] text-white flex items-center justify-center shadow-md hover:bg-emerald-800 transition-colors cursor-pointer border border-r-0 border-emerald-500/30"
            title={isMinimized ? 'Show Latest News' : 'Minimize Widget'}
          >
            {isMinimized ? (
              <ChevronLeft className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
            )}
          </button>

          {/* Main Vertical Floating Pill Widget */}
          <div className="w-[72px] sm:w-[78px] rounded-[24px] bg-white/85 backdrop-blur-md border border-white/60 shadow-xl shadow-emerald-950/20 p-1.5 flex flex-col items-center gap-1.5 transition-all duration-300">

            {/* Circular 'Latest News' Header Button */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (displayItems.length > 0) {
                    handleThumbnailClick(displayItems[0]);
                  }
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#063024] text-white flex flex-col items-center justify-center shadow-md border border-emerald-400/40 hover:scale-105 transition-transform active:scale-95 cursor-pointer relative overflow-hidden"
                title="Latest News & Special Offers"
              >
                {/* Glow ring animation */}
                <span className="absolute inset-0 rounded-full border border-amber-300/40 animate-ping opacity-25" />

                <Megaphone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-[7px] font-black uppercase tracking-tight text-emerald-100 leading-none mt-0.5">
                  Latest
                </span>
                <span className="text-[7px] font-black uppercase tracking-tight text-white leading-none">
                  News
                </span>
              </button>

              {/* Close / Collapse cross on top right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-gray-700 shadow-md border border-gray-200 text-[9px] flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer"
                title="Minimize"
              >
                ×
              </button>
            </div>

            {/* Up to 5 Interactive Thumbnails */}
            <div className="flex flex-col gap-1.5 w-full items-center">
              {displayItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  onClick={() => handleThumbnailClick(item)}
                  className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-visible border border-emerald-100/90 shadow-sm cursor-pointer hover:scale-108 hover:shadow-md transition-all duration-200 group bg-gray-100 shrink-0"
                  title={item.title}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-xl"
                  />

                  {/* Corner Badge Tag */}
                  <div className="absolute -right-1 -top-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-[6.5px] px-1 py-0.2 rounded-full shadow-xs whitespace-nowrap uppercase tracking-wider border border-white z-10 scale-95 group-hover:scale-100 transition-transform">
                    {item.badgeText || (item.title ? item.title.slice(0, 8) : 'News')}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom "Shop Now" Green Button */}
            <button
              onClick={() => handleShopNow(displayItems[0])}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex flex-col items-center justify-center shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white shrink-0 group"
              title="Shop Now"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white group-hover:animate-bounce" />
              <span className="text-[7px] font-black uppercase tracking-tight leading-none mt-0.5">
                Shop
              </span>
              <span className="text-[7px] font-black uppercase tracking-tight leading-none">
                Now
              </span>
            </button>

          </div>
        </div>
      </aside>

      {/* Detail Modal */}
      <NewsDetailModal
        news={selectedNews}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShopNow={handleShopNow}
      />
    </>
  );
}
