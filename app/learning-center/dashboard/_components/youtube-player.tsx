"use client";

import YouTube, { type YouTubeProps } from "react-youtube";

function extractYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  // If it's already an id
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);

    // https://www.youtube.com/watch?v=VIDEO_ID
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // https://youtu.be/VIDEO_ID
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "");
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // https://www.youtube.com/embed/VIDEO_ID
    const parts = url.pathname.split("/").filter(Boolean);
    const embedIndex = parts.findIndex((p) => p === "embed");
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      const id = parts[embedIndex + 1];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    return null;
  } catch {
    return null;
  }
}

export default function YouTubePlayer({
  video,
  title,
  className,
  opts,
  onReady,
}: {
  video: string;
  title?: string;
  className?: string;
  opts?: YouTubeProps["opts"];
  onReady?: YouTubeProps["onReady"];
}) {
  const videoId = extractYouTubeId(video);

  if (!videoId) {
    return (
      <div className={className}>
        <div className="aspect-video w-full rounded-lg border bg-muted" />
        <p className="mt-2 text-xs text-muted-foreground">Invalid YouTube URL.</p>
      </div>
    );
  }

  return (
    <div className={className} aria-label={title ?? "YouTube video"}>
      <YouTube
        videoId={videoId}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            rel: 0,
            modestbranding: 1,
          },
          ...opts,
        }}
        onReady={onReady}
        className="aspect-video w-full overflow-hidden rounded-lg border bg-black"
        iframeClassName="h-full w-full"
      />
    </div>
  );
}
