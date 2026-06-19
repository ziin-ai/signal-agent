import { useState } from "react";
import type { JourneyStep } from "../../lib/agent/types";
import JiinChatMarkdown from "./JiinChatMarkdown";

type Props = {
  intro: string;
  steps: JourneyStep[];
};

export default function JiinJourneyPanel({ intro, steps }: Props) {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  return (
    <div className="space-y-3">
      <JiinChatMarkdown content={intro} className="text-sm leading-relaxed text-slate-700 dark:text-slate-200" />

      {steps.length > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-lg bg-slate-200/80 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200"
            disabled={index === 0}
            onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
          >
            이전
          </button>
          <span className="text-[11px] text-slate-500">
            {index + 1} / {steps.length}
          </span>
          <button
            type="button"
            className="rounded-lg bg-slate-200/80 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200"
            disabled={index >= steps.length - 1}
            onClick={() => setIndex((prev) => Math.min(steps.length - 1, prev + 1))}
          >
            다음
          </button>
        </div>
      ) : null}

      {step ? (
        <article className="rounded-xl border border-info/30 bg-info/5 px-3 py-3 dark:border-info/40 dark:bg-info/10">
          <h4 className="text-xs font-semibold text-info">{step.title}</h4>
          <JiinChatMarkdown
            content={step.body}
            className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100"
          />
        </article>
      ) : null}
    </div>
  );
}
