import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalystItem } from "../../lib/catalysts";
import type { ChatResponse } from "../../lib/agent/chat-client";
import { readPageAgentContext, sendChatMessage, withBasePath } from "../../lib/agent/chat-client";
import {
  explainSourceChip,
  JIIN_CITE_EVENT,
  type JiinCiteDetail,
  type PostSourceChip,
} from "../../lib/agent/cite-events";
import {
  dispatchJiinCompanionRun,
  JIIN_COMPANION_RUN_EVENT,
  scrollToDashboardCompanion,
  type JiinCompanionRunDetail,
} from "../../lib/agent/companion-events";
import { useJiinChat, stripJiinDisclaimer, buildJiinOpening } from "../../lib/agent/use-jiin-chat";
import { observeMarkdownSections, setContraFirstMode } from "../../lib/post-section-tracker";
import JiinChatPanel from "./JiinChatPanel";
import JiinChatMarkdown from "./JiinChatMarkdown";
import { JiinAvatar } from "./JiinChatPersona";
import JiinJourneyPanel from "./JiinJourneyPanel";
import JiinScenarioPanel from "./JiinScenarioPanel";

type Props = {
  slug: string;
  symbol: string;
  summary: string;
  conviction: number;
  trustScore: number;
  catalysts: CatalystItem[];
  sources: PostSourceChip[];
  basePath: string;
  /** compact: legacy · hero: 대시보드 HeroCard · sidebar: 분석글·TrustCard 우측 */
  variant?: "compact" | "hero" | "sidebar";
  /** 대시보드: 채팅형 UI (여정 칩·입력·대화 기록) */
  interactive?: boolean;
  /** 스크롤·이벤트 앵커 (대시보드 TrustCard) */
  anchorId?: string;
};

type ActiveView =
  | { kind: "chat"; data: ChatResponse }
  | { kind: "cite"; sourceId: string; title: string; body: string; url: string }
  | null;

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?。]+[.!?。]?/);
  return (match?.[0] ?? text).trim();
}

const QUICK_ACTIONS: Array<{ journey: NonNullable<ChatResponse["journey"]>; label: string; message: string }> = [
  { journey: "summary-3", label: "3줄", message: "3줄 요약" },
  { journey: "contra", label: "반박", message: "반박 근거" },
  { journey: "scenario", label: "판단", message: "판단 프레임" },
];

