import React from 'react';

interface BackgroundVideoProps {
  videoId: string;
  title?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  mute?: boolean;
  loop?: boolean;
  children?: React.ReactNode; // Allow content to be placed over the video
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  videoId=993099713,
  title = "Web Header",
  showControls = true,
  autoPlay = true,
  mute = true, // Usually muted for background videos
  loop = true,
  children,
}) => {
  if (!videoId) {
    return <div>Error: Video ID is required.</div>;
  }

  const vimeoUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&controls=${
    showControls ? 1 : 0
  }&autoplay=${autoPlay ? 1 : 0}&mute=${mute ? 1 : 0}&background=1&loop=${loop ? 1 : 0}`;

  return (
    <div style={wrapperStyle}>
      <div style={videoContainerStyle}>
        <iframe
          frameBorder="0"
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; gyroscope;"
          src={vimeoUrl}
          style={iframeStyle}
        />
      </div>
      {/* Content Overlay */}
      {children && <div style={contentOverlayStyle}>{children}</div>}
    </div>
  );
};

const wrapperStyle: React.CSSProperties = {
    position: 'relative', // Needed for absolute positioning of children
    width: '100vw',
    height: '100vh',
    overflow: 'hidden', // Hide any overflow from the video
};
  
const videoContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1, // Place the video behind other content
};

const iframeStyle: React.CSSProperties = {
    width: '100%', // Use 100% width and height
    height: '100%',
    objectFit: 'cover', // This is crucial for covering the entire area
    objectPosition: 'center', // Center the video
};

const contentOverlayStyle: React.CSSProperties = {
    position: 'relative', // Or 'absolute', depending on your layout needs
    zIndex: 1, // Ensure content is above the video
    // Add other styling as needed for your content (padding, colors, etc.)
};

export default BackgroundVideo;