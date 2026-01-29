'use client';

import { useEffect, useRef } from 'react';

export default function NativeBannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('script')) {
        const script = document.createElement('script');
        script.async = true;
        script.dataset.cfasync = "false";
        script.src = "//pl28518158.effectivegatecpm.com/eff8dfcc0800e8e1e60cc1b44e40a495/invoke.js";
        
        containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full my-8 flex justify-center">
        <div id="container-eff8dfcc0800e8e1e60cc1b44e40a495" ref={containerRef} className="rounded-2xl overflow-hidden shadow-sm border border-neutral-100 dark:border-neutral-800" />
    </div>
  );
}
