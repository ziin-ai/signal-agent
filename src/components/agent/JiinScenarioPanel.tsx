import { useState } from "react";
import type { ChecklistItem, ScenarioCard } from "../../lib/agent/types";
import { withBasePath } from "../../lib/agent/chat-client";
import JiinChatMarkdown from "./JiinChatMarkdown";

type Props = {
  intro: string;
  scenarios: ScenarioCard[];
  checklist: ChecklistItem[];
  basePath: string;
};

const CARD_STYLES: Record<ScenarioCard["kind"], string> = {
  bull: "border-success/40 bg-success/5 dark:bg-success/10",
  base: "border-info/40 bg-info/5 dark:bg-info/10",
  bear: "border-danger/40 bg-danger/5 dark:bg-danger/10",
};

const CARD_LABELS: Record<ScenarioCard["kind"], string> = {
  bull: "상향",
  base: "기본",
  bear: "신중",
};

export default function JiinScenarioPanel({ intro, scenarios, checklist, basePath }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activeCard, setActiveCard] = useState(0);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const card = scenarios[activeCard];

  return (
    <div className="space-y-3">
      <JiinChatMarkdown content={intro} className="text-sm leading-relaxed text-slate-700 dark:text-slate-200" />

      <div className="flex gap-1.5">
        {scenarios.map((item, index) => (
          <button
            key={item.kind}
            type="button"
            className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
              activeCard === index
                ? "bg-info text-white"
                : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            }`}
            onClick={() => setActiveCard(index)}
          >
            {CARD_LABELS[item.kind]}
          </button>
        ))}
      </div>

      {card ? (
        <article className={`rounded-xl border px-3 py-3 ${CARD_STYLES[card.kind]}`}>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            {card.title}
          </h4>
          <JiinChatMarkdown
            content={card.body}
            className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100"
          />
        </article>
      ) : null}

      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700/80 dark:bg-slate-800/50">
        <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">판단 체크리스트</p>
        <ul className="space-y-2">
          {checklist.map((item) => {
            const done = checked.has(item.id);
            return (
              <li key={item.id}>
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-[var(--color-info)]"
                    checked={done}
                    onChange={() => toggle(item.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm ${done ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-800 dark:text-slate-100"}`}
                    >
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                      {item.hint}
                    </span>
                    {item.href ? (
                      <a
                        href={withBasePath(basePath, item.href)}
                        className="mt-1 inline-block text-[11px] font-medium text-info hover:underline"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        바로 보기 →
                      </a>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
