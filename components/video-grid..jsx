import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Maximize } from 'lucide-react';

// Main App component
const VideoGallery = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [controlsMode, setControlsMode] = useState('default');
  const [activeVideo, setActiveVideo] = useState(null);
  const observerRef = useRef(null);
  const backgroundVideoRef = useRef(null);

  // Demo video configuration
  const videoConfig = Array.from({ length: 46 }, (_, i) => {
    const id = (i + 3).toString();
    const baseFileName = '/gallery/wiley85_89_95_reunion_clips-';
    return {
      id,
      thumbnail: `${baseFileName}${id}.png`,
      videoUrl: `${baseFileName}${id}.mp4`,
    };
  });

  // Load user preferences from localStorage on mount
  useEffect(() => {
    const loadUserPreferences = () => {
      const savedPrefs = localStorage.getItem('videoGalleryPrefs');
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          
          // Apply dark mode preference
          if (prefs.darkMode !== false) {
            setDarkMode(true);
          } else {
            setDarkMode(false);
          }
          
          // Apply controls mode preference
          if (prefs.controlsMode) {
            setControlsMode(prefs.controlsMode);
          }
        } catch (error) {
          console.error('Error parsing saved preferences:', error);
        }
      }
    };
    
    loadUserPreferences();
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    const saveUserPreferences = () => {
      const preferences = {
        darkMode,
        controlsMode
      };
      localStorage.setItem('videoGalleryPrefs', JSON.stringify(preferences));
    };
    
    saveUserPreferences();
  }, [darkMode, controlsMode]);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    const setupIntersectionObserver = () => {
      // Disconnect any existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Create new IntersectionObserver
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const videoCell = entry.target;
          const videoElement = videoCell.querySelector('.cell-video');
          
          if (entry.isIntersecting) {
            // When a cell enters the viewport, preload its video
            const source = videoElement.querySelector('source');
            if (source && !source.src && source.dataset.src) {
              // Set preload to metadata to just load necessary info
              videoElement.preload = 'metadata';
              source.src = source.dataset.src;
              videoElement.load();
            }
          } else {
            // When a cell exits the viewport, pause it if playing
            if (videoElement && !videoElement.paused) {
              videoElement.pause();
            }
          }
        });
      }, {
        root: null, // viewport
        rootMargin: '100px', // Load videos slightly before they come into view
        threshold: 0.1 // Trigger when at least 10% of the item is visible
      });
      
      // Observe all video cells
      document.querySelectorAll('.video-cell').forEach(cell => {
        observerRef.current.observe(cell);
      });
    };

    // Only setup after component is mounted and all video cells are rendered
    const timer = setTimeout(() => {
      setupIntersectionObserver();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Setup background video
  useEffect(() => {
    const setupBackgroundVideo = () => {
      const backgroundVideo = backgroundVideoRef.current;
      if (!backgroundVideo) return;
      
      // Ensure background video is muted and looping
      backgroundVideo.muted = true;
      backgroundVideo.loop = true;
      
      // Try to start playing right away
      backgroundVideo.play().catch(e => {
        console.warn('Auto-play prevented:', e);
      });
    };
    
    setupBackgroundVideo();
  }, []);

  // Pause all videos when visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pauseAllVideos();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && activeVideo) {
        // When exiting fullscreen, make sure the video keeps playing in-cell
        const playButton = activeVideo.closest('.video-container')?.querySelector('.play-button');
        if (playButton) {
          playButton.classList.add('playing');
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [activeVideo]);

  // Function to pause all videos
  const pauseAllVideos = () => {
    document.querySelectorAll('.cell-video').forEach(video => {
      if (!video.paused) {
        video.pause();
      }
      
      // Hide any loading spinners
      const loadingOverlay = video.closest('.video-container')?.querySelector('.loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
      }
    });
    
    // Hide any remaining active spinners
    document.querySelectorAll('.loading-overlay.active').forEach(overlay => {
      overlay.classList.remove('active');
    });
    
    setActiveVideo(null);
    
    // Resume background video when all videos are paused
    if (backgroundVideoRef.current && backgroundVideoRef.current.paused) {
      backgroundVideoRef.current.play().catch(e => {
        console.warn('Could not resume background video:', e);
      });
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle controls mode
  const toggleControlsMode = () => {
    if (controlsMode === 'default') {
      setControlsMode('always');
      // Make all controls visible immediately
      document.querySelectorAll('.video-controls').forEach(control => {
        control.style.opacity = '1';
      });
    } else {
      setControlsMode('default');
      // Hide all controls immediately except for those being hovered
      document.querySelectorAll('.video-controls').forEach(control => {
        const cell = control.closest('.video-cell');
        if (cell && !cell.matches(':hover') && cell.classList.contains('started')) {
          control.style.opacity = '0';
        }
      });
    }
  };

  return (
    <div className={`${darkMode ? 'dark-mode' : ''} ${controlsMode === 'always' ? 'always-show-controls' : 'always-hide-controls'}`}>
      <div className="container">
        <header>
          <h1>Video Gallery</h1>
          
          <div className="toggle-container">
            <div className="toggle-item">
              <span className="toggle-label">Dark Mode</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={toggleDarkMode}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="toggle-item">
              <span className="toggle-label">Video Controls</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={controlsMode === 'always'} 
                  onChange={toggleControlsMode}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </header>

        <div className="background-video-container">
          <video 
            className="background-video" 
            autoPlay 
            muted 
            loop 
            playsInline
            ref={backgroundVideoRef}
          >
            <source src="/gallery/wiley85_89_95_reunion_clips-3.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="content-container">
          <main>
            <VideoGrid 
              videos={videoConfig} 
              setActiveVideo={setActiveVideo} 
              backgroundVideoRef={backgroundVideoRef}
            />
          </main>
        </div>

        <footer>
          <p>© Video Gallery {new Date().getFullYear()}</p>
        </footer>
      </div>

      <style jsx global>{`
        :root {
          --primary-color: #111;
          --secondary-color: #333;
          --accent-color: #ff6b00;
          --text-color: #333;
          --bg-color: #f5f5f5;
          --cell-border: #eee;
          --modal-bg: rgba(0, 0, 0, 0.8);
          --toggle-active: #2ecc71;
          --toggle-inactive: #e74c3c;
          --control-bg: rgba(255, 255, 255, 0.95);
          --control-hover: rgba(245, 245, 245, 0.9);
          --card-bg: rgba(255, 255, 255, 0.8);
          --header-bg: white;
          --footer-bg: white;
        }

        .dark-mode {
          --primary-color: #f5f5f5;
          --secondary-color: #ddd;
          --accent-color: #ff8f3f;
          --text-color: #f5f5f5;
          --bg-color: #121212;
          --cell-border: #333;
          --card-bg: rgba(30, 30, 30, 0.8);
          --header-bg: #1a1a1a;
          --footer-bg: #1a1a1a;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          background-color: var(--bg-color);
          padding: 0;
          min-height: 100vh;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        header {
          padding: 4rem 0 2rem;
          background-color: var(--header-bg);
          margin-bottom: 2rem;
          position: relative;
          z-index: 2;
          transition: background-color 0.3s ease;
        }
        
        /* Toggle Switches */
        .toggle-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 1rem 0;
          flex-wrap: wrap;
        }
        
        .toggle-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: var(--accent-color);
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .toggle-label {
          font-weight: 500;
          color: var(--text-color);
          transition: color 0.3s ease;
        }
        
        /* Background Video */
        .background-video-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        
        .background-video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translateX(-50%) translateY(-50%);
          opacity: 0.15;
          object-fit: cover;
          z-index: 0;
        }
        
        /* Content container */
        .content-container {
          position: relative;
          z-index: 1;
          background-color: var(--card-bg);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: background-color 0.3s ease;
        }

        h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--primary-color);
          letter-spacing: -0.03em;
        }

        /* Video Grid */
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 10px;
          margin-top: 20px;
        }

        .video-cell {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          background-color: #000;
          border: 1px solid var(--cell-border);
        }

        .video-cell:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .video-container {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 Aspect Ratio */
          background-color: #000;
        }

        .cell-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background-color: #000;
        }

        .video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          padding: 0 10px;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 5;
        }

        /* Video controls visibility based on user preference */
        .always-show-controls .video-cell .video-controls {
          opacity: 1 !important;
        }

        .always-hide-controls .video-cell .video-controls {
          opacity: 0 !important;
        }

        .always-hide-controls .video-cell:hover .video-controls {
          opacity: 1 !important;
        }

        /* Default behavior */
        .video-cell:hover .video-controls {
          opacity: 1;
        }

        /* Initially show controls when video is loaded but not played yet */
        .video-cell:not(.started) .video-controls {
          opacity: 1;
        }

        .play-button {
          width: 36px;
          height: 36px;
          background-color: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: background-color 0.2s ease;
          position: relative;
        }

        .time-display {
          color: white;
          font-size: 14px;
          margin-left: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .fullscreen-button {
          width: 36px;
          height: 36px;
          background-color: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: background-color 0.2s ease;
          position: relative;
          margin-left: auto;
        }

        .play-button:hover, .fullscreen-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .loading-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          border-top-color: var(--accent-color);
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Footer */
        footer {
          margin-top: 60px;
          text-align: center;
          color: #777;
          font-size: 0.9rem;
          padding: 30px 0;
          border-top: 1px solid var(--cell-border);
          position: relative;
          z-index: 2;
          background-color: var(--footer-bg);
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        
        .dark-mode footer {
          color: #aaa;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .video-grid {
              grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
              gap: 8px;
          }
          
          h1 {
              font-size: 2.5rem;
          }
        }

        @media (max-width: 480px) {
          .video-grid {
              grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
              gap: 6px;
          }
          
          .video-controls {
              height: 40px;
          }
          
          .play-button, .fullscreen-button {
              width: 28px;
              height: 28px;
          }
          
          h1 {
              font-size: 2rem;
          }
          
          header {
              padding: 2rem 0 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

// Video Grid Component
const VideoGrid = ({ videos, setActiveVideo, backgroundVideoRef }) => {
  return (
    <div className="video-grid" id="videoGrid">
      {videos.map((video) => (
        <VideoCell 
          key={video.id} 
          video={video} 
          setActiveVideo={setActiveVideo}
          backgroundVideoRef={backgroundVideoRef}
        />
      ))}
    </div>
  );
};

// Video Cell Component
const VideoCell = ({ video, setActiveVideo, backgroundVideoRef }) => {
  const videoRef = useRef(null);
  const playButtonRef = useRef(null);
  const loadingOverlayRef = useRef(null);
  const [timeDisplay, setTimeDisplay] = useState('0:00 / 0:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle video playback
  const toggleVideoPlayback = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    const videoElement = videoRef.current;
    const loadingOverlay = loadingOverlayRef.current;
    
    // Hide any other active loading spinners
    document.querySelectorAll('.loading-overlay.active').forEach(overlay => {
      if (overlay !== loadingOverlay) {
        overlay.classList.remove('active');
      }
    });
    
    // Check if the video source has been loaded
    const source = videoElement.querySelector('source');
    if (!source.src && source.dataset.src) {
      // Show loading overlay when loading for the first time
      loadingOverlay.classList.add('active');
      
      // Load the video source
      source.src = source.dataset.src;
      videoElement.load();
      
      // Play the video after loading
      videoElement.addEventListener('loadedmetadata', () => {
        playVideo(videoElement, loadingOverlay);
      }, { once: true });
      
      // Set a timeout to hide spinner if loading takes too long
      setTimeout(() => {
        loadingOverlay.classList.remove('active');
      }, 8000);
    } else {
      // Toggle play/pause if source is already loaded
      if (videoElement.paused) {
        playVideo(videoElement, loadingOverlay);
      } else {
        videoElement.pause();
        // Ensure spinner is hidden when pausing
        loadingOverlay.classList.remove('active');
      }
    }
  };

  // Play video with error handling
  const playVideo = (videoElement, loadingOverlay) => {
    // Only show loading overlay if video isn't already playing
    if (videoElement.paused && videoElement.readyState < 3) {
      loadingOverlay.classList.add('active');
    }
    
    videoElement.play().then(() => {
      // Hide spinner once playback actually starts
      loadingOverlay.classList.remove('active');
      setIsPlaying(true);
      setHasStarted(true);
    }).catch(err => {
      console.error('Error playing video:', err);
      loadingOverlay.classList.remove('active');
      setIsPlaying(false);
    });
  };

  // Toggle fullscreen
  const toggleFullScreen = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    const videoElement = videoRef.current;
    
    if (!document.fullscreenElement) {
      videoElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Set up video event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    const loadingOverlay = loadingOverlayRef.current;
    
    if (!videoElement) return;
    
    // Loading events
    const handleLoadStart = () => {
      loadingOverlay.classList.add('active');
    };
    
    const handleCanPlay = () => {
      loadingOverlay.classList.remove('active');
    };
    
    // Playback events
    const handlePlay = () => {
      setIsPlaying(true);
      setHasStarted(true);
      
      // Pause background video when a cell video starts playing
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.pause();
      }
      
      // Set this as the active video
      setActiveVideo(videoElement);
      
      // Hide controls after 2 seconds if mouse is not over the cell
      setTimeout(() => {
        const cell = videoElement.closest('.video-cell');
        if (cell && !cell.matches(':hover')) {
          const controlsElement = cell.querySelector('.video-controls');
          if (controlsElement) {
            controlsElement.style.opacity = '0';
          }
        }
      }, 2000);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      
      // Ensure loading spinner is hidden when paused
      loadingOverlay.classList.remove('active');
      
      // If this was the active video, clear the state
      if (setActiveVideo) {
        setActiveVideo(null);
        
        // Resume background video if no other videos are playing
        setTimeout(() => {
          if (backgroundVideoRef.current && backgroundVideoRef.current.paused) {
            backgroundVideoRef.current.play().catch(e => {
              console.warn('Could not resume background video:', e);
            });
          }
        }, 100); // Small delay to ensure state is updated
      }
      
      // Show the controls when paused
      const controlsElement = videoElement.closest('.video-container')?.querySelector('.video-controls');
      if (controlsElement) {
        controlsElement.style.opacity = '1';
      }
    };
    
    // Time update event to update the time display
    const handleTimeUpdate = () => {
      if (videoElement.duration) {
        setTimeDisplay(
          `${formatTime(videoElement.currentTime)} / ${formatTime(videoElement.duration)}`
        );
      }
    };
    
    // Set initial duration when metadata is loaded
    const handleLoadedMetadata = () => {
      if (videoElement.duration) {
        setTimeDisplay(`0:00 / ${formatTime(videoElement.duration)}`);
      }
    };
    
    // Hide loading spinner once playback actually begins
    const handlePlaying = () => {
      loadingOverlay.classList.remove('active');
    };
    
    // Error handling
    const handleError = () => {
      loadingOverlay.classList.remove('active');
      console.error('Error loading video');
    };
    
    // Additional events for loading states
    const handleWaiting = () => {
      loadingOverlay.classList.add('active');
      
      // Set a timeout to hide spinner if waiting takes too long
      setTimeout(() => {
        loadingOverlay.classList.remove('active');
      }, 8000);
    };
    
    const handleStalled = () => {
      loadingOverlay.classList.add('active');
      
      // Set a timeout to hide spinner if stalled takes too long
      setTimeout(() => {
        loadingOverlay.classList.remove('active');
      }, 8000);
    };
    
    const handleSeeked = () => {
      loadingOverlay.classList.remove('active');
    };
    
    // Ensure spinner is removed when video is ready to play
    const handleCanPlayThrough = () => {
      loadingOverlay.classList.remove('active');
    };
    
    // Add event listeners
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('playing', handlePlaying);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('stalled', handleStalled);
    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.addEventListener('canplaythrough', handleCanPlayThrough);
    
    // Clean up event listeners on unmount
    return () => {
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('playing', handlePlaying);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('stalled', handleStalled);
      videoElement.removeEventListener('seeked', handleSeeked);
      videoElement.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [setActiveVideo, backgroundVideoRef]);

  return (
    <div className={`video-cell ${isPlaying ? 'playing' : ''} ${hasStarted ? 'started' : ''}`} data-video-id={video.id}>
      <div className="video-container">
        <video 
          className="cell-video" 
          poster={video.thumbnail} 
          preload="none"
          ref={videoRef}
          onClick={toggleVideoPlayback}
        >
          <source data-src={video.videoUrl} type="video/mp4" />
        </video>
        <div className="video-controls">
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''}`} 
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={toggleVideoPlayback}
            ref={playButtonRef}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <span className="time-display">{timeDisplay}</span>
          <button 
            className="fullscreen-button" 
            aria-label="Fullscreen"
            onClick={toggleFullScreen}
          >
            <Maximize size={16} />
          </button>
        </div>
        <div 
          className={`loading-overlay ${loadingOverlayRef.current?.classList.contains('active') ? 'active' : ''}`}
          ref={loadingOverlayRef}
        >
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;