"use client";

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';

export default function ParallaxHero(): React.ReactElement {
  const [scrollY, setScrollY] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);
  const starsRef = useRef<Array<{width: number, height: number, top: number, left: number}>>([]); 
  
  // Generate star positions once and store them
  useEffect(() => {
    if (starsRef.current.length === 0) {
      const starPositions = [];
      for (let i = 0; i < 50; i++) {
        // Use a stable seed or pre-generate all stars
        starPositions.push({
          width: 1 + ((i % 3) + 1),
          height: 1 + ((i % 3) + 1),
          top: (i * 2) % 100,
          left: (i * 7) % 100,
        });
      }
      starsRef.current = starPositions;
    }
    
    // Mark that we're now client-side
    setIsClient(true);
    
    // Set initial window height
    setWindowHeight(window.innerHeight);
    
    const handleScroll = (): void => {
      setScrollY(window.scrollY);
    };
    
    const handleResize = (): void => {
      setWindowHeight(window.innerHeight);
    };
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Generate section data only on client-side
  const sections = isClient 
    ? [...Array(3)].map((_, index) => {
        const sectionTop = windowHeight + (index * windowHeight * 0.8);
        const sectionBottom = sectionTop + windowHeight;
        
        // Calculate opacity based on scroll position
        let opacity = 0;
        if (scrollY > sectionTop - windowHeight && scrollY < sectionBottom) {
          // Fade in
          if (scrollY < sectionTop) {
            opacity = (scrollY - (sectionTop - windowHeight)) / windowHeight;
          } 
          // Full opacity
          else if (scrollY >= sectionTop && scrollY <= sectionBottom - windowHeight * 0.5) {
            opacity = 1;
          } 
          // Fade out
          else {
            opacity = 1 - ((scrollY - (sectionBottom - windowHeight * 0.5)) / (windowHeight * 0.5));
          }
        }
        
        return {
          key: index,
          opacity: Math.max(0, Math.min(1, opacity)),
          backgroundColor: index % 2 === 0 ? '#f8fafc' : '#f1f5f9'
        };
      })
    : [];

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section with Parallax */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background Layer with image - moves slower */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            transform: isClient ? `translateY(${scrollY * 0.1}px)` : 'translateY(0px)',
            backgroundImage: `url('/images/ReunionHeroImageAI-mobile.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Responsive background images using media queries */}
          <style jsx>{`
            @media (min-width: 640px) {
              div {
                background-image: url('/images/ReunionHeroImageAI.png');
              }
            }
            @media (min-width: 1024px) {
              div {
                background-image: url('/images/ReunionHeroImageAI.png');
              }
            }
            @media (min-width: 1920px) {
              div {
                background-image: url('/images/ReunionHeroImageAI.png');
              }
            }
          `}</style>
          {/* Dark overlay as a separate element instead of box-shadow */}
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: 'rgba(0, 0, 50, 0.0)' }}
          ></div>
        </div>
        
        {/* Middle Layer - stars/particles */}
        {isClient && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `translateY(${scrollY * 0.0}px)` }}
          >
            {starsRef.current.map((star, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white" 
                style={{
                  width: `${star.width}px`,
                  height: `${star.height}px`,
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  opacity: 0.6
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Foreground Layer - text content moves faster */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 md:px-8 lg:px-16"
          style={{ transform: isClient ? `translateY(${scrollY * 0.5}px)` : 'translateY(0px)' }}
        >
          
          {/* Call to Action Buttons - Responsive layout */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link href="/registration" prefetch={true}>
              <Button className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 md:py-3 bg-black hover:bg-yellow-400 text-white hover:text-black font-semibold rounded-lg transition-colors duration-300 shadow-lg transform hover:scale-105" variant="outline">
                Register Now
              </Button>
            </Link>  
            
            <Link href="/learnmore" prefetch={true}>
              <Button className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 md:py-3 bg-transparent hover:bg-white/10 text-white font-semibold border-2 border-white rounded-lg transition-colors duration-300 shadow-lg transform hover:scale-105">
                Learn More
              </Button>
            </Link>


          </div>
        </div>
      </div>
    </div>
  );
}