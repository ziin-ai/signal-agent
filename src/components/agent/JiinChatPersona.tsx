import type { ReactNode } from "react";
import { withBasePath } from "../../lib/agent/chat-client";

type AvatarProps = {
  size?: "sm" | "md" | "lg";
  basePath?: string;
};

const AVATAR_PX = { sm: 36, md: 48, lg: 56 } as const;
const JIIN_AVATAR_PATH = "/images/jiin-avatar.png";

function jiinAvatarSrc(basePath?: string): string {
  const base = basePath ?? import.meta.env.BASE_URL ?? "/";
  return withBasePath(base, JIIN_AVATAR_PATH);
}

export function JiinAvatar({ size = "md", basePath }: AvatarProps) {
  const px = AVATAR_PX[size];

  return (
    <span
      className="inline-flex shrink-0 overflow-hidden rounded-full bg-slate-900 shadow-sm ring-2 ring-white/90 dark:ring-slate-800/90"
      style={{ width: px, height: px }}
      aria-hidden
    >
      <img
        src={jiinAvatarSrc(basePath)}
        alt=""
        width={px}
        height={px}
        className="h-full w-full object-cover object-[center_18%]"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

export function JiinTypingIndicator({ basePath }: { basePath?: string }) {
  return (
    <div className="flex items-end gap-2">
      <JiinAvatar basePath={basePath} />
      <div className="rounded-2xl rounded-bl-md border border-slate-200/80 bg-slate-50 px-3.5 py-3 dark:border-slate-700/80 dark:bg-slate-800/90">
        <span className="flex items-center gap-1" aria-label="지인이 입력 중">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500"
              style={{ animationDelay: `${i * 0.14}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

type BubbleProps = {
  role: "user" | "assistant";
  children: ReactNode;
  showLabel?: boolean;
  basePath?: string;
  showAvatar?: boolean;
};

export function JiinChatBubble({
  role,
  children,
  showLabel = true,
  basePath,
  showAvatar = true,
}: BubbleProps) {
  if (role === "user") {
    return (
      <div className="flex flex-col items-end gap-1">
        {showLabel ? <span className="px-1 text-[10px] font-medium text-slate-400">나</span> : null}
        <div className="max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-info px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={showAvatar ? "flex items-end gap-2" : ""}>
      {showAvatar ? <JiinAvatar basePath={basePath} /> : null}
      <div className={showAvatar ? "min-w-0 flex-1" : "w-full"}>
        {showLabel && showAvatar ? (
          <p className="mb-1 px-0.5 text-[10px] font-semibold text-info">지인</p>
        ) : null}
        <div className="max-w-[96%] rounded-2xl rounded-bl-md border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}
