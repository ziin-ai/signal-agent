import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JiinChatPanel from "./JiinChatPanel";
import { JiinAvatar } from "./JiinChatPersona";
import {
  JIIN_OPEN_EVENT,
  type ChatResponse,
  type JiinOpenDetail,
} from "../../lib/agent/chat-client";
import {
  buildWidgetGreeting,
  JIIN_JOURNEY_LAUNCHERS,
  useJiinChat,
} from "../../lib/agent/use-jiin-chat";
import { usePageAgentContext } from "../../lib/agent/use-page-agent-context";

type Props = {
  basePath: string;
  /** 읽기 모드: FAB 축소·낮은 위치 */
  compact?: boolean;
};

export default function JiinWidget({ basePath, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pageContext = usePageAgentContext();
  const greeting = useMemo(() => buildWidgetGreeting(pageContext.title), [pageContext.title]);

  const chat = useJiinChat({
    basePath,
    slug: pageContext.slug,
    symbol: pageContext.symbol,
    greeting,
  });

  const send = useCallback(
    async (text: string, journey?: ChatResponse["journey"]) => {
      await chat.send(text, journey);
    },
    [chat.send],
  );

  useEffect(() => {
    function onOpen(ev: Event) {
      const detail = (ev as CustomEvent<JiinOpenDetail>).detail;
      setOpen(true);
      setMinimized(false);
      if (detail?.journey) {
        void send(
          detail.journey === "scenario"
            ? "판단 프레임 보기"
            : (JIIN_JOURNEY_LAUNCHERS.find((j) => j.id === detail.journey)?.message ?? "여정 시작"),
          detail.journey,
        );
        return;
      }
      if (detail?.message) {
        chat.setInput(detail.message);
      }
    }

    window.addEventListener(JIIN_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(JIIN_OPEN_EVENT, onOpen);
  }, [chat.setInput, send]);

  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === "Escape" && open) {
        setOpen(false);
        setMinimized(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const statusLine = pageContext.title
    ? "이 글을 읽고 답해드려요 · 온라인"
    : "분석·시나리오 기준 · 온라인";

  const panelShell =
    "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900";

  return (
    <>
      {open && !minimized ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="지인과 대화"
          className={
            compact
              ? `${panelShell} bottom-[4.5rem] right-4 h-[min(72vh,520px)] w-[min(100vw-2rem,22rem)]`
              : `${panelShell} bottom-[4.75rem] right-4 h-[min(72vh,560px)] w-[min(100vw-2rem,24rem)]`
          }
        >
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-2.5">
              <JiinAvatar size="lg" basePath={basePath} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">지인.ai</p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{statusLine}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="최소화"
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                onClick={() => setMinimized(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="닫기"
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                onClick={() => {
                  setOpen(false);
                  setMinimized(false);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-1">
            <JiinChatPanel
              embedded
              variant="widget"
              basePath={basePath}
              messages={chat.messages}
              loading={chat.loading}
              error={chat.error}
              input={chat.input}
              onInputChange={chat.setInput}
              onSend={(text) => void send(text)}
              onJourney={(message, journey) => void send(message, journey)}
              inputPlaceholder="지인에게 물어보기…"
              greetingPrompts={chat.suggestedPrompts}
              promptsLoading={chat.promptsLoading}
            />
          </div>
        </div>
      ) : null}

      {open && minimized ? (
        <button
          type="button"
          className="fixed bottom-[4.75rem] right-4 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          onClick={() => setMinimized(false)}
        >
          <JiinAvatar size="md" basePath={basePath} />
          지인.ai
        </button>
      ) : null}

      {!open ? (
        <button
          type="button"
          aria-label="지인에게 물어보기"
          aria-expanded={false}
          className={
            compact
              ? "jiin-fab fixed bottom-4 right-4 z-50 gap-2 px-4 py-2.5 text-[13px]"
              : "jiin-fab fixed bottom-5 right-5 z-50 gap-2.5 px-6 py-3.5 text-[15px]"
          }
          onClick={() => setOpen(true)}
        >
          <JiinAvatar size="md" basePath={basePath} />
          <span className="font-medium leading-none tracking-tight">지인에게 물어보기</span>
        </button>
      ) : null}
    </>
  );
}
