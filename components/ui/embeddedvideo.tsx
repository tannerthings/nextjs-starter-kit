import React, { useEffect } from 'react';

interface VideoEmbedProps {
  videoId: string;
  title?: string;  // Optional: Title for the video (used in the Vimeo URL)
  showControls?: boolean; //Optional: Show controls or hide them.
  autoPlay?: boolean;
  mute?: boolean;
  loop?: boolean;
  aspectRatio?: string;
}

export const EmbeddedVideo: React.FC<VideoEmbedProps> = ({
  videoId = 993099713,
  title = "Web Header",
  showControls = false,
  autoPlay = true,
  mute = false,
  loop = true,
  aspectRatio = "16/9"
}) => {
  if (!videoId) {
    return <div>Error: Video ID is required.</div>;
  }


    // Build the Vimeo URL
    const vimeoUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&controls=${showControls ? 1 : 0}&autoplay=${autoPlay ? 1 : 0}&mute=${mute ? 1 : 0}&background=1&loop=${loop ? 1 : 0}`;

  return (
    <div className="m-video__embed w-full">
      <div className="hero-2-video-container" style={containerStyle}>
        <iframe
          frameBorder="0"
          style={iframeStyle}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; gyroscope;"
          src={vimeoUrl}
          className="lazyloaded" // Consider removing if you don't use Nitro
        ></iframe>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    minWidth: '100vw',
    pointerEvents: 'none',
}
const iframeStyle: React.CSSProperties = {

}

export default EmbeddedVideo;