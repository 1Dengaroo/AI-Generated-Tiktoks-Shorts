import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import {
  loadFont as loadInter,
  fontFamily as interFamily,
} from "@remotion/google-fonts/Inter";
import type {
  TransitionConfig,
  TitleTransitionType,
  TitleCardStyleType,
} from "@/remotion/remotion.types";

loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

type TitleCardProps = {
  title: string;
  introEndTimeSec: number;
  playbackRate: number;
  transition: TransitionConfig;
  titleCardStyle: TitleCardStyleType;
  likeCount?: string;
  commentCount?: string;
};

function HeartIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="#262626"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="#262626"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="#262626"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
        stroke="#262626"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function computeTitleAnimation(
  type: TitleTransitionType,
  currentTimeSec: number,
  visibleEndSec: number,
  durationSec: number,
) {
  if (type === "none") {
    const visible = currentTimeSec <= visibleEndSec;
    return { opacity: visible ? 1 : 0, transform: "none" };
  }

  const inEnd = Math.min(durationSec, visibleEndSec * 0.3);
  const outStart = visibleEndSec - durationSec;
  const clamp = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
  };

  const opacity = interpolate(
    currentTimeSec,
    [0, inEnd, outStart, visibleEndSec],
    [0, 1, 1, 0],
    clamp,
  );

  let transform = "none";
  switch (type) {
    case "slide-up": {
      const yIn = interpolate(currentTimeSec, [0, inEnd], [100, 0], clamp);
      const yOut = interpolate(
        currentTimeSec,
        [outStart, visibleEndSec],
        [0, -60],
        clamp,
      );
      transform = `translateY(${yIn + yOut}px)`;
      break;
    }
    case "slide-down": {
      const yIn = interpolate(currentTimeSec, [0, inEnd], [-100, 0], clamp);
      const yOut = interpolate(
        currentTimeSec,
        [outStart, visibleEndSec],
        [0, 60],
        clamp,
      );
      transform = `translateY(${yIn + yOut}px)`;
      break;
    }
    case "scale": {
      const sIn = interpolate(currentTimeSec, [0, inEnd], [0.6, 1], clamp);
      const sOut = interpolate(
        currentTimeSec,
        [outStart, visibleEndSec],
        [1, 0.8],
        clamp,
      );
      transform = `scale(${sIn * sOut})`;
      break;
    }
  }

  return { opacity, transform };
}

function generateCounts(title: string) {
  const hash = title.length * 7 + (title.charCodeAt(0) || 65);
  const likes = `${(hash % 40) + 10},${hash % 10}${(hash * 3) % 10}${(hash * 7) % 10}`;
  const comments = `${(hash % 8) + 2},${(hash * 3) % 10}${(hash * 5) % 10}${(hash * 2) % 10}`;
  return { likes, comments };
}

function SocialCard({
  title,
  transform,
  likes,
  comments,
}: {
  title: string;
  transform: string;
  likes: string;
  comments: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        maxWidth: 940,
        width: "100%",
        transform,
        overflow: "hidden",
        fontFamily: interFamily,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "24px 32px 0",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#262626",
              letterSpacing: "-0.01em",
            }}
          >
            storyteller
          </span>
          <span style={{ fontSize: 18, color: "#8E8E8E" }}>just now</span>
        </div>
      </div>
      <div style={{ padding: "20px 32px 24px" }}>
        <p
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: "#262626",
            lineHeight: 1.35,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </p>
      </div>
      <div style={{ height: 1, background: "#EFEFEF", margin: "0 32px" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HeartIcon />
            <span style={{ fontSize: 22, fontWeight: 600, color: "#262626" }}>
              {likes}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CommentIcon />
            <span style={{ fontSize: 22, fontWeight: 500, color: "#262626" }}>
              {comments}
            </span>
          </div>
          <ShareIcon />
        </div>
        <BookmarkIcon />
      </div>
    </div>
  );
}

function MinimalCard({
  title,
  transform,
}: {
  title: string;
  transform: string;
}) {
  return (
    <div
      style={{
        maxWidth: 900,
        width: "100%",
        transform,
        fontFamily: interFamily,
        textAlign: "center",
        padding: "48px 40px",
      }}
    >
      <div
        style={{
          width: 48,
          height: 3,
          background: "#FFFFFF",
          margin: "0 auto 32px",
          borderRadius: 2,
          opacity: 0.6,
        }}
      />
      <p
        style={{
          fontSize: 48,
          fontWeight: 500,
          color: "#FFFFFF",
          lineHeight: 1.3,
          margin: 0,
          letterSpacing: "-0.02em",
          textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        {title}
      </p>
      <div
        style={{
          width: 48,
          height: 3,
          background: "#FFFFFF",
          margin: "32px auto 0",
          borderRadius: 2,
          opacity: 0.6,
        }}
      />
    </div>
  );
}

function BoldCard({ title, transform }: { title: string; transform: string }) {
  return (
    <div
      style={{
        maxWidth: 940,
        width: "100%",
        transform,
        fontFamily: interFamily,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        borderRadius: 20,
        padding: "44px 48px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <p
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1.25,
          margin: 0,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>
    </div>
  );
}

export function TitleCard({
  title,
  introEndTimeSec,
  playbackRate,
  transition,
  titleCardStyle,
  likeCount,
  commentCount,
}: TitleCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeSec = frame / fps;

  const scaleTime = (t: number) => t / playbackRate;
  const visibleEndSec = scaleTime(introEndTimeSec);

  if (currentTimeSec > visibleEndSec) return null;

  const { opacity, transform } = computeTitleAnimation(
    transition.type as TitleTransitionType,
    currentTimeSec,
    visibleEndSec,
    transition.durationSec,
  );

  const generated = generateCounts(title);
  const likes = likeCount || generated.likes;
  const comments = commentCount || generated.comments;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 40px",
        opacity,
      }}
    >
      {titleCardStyle === "social" && (
        <SocialCard
          title={title}
          transform={transform}
          likes={likes}
          comments={comments}
        />
      )}
      {titleCardStyle === "minimal" && (
        <MinimalCard title={title} transform={transform} />
      )}
      {titleCardStyle === "bold" && (
        <BoldCard title={title} transform={transform} />
      )}
    </div>
  );
}