export default function PostJiinCompanion({
  slug,
  symbol,
  summary,
  conviction,
  trustScore,
  catalysts,
  sources,
  basePath,
  variant = "sidebar",
  interactive = false,
  anchorId,
}: Props) {
  const [active, setActive] = useState<ActiveView>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contraFirst, setContraFirst] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  const whisper = firstSentence(summary);
  const nearest = catalysts[0];
  const isHero = variant === "hero";
  const isCompact = variant === "compact" || isHero;
  const isSidebar = variant === "sidebar";
  const isChat = isSidebar && interactive;
  const contraCount = sources.filter((source) => source.tier === 0).length;

  const openingGreeting = buildJiinOpening(whisper, symbol);
  const {
    messages: chatMessages,
    input: chatInput,
    setInput: setChatInput,
    loading: chatLoading,
    error: chatError,
    send: chatSend,
    reset: chatReset,
    appendAssistant,
    suggestedPrompts,
    promptsLoading,
  } = useJiinChat({ basePath, slug, symbol, greeting: openingGreeting });

  const run = useCallback(
    async (message: string, journey?: ChatResponse["journey"]) => {
      if (isChat) {
        await chatSend(message, journey);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await sendChatMessage(basePath, {
          message,
          journey,
          context: { ...readPageAgentContext(), slug, symbol },
        });
        setActive({ kind: "chat", data: response });
      } catch {
        setError("잠시 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    },
    [basePath, chatSend, isChat, slug, symbol],
  );

  const showSource = useCallback(
    (sourceId: string) => {
      const source = sources.find((item) => item.id === sourceId);
      if (!source) {
        const msg = `출처 ${sourceId}를 이 글에서 찾지 못했어요.`;
        if (isChat) {
          appendAssistant({ content: msg });
        } else {
          setError(msg);
        }
        return;
      }
      const explained = explainSourceChip(source);
      if (isChat) {
        appendAssistant({
          content: `${explained.title}\n\n${explained.body}\n\n원문: ${explained.url}`,
        });
      } else {
        setActive({
          kind: "cite",
          sourceId,
          title: explained.title,
          body: explained.body,
          url: explained.url,
        });
      }
      setError(null);
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [appendAssistant, isChat, sources],
  );

  useEffect(() => {
    if (isHero) return;

    function onCite(ev: Event) {
      const detail = (ev as CustomEvent<JiinCiteDetail>).detail;
      if (!detail?.sourceId) return;
      showSource(detail.sourceId);
    }

    window.addEventListener(JIIN_CITE_EVENT, onCite);
    return () => window.removeEventListener(JIIN_CITE_EVENT, onCite);
  }, [isHero, showSource]);

  useEffect(() => {
    if (isHero) return;

    function onDocClick(ev: MouseEvent) {
      const target = ev.target;
      if (!(target instanceof Element)) return;
      const chip = target.closest("[data-jiin-cite-id]");
      if (!(chip instanceof HTMLElement)) return;
      if (target.closest(".jiin-cite-ext")) return;
      const sourceId = chip.dataset.jiinCiteId;
      if (!sourceId) return;
      ev.preventDefault();
      showSource(sourceId);
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isHero, showSource]);

  useEffect(() => {
    if (!isSidebar || isChat) return;
    return observeMarkdownSections(setActiveSection);
  }, [isSidebar, isChat]);

  useEffect(() => {
    if (!isSidebar) return;

    function onCompanionRun(ev: Event) {
      const detail = (ev as CustomEvent<JiinCompanionRunDetail>).detail;
      if (!detail?.message) return;
      if (detail.scroll) scrollToDashboardCompanion();
      void run(detail.message, detail.journey);
    }

    window.addEventListener(JIIN_COMPANION_RUN_EVENT, onCompanionRun);
    return () => window.removeEventListener(JIIN_COMPANION_RUN_EVENT, onCompanionRun);
  }, [isSidebar, run]);

  useEffect(() => {
    setActive(null);
    setError(null);
    setContraFirst(false);
    setActiveSection(null);
    if (isChat) {
      chatReset();
    }
  }, [slug, isChat, chatReset]);

  useEffect(() => {
    setContraFirstMode(contraFirst);
    return () => setContraFirstMode(false);
  }, [contraFirst]);

  const toggleContraFirst = useCallback(() => {
    setContraFirst((prev) => {
      const next = !prev;
      if (next && contraCount > 0) {
        void run("반박 근거만 보기", "contra");
      }
      return next;
    });
  }, [contraCount, run]);

  const delegateRun = useCallback((message: string, journey?: ChatResponse["journey"]) => {
    dispatchJiinCompanionRun({ message, journey, scroll: true });
  }, []);

  const contextMeta = (
    <div className="rounded-lg border border-slate-200/60 bg-slate-50/70 px-2.5 py-2 dark:border-slate-700/60 dark:bg-slate-800/40">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span>확신 {conviction}/5</span>
        <span>·</span>
        <span>신뢰 {trustScore.toFixed(1)}</span>
        {contraCount > 0 ? (
          <>
            <span>·</span>
            <span>T0 {contraCount}건</span>
          </>
        ) : null}
        {nearest ? (
          <>
            <span>·</span>
            <button
              type="button"
              className="font-medium text-info hover:underline"
              disabled={isChat ? chatLoading : loading}
              onClick={() => void run(`${nearest.title} 촉매가 이 글과 어떻게 연결돼?`, "catalysts")}
            >
              {nearest.badge}{" "}
              {nearest.title.length > 18 ? `${nearest.title.slice(0, 18)}…` : nearest.title}
            </button>
          </>
        ) : null}
        {contraCount > 0 ? (
          <>
            <span>·</span>
            <button
              type="button"
              disabled={isChat ? chatLoading : loading}
              aria-pressed={contraFirst}
              className={
                contraFirst
                  ? "rounded border border-danger/40 bg-danger/10 px-1.5 py-0.5 font-medium text-danger"
                  : "font-medium text-slate-600 hover:text-danger disabled:opacity-50 dark:text-slate-300"
              }
              onClick={toggleContraFirst}
            >
              반박 먼저
            </button>
          </>
        ) : null}
      </div>
    </div>
  );

  const chatPrompts = suggestedPrompts;

  if (isChat) {
    return (
      <aside
        id={anchorId}
        ref={rootRef}
        className="not-prose flex max-h-[min(88vh,720px)] min-h-[420px] flex-col overflow-hidden rounded-xl border border-slate-300/70 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-700/70 dark:from-slate-900 dark:to-slate-900/95"
        aria-label="지인과 대화"
      >
        <header className="mb-3 flex shrink-0 items-center gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-700/80">
          <JiinAvatar size="lg" basePath={basePath} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">지인</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden />
                함께 읽는 중
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">출처·시나리오 기반으로 답해요</p>
          </div>
        </header>

        <JiinChatPanel
          embedded
          basePath={basePath}
          messages={chatMessages}
          loading={chatLoading}
          error={chatError}
          input={chatInput}
          onInputChange={setChatInput}
          onSend={(text) => void chatSend(text)}
          onJourney={(message, journey) => void chatSend(message, journey)}
          contextSlot={contextMeta}
          journeyAtBottom
          promptSuggestions={chatPrompts}
          promptsLoading={promptsLoading}
          inputPlaceholder="지인에게 물어보기… (Enter로 보내기)"
          listClassName="flex min-h-[10rem] flex-1 flex-col gap-4 overflow-y-auto px-0.5 py-1"
        />
      </aside>
    );
  }

  return (
    <aside
      id={anchorId}
      ref={rootRef}
      className={
        isCompact
          ? "not-prose mb-3 rounded-lg border border-info/20 bg-info/5 px-3 py-2.5 dark:bg-info/10"
          : "not-prose rounded-xl border border-slate-300/70 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900"
      }
      aria-label="읽기 동행"
    >
      {!isCompact ? (
        <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">지인</p>
      ) : null}
      <p
        className={
          isCompact
            ? "text-[13px] leading-relaxed text-slate-700 dark:text-slate-200"
            : "text-sm leading-relaxed text-slate-700 dark:text-slate-200"
        }
      >
        <span className="font-semibold text-info">지인</span>
        <span className="text-slate-400"> · </span>
        {whisper}
        <button
          type="button"
          className="ml-1.5 text-xs font-medium text-info underline-offset-2 hover:underline"
          onClick={() =>
            isHero
              ? delegateRun("이 글 핵심을 조금 더 풀어줘", "summary-3")
              : void run("이 글 핵심을 조금 더 풀어줘", "summary-3")
          }
        >
          왜?
        </button>
      </p>

      {isHero ? (
        <>
          {nearest ? (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                className="font-medium text-info hover:underline"
                onClick={() =>
                  delegateRun(`${nearest.title} 촉매가 이 글과 어떻게 연결돼?`, "catalysts")
                }
              >
                {nearest.badge}{" "}
                {nearest.title.length > 22 ? `${nearest.title.slice(0, 22)}…` : nearest.title}
              </button>
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
            {QUICK_ACTIONS.map((action, index) => (
              <span key={action.journey} className="inline-flex items-center gap-1">
                {index > 0 ? <span className="text-slate-300 dark:text-slate-600">|</span> : null}
                <button
                  type="button"
                  className="font-medium text-slate-600 hover:text-info dark:text-slate-300"
                  onClick={() => delegateRun(action.message, action.journey)}
                >
                  {action.label}
                </button>
              </span>
            ))}
          </div>
        </>
      ) : null}

      {isSidebar ? (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>확신 {conviction}/5</span>
            <span>·</span>
            <span>신뢰 {trustScore.toFixed(1)}</span>
            {contraCount > 0 ? (
              <>
                <span>·</span>
                <span>T0 {contraCount}건</span>
              </>
            ) : null}
            {nearest ? (
              <>
                <span>·</span>
                <button
                  type="button"
                  className="font-medium text-info hover:underline"
                  onClick={() => void run(`${nearest.title} 촉매가 이 글과 어떻게 연결돼?`, "catalysts")}
                >
                  {nearest.badge}{" "}
                  {nearest.title.length > 18 ? `${nearest.title.slice(0, 18)}…` : nearest.title}
                </button>
              </>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1 text-xs">
            {QUICK_ACTIONS.map((action, index) => (
              <span key={action.journey} className="inline-flex items-center gap-1">
                {index > 0 ? <span className="text-slate-300 dark:text-slate-600">|</span> : null}
                <button
                  type="button"
                  disabled={loading}
                  className="font-medium text-slate-600 hover:text-info disabled:opacity-50 dark:text-slate-300"
                  onClick={() => void run(action.message, action.journey)}
                >
                  {action.label}
                </button>
              </span>
            ))}
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button
              type="button"
              disabled={loading}
              className="font-medium text-slate-600 hover:text-info disabled:opacity-50 dark:text-slate-300"
              onClick={() => void run("신뢰도 점수 설명", "contra")}
            >
              신뢰도
            </button>
            {contraCount > 0 ? (
              <>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  disabled={loading}
                  aria-pressed={contraFirst}
                  className={
                    contraFirst
                      ? "rounded border border-danger/40 bg-danger/10 px-1.5 py-0.5 font-medium text-danger"
                      : "font-medium text-slate-600 hover:text-danger disabled:opacity-50 dark:text-slate-300"
                  }
                  onClick={toggleContraFirst}
                >
                  반박 먼저
                </button>
              </>
            ) : null}
          </div>

          {activeSection ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-slate-100/80 px-2 py-1.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <span className="truncate">
                읽는 중: <span className="font-medium text-slate-800 dark:text-slate-100">{activeSection}</span>
              </span>
              <button
                type="button"
                disabled={loading}
                className="shrink-0 font-medium text-info hover:underline disabled:opacity-50"
                onClick={() => void run(`"${activeSection}" 섹션만 짧게 정리해줘`, "summary-3")}
              >
                이 섹션
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {!isHero && loading ? <p className="mt-2 text-xs text-slate-500">지인이 정리 중…</p> : null}
      {!isHero && error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}

      {!isHero && active && !loading ? (
        <div className="mt-3 border-t border-info/15 pt-3">
          {active.kind === "cite" ? (
            <>
              <p className="text-xs font-semibold text-info">{active.title}</p>
              <JiinChatMarkdown
                content={active.body}
                className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200"
              />
              <a
                href={active.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-info hover:underline"
              >
                원문 ↗
              </a>
            </>
          ) : active.data.journey === "scenario" && active.data.scenarios && active.data.checklist ? (
            <JiinScenarioPanel
              intro={stripJiinDisclaimer(active.data.text)}
              scenarios={active.data.scenarios}
              checklist={active.data.checklist}
              basePath={basePath}
            />
          ) : active.data.steps && active.data.steps.length > 0 ? (
            <JiinJourneyPanel intro={stripJiinDisclaimer(active.data.text)} steps={active.data.steps} />
          ) : (
            <JiinChatMarkdown
              content={stripJiinDisclaimer(active.data.text)}
              className="text-sm text-slate-700 dark:text-slate-200"
            />
          )}
          {active.kind === "chat" && active.data.citations.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs">
              {active.data.citations.slice(0, 3).map((cite) => (
                <li key={cite.href}>
                  <a href={withBasePath(basePath, cite.href)} className="text-info hover:underline">
                    {cite.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
