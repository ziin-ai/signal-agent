import { openJiinChat } from "../../lib/agent/chat-client";
import type { ChatRequest } from "../../lib/agent/chat-client";

type Props = {
  /** Prefill when the panel opens */
  suggestedQuestion?: string;
  /** Zero-input journey (e.g. scenario checklist) */
  journey?: ChatRequest["journey"];
  className?: string;
};

export default function JiinAskButton({ suggestedQuestion, journey, className = "" }: Props) {
  const label =
    journey === "scenario"
      ? "판단 프레임 보기"
      : suggestedQuestion ?? "지인에게 물어보기";

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 px-4 py-2.5 text-sm font-medium text-info transition hover:bg-info/10 dark:border-info/40 dark:bg-info/10 dark:hover:bg-info/15 ${className}`}
      onClick={() => openJiinChat({ message: suggestedQuestion, journey })}
    >
      {label}
    </button>
  );
}
