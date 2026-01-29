'use client';

import { useEffect, useRef } from 'react';

export default function StickyFooterAd() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const conf = document.createElement('script');
      conf.innerHTML = `
        atOptions = {
          'key' : '4687048ee26a27072886b942d6e29b47',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://www.highperformanceformat.com/4687048ee26a27072886b942d6e29b47/invoke.js';
      
      bannerRef.current.append(conf);
      bannerRef.current.append(script);
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center bg-white/90 dark:bg-black/90 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur-sm py-2 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
      <div ref={bannerRef} className="overflow-hidden rounded-lg" />
      <button 
        onClick={(e) => e.currentTarget.parentElement?.remove()} 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-neutral-200 dark:bg-neutral-800 p-1 rounded-full text-neutral-500 hover:text-red-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
}
