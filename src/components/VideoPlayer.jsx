import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js/dist/hls.min.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
  const date = new Date(timeInSeconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

  // Handle fullscreen, mouse movement and touch events
  useEffect(() => {
    const playerElement = playerContainerRef.current;
    if (!playerElement) return;

    const showControls = () => {
      const controls = playerElement.querySelector('.controls-ui');
      if (!controls) return;

      controls.style.opacity = '1';
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          if (!controls.matches(':hover')) {
            controls.style.opacity = '0';
          }
        }, 3000);
      }
    };

    const handleFullscreenChange = () => {
      const controls = playerElement.querySelector('.controls-ui');
      if (!controls) return;
      controls.style.opacity = '1';
      
      if (document.fullscreenElement) {
        // Force controls to be visible for a moment after entering fullscreen
        setTimeout(() => {
          controls.style.opacity = '1';
          handleMouseMove();
        }, 100);
      }
    };

    playerElement.addEventListener('mousemove', showControls);
    playerElement.addEventListener('touchstart', showControls);
    playerElement.addEventListener('touchmove', showControls);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Initial setup
    showControls();

    return () => {
      playerElement.removeEventListener('mousemove', showControls);
      playerElement.removeEventListener('touchstart', showControls);
      playerElement.removeEventListener('touchmove', showControls);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const hls = new Hls({
    manifestLoadErrorMaxRetry: 5, // Max 5 retries for manifest loading
    fragLoadErrorMaxRetry: 5,     // Max 5 retries for fragment loading
    levelLoadErrorMaxRetry: 5,    // Max 5 retries for level/playlist loading
    manifestLoadRetryDelay: 10000,
    maxBufferLength: 10,    
    maxMaxBufferLength: 15,
    xhrSetup: (xhr) => {
        const jwtToken = localStorage.getItem('joshi-ott-token');
        if (jwtToken) {
            xhr.setRequestHeader('X-Auth-Token', jwtToken);
        } 
    },
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
  // data.details tells you what failed: 'manifestLoadError', 'fragLoadError', etc.
  // data.response?.code may have the HTTP status
  console.error('HLS error:', data);

  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        console.error('Fatal network error, stopping playback');
        hls.destroy();
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.error('Fatal media error, trying recovery');
        hls.recoverMediaError();
        break;
      default:
        hls.destroy();
        break;
    }
  }

  // Stop on auth errors immediately
  if (data.response && (data.response.code === 401 || data.response.code === 403)) {
    console.error('Auth failed, destroying player');
    hls.destroy();
  }
});


    hls.loadSource(src);
    hls.attachMedia(videoElement);
    hlsRef.current = hls;

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const availableQualities = hls.levels.map((l, index) => ({
        height: l.height,
        index: index,
      }));
      setQualities([{ height: 'Auto', index: -1 }, ...availableQualities]);
      videoElement.play().catch(() => {});
    });

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleDurationChange = () => setDuration(videoElement.duration);
    
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  const togglePlayPause = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current?.pause();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    if (videoRef.current) videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerContainerRef.current?.requestFullscreen();
    }
  };

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setIsQualityMenuOpen(false);
    }
  };

  return (
    <div 
      ref={playerContainerRef} 
      className="relative w-full h-full bg-black"
      onMouseEnter={() => {
        const controls = playerContainerRef.current?.querySelector('.controls-ui');
        if (controls) controls.style.opacity = '1';
      }}
      onMouseLeave={() => {
        if (isPlaying) {
          const controls = playerContainerRef.current?.querySelector('.controls-ui');
          if (controls) controls.style.opacity = '0';
        }
      }}
      onTouchStart={() => {
        const controls = playerContainerRef.current?.querySelector('.controls-ui');
        if (controls) {
          const currentOpacity = window.getComputedStyle(controls).opacity;
          controls.style.opacity = currentOpacity === '0' ? '1' : '0';
        }
      }}
    >
      <video
        ref={videoRef}
        onClick={togglePlayPause}
        onDoubleClick={toggleFullScreen}
        className="w-full h-full"
        playsInline
      />
      <div 
        className="controls-ui absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-100 transition-opacity duration-300 cursor-auto z-50 select-none"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-[5px] mb-2 cursor-pointer range-thumb"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <button onClick={togglePlayPause} className="text-white p-1">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <div className="flex items-center">
                <button onClick={toggleMute} className="text-white p-1">
                    {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <div className="hidden [@media(hover:hover)]:flex [@media(min-width:1024px)]:flex items-center group">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 group-hover:w-24 h-[5px] ml-3 transition-all duration-300 cursor-pointer range-thumb pl-2"
                    />
                </div>
            </div>

            <span className="text-white text-sm font-mono select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-x-3">
            <div className="relative">
              <button onClick={() => setIsQualityMenuOpen(prev => !prev)} className="text-white p-1">
                <Settings size={22} />
              </button>
              {isQualityMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-md py-1 min-w-[100px] z-10">
                  {qualities.map(q => (
                    <button
                      key={q.index}
                      onClick={() => handleQualityChange(q.index)}
                      className={`w-full text-left px-3 py-1.5 text-sm ${currentQuality === q.index ? 'bg-red-600' : ''} hover:bg-neutral-700`}
                    >
                      {q.index === -1 ? 'Auto' : `${q.height}p`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFullScreen} className="text-white pb-.5">
              <Maximize size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
