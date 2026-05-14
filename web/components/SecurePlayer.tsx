'use client';

import React from 'react';

type SecurePlayerProps = {
  src: string;                // video/iframe kaynağı
  title?: string;             // erişilebilirlik için
  allowFullscreen?: boolean;  // tam ekran izni
  className?: string;
};

// SSR guard: sadece istemci tarafında render'a izin ver
export default function SecurePlayer({
  src,
  title = 'Secure Player',
  allowFullscreen = true,
  className = '',
}: SecurePlayerProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // İsteğe bağlı skeleton
    return (
      <div
        className={`w-full aspect-video rounded-xl bg-gray-200/60 animate-pulse ${className}`}
        aria-label="Loading player"
      />
    );
  }

  const allowList = [
    'accelerometer',
    'autoplay',
    'clipboard-write',
    'encrypted-media',
    'gyroscope',
    'picture-in-picture',
    'web-share',
  ].join('; ');

  return (
    <div className={`relative w-full aspect-video overflow-hidden rounded-xl ${className}`}>
      <iframe
        src={src}
        title={title}
        allow={allowList}
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock"
        allowFullScreen={allowFullscreen}
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}


