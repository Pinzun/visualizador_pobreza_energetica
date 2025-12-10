import React, { useRef, useEffect } from "react";

export type Source = {
  src: string;
  type?: string; // ej: "video/mp4", "video/webm"
};

type Track = {
  src: string; // .vtt
  srclang: string; // "es", "en"
  label?: string; // "Español"
  kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
  default?: boolean;
};

type Props = {
  /** Puedes pasar un único src o un arreglo de sources para fallback por tipo */
  src?: string;
  sources?: Source[];
  poster?: string;
  tracks?: Track[];
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onReady?: (video: HTMLVideoElement) => void;
};

const VideoPlayer: React.FC<Props> = ({
  src,
  sources,
  poster,
  tracks,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = true,
  className,
  style,
  onReady,
}) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (ref.current && onReady) onReady(ref.current);
  }, [onReady]);

  const hasMultiple = Array.isArray(sources) && sources.length > 0;

  return (
    <div className={className} style={{ ...style, position: "relative" }}>
      <video
        ref={ref}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          borderRadius: 8,
        }}
      >
        {hasMultiple ? (
          sources!.map((s, i) => <source key={i} src={s.src} type={s.type} />)
        ) : src ? (
          <source src={src} />
        ) : null}
        {tracks?.map((t, i) => (
          <track
            key={i}
            src={t.src}
            kind={t.kind ?? "subtitles"}
            srcLang={t.srclang}
            label={t.label}
            default={t.default}
          />
        ))}
        {/* Fallback para navegadores muy antiguos */}
        Tu navegador no soporta el elemento <code>video</code>.
      </video>
    </div>
  );
};

export default VideoPlayer;
