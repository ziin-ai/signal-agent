import { useEffect, useRef, type ReactNode } from "react";
import { withBasePath } from "../../lib/agent/chat-client";
import {
  JIIN_JOURNEY_LAUNCHERS,
  WIDGET_GREETING_PROMPTS,
  type JiinChatMessage,
} from "../../lib/agent/use-jiin-chat";
import { JiinAvatar, JiinChatBubble, JiinTypingIndicator } from "./JiinChatPersona";
import JiinChatMarkdown from "./JiinChatMarkdown";
import JiinJourneyPanel from "./JiinJourneyPanel";
import JiinScenarioPanel from "./JiinScenarioPanel";

type Props = {
  basePath: string;
  messages: JiinChatMessage[];
  loading: boolean;
  error: string | null;
  input: string;
  onInputChange: (value: string) => void;
  onSend: (text: string) => void;
  onJourney: (message: string, journey: NonNullable<JiinChatMessage["journey"]>) => void;
  contextSlot?: ReactNode;
  listClassName?: string;
  embedded?: boolean;
  variant?: "default" | "widget";
  journeyAtBottom?: boolean;
  inputPlaceholder?: string;
  promptSuggestions?: Array<{ label: string; message: string }>;
  greetingPrompts?: Array<{ label: string; message: string }>;
  promptsLoading?: boolean;
};

function JourneyChips({
  loading,
  onJourney,
}: {
  loading: boolean;
  onJourney: Props["onJourney"];
}) {
  return (
    <div className="flex flex-wrap gap-1.5 px-0.5">
      {JIIN_JOURNEY_LAUNCHERS.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={loading}
          className="rounded-full border border-info/25 bg-info/5 px-2.5 py-1 text-[11px] font-medium text-info transition hover:bg-info/15 disabled:opacity-50"
          onClick={() => onJourney(item.message, item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function WidgetCitationChips({
  basePath,
  citations,
}: {
  basePath: string;
  citations: NonNullable<JiinChatMessage["citations"]>;
}) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {citations.slice(0, 4).map((cite) => (
        <a
          key={`${cite.href}-${cite.title}`}
          href={withBasePath(basePath, cite.href)}
          className="rounded-full border border-info/25 bg-white px-2.5 py-1 text-[11px] font-medium text-info shadow-sm transition hover:border-info/40 hover:bg-info/5 dark:bg-slate-900"
        >
          {cite.title.length > 22 ? `${cite.title.slice(0, 20)}…` : cite.title}
        </a>
      ))}
    </div>
  );
}

function WidgetAssistantBubble({
  children,
  citations,
  basePath,
}: {
  children: ReactNode;
  citations?: JiinChatMessage["citations"];
  basePath: string;
}) {
  return (
    <div className="jiin-widget-bubble jiin-widget-bubble-flat w-full rounded-xl px-3.5 py-3 text-[13px] leading-[1.65] text-slate-700 dark:text-slate-100">
      {children}
      {citations && citations.length > 0 ? (
        <WidgetCitationChips basePath={basePath} citations={citations} />
      ) : null}
    </div>
  );
}

function WidgetUserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="jiin-widget-bubble-user max-w-[88%] rounded-xl rounded-br-sm px-4 py-2.5 text-[13px] leading-[1.6] text-white">
        {children}
      </div>
    </div>
  );
}

function WidgetSuggestionChips({
  items,
  onPick,
  title = "이렇게 물어보세요",
  indented = true,
}: {
  items: Array<{ label: string; message: string }>;
  onPick: (message: string) => void;
  title?: string;
  indented?: boolean;
}) {
  return (
    <div className={indented ? "ml-[3.25rem]" : ""}>
      <p className="mb-2 text-[10px] font-medium tracking-wide text-slate-400">{title}</p>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="jiin-widget-prompt group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-200"
            onClick={() => onPick(item.message)}
          >
            <span>{item.label}</span>
            <svg
              className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-info"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function JiinChatPanel({
  basePath,
  messages,
  loading,
  error,
  input,
  onInputChange,
  onSend,
  onJourney,
  contextSlot,
  listClassName,
  embedded = false,
  variant = "default",
  journeyAtBottom = false,
  inputPlaceholder = "지인에게 물어보기…",
  promptSuggestions,
  greetingPrompts = WIDGET_GREETING_PROMPTS,
  promptsLoading = false,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isWidget = variant === "widget";
  const hideMessageAvatar = isWidget || embedded;
  const lastMessage = messages[messages.length - 1];
  const isOpeningTurn = messages.length === 1 && messages[0]?.id === "greeting";
  const followUpItems = promptSuggestions ?? greetingPrompts;
  const showFollowUpPrompts =
    !loading && !error && lastMessage?.role === "assistant" && (isWidget || Boolean(promptSuggestions));
  const followUpTitle = isOpeningTurn ? "이렇게 물어보세요" : "이어서 물어보세요";

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, showFollowUpPrompts, promptsLoading, followUpItems]);

  const renderMessage = (msg: JiinChatMessage) => {
    if (isWidget) {
      if (msg.role === "user") {
        return <WidgetUserBubble>{msg.content}</WidgetUserBubble>;
      }

      const body =
        msg.journey === "scenario" && msg.scenarios && msg.checklist ? (
          <JiinScenarioPanel
            intro={msg.content}
            scenarios={msg.scenarios}
            checklist={msg.checklist}
            basePath={basePath}
          />
        ) : msg.steps && msg.steps.length > 0 ? (
          <JiinJourneyPanel intro={msg.content} steps={msg.steps} />
        ) : (
          <JiinChatMarkdown content={msg.content} />
        );

      return (
        <WidgetAssistantBubble basePath={basePath} citations={msg.citations}>
          {body}
        </WidgetAssistantBubble>
      );
    }

    return (
      <JiinChatBubble
        key={msg.id}
        role={msg.role}
        basePath={basePath}
        showAvatar={!hideMessageAvatar}
        showLabel={!hideMessageAvatar}
      >
        {msg.role === "assistant" && msg.journey === "scenario" && msg.scenarios && msg.checklist ? (
          <JiinScenarioPanel
            intro={msg.content}
            scenarios={msg.scenarios}
            checklist={msg.checklist}
            basePath={basePath}
          />
        ) : msg.role === "assistant" && msg.steps && msg.steps.length > 0 ? (
          <JiinJourneyPanel intro={msg.content} steps={msg.steps} />
        ) : (
          <JiinChatMarkdown content={msg.content} />
        )}
        {msg.role === "assistant" && msg.citations && msg.citations.length > 0 ? (
          <ul className="mt-2 space-y-1 border-t border-slate-300/50 pt-2 text-xs dark:border-slate-600/50">
            {msg.citations.slice(0, 4).map((cite) => (
              <li key={`${cite.href}-${cite.title}`}>
                <a href={withBasePath(basePath, cite.href)} className="font-medium text-info hover:underline">
                  {cite.title}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </JiinChatBubble>
    );
  };

  return (
    <div className={embedded ? "flex min-h-0 flex-1 flex-col" : "flex flex-col overflow-hidden"}>
      {!isWidget && !journeyAtBottom ? (
        <div className="border-b border-slate-200/80 px-0.5 pb-2 dark:border-slate-700/80">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">여정</p>
          <JourneyChips loading={loading} onJourney={onJourney} />
        </div>
      ) : null}

      <div
        ref={listRef}
        className={
          listClassName ??
          (isWidget
            ? "flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-2"
            : "mt-2 flex max-h-[min(40vh,18rem)] flex-col gap-4 overflow-y-auto px-0.5 py-1")
        }
      >
        {messages.map((msg) => (
          <div key={msg.id}>{renderMessage(msg)}</div>
        ))}
        {showFollowUpPrompts && promptsLoading ? (
          <div className="text-xs text-slate-400">
            {isOpeningTurn ? "이 글에 맞는 질문을 고르는 중…" : "이어서 물어볼 질문을 고르는 중…"}
          </div>
        ) : null}
        {showFollowUpPrompts && !promptsLoading && followUpItems.length > 0 ? (
          <WidgetSuggestionChips
            items={followUpItems}
            onPick={onSend}
            title={followUpTitle}
            indented={!isWidget}
          />
        ) : null}
        {loading ? (
          isWidget || hideMessageAvatar ? (
            <div className="jiin-widget-bubble jiin-widget-bubble-flat rounded-xl px-4 py-3">
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
          ) : (
            <JiinTypingIndicator basePath={basePath} />
          )
        ) : null}
        {error ? (
          isWidget || hideMessageAvatar ? (
            <p className="jiin-widget-bubble jiin-widget-bubble-flat rounded-xl px-3 py-2 text-xs text-danger">
              {error}
            </p>
          ) : (
            <div className="flex items-start gap-2.5">
              <JiinAvatar size="md" basePath={basePath} />
              <p className="jiin-widget-bubble rounded-xl rounded-tl-sm px-3 py-2 text-xs text-danger">
                {error}
              </p>
            </div>
          )
        ) : null}
      </div>

      {contextSlot ? <div className="mt-2 shrink-0">{contextSlot}</div> : null}

      <div
        className={
          isWidget
            ? "mt-auto shrink-0 border-t border-slate-200 bg-white px-0.5 pt-3 dark:border-slate-800 dark:bg-slate-900"
            : "mt-auto shrink-0 border-t border-slate-200/80 pt-3 dark:border-slate-700/80"
        }
      >
        <div className={isWidget ? "flex items-center gap-2" : "flex gap-2"}>
          <textarea
            ref={inputRef}
            rows={isWidget ? 1 : 2}
            value={input}
            placeholder={inputPlaceholder}
            aria-label="지인에게 메시지 보내기"
            className={
              isWidget
                ? "min-h-[2.75rem] flex-1 resize-none rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-info/50 focus:ring-2 focus:ring-info/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                : "min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-slate-300/80 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-info/30 placeholder:text-slate-400 focus:border-info/40 focus:bg-white focus:ring-2 dark:border-slate-600 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:bg-slate-950"
            }
            onChange={(ev) => onInputChange(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
                onSend(input);
              }
            }}
            disabled={loading}
          />
          <button
            type="button"
            aria-label="보내기"
            className={
              isWidget
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
                : "self-end rounded-2xl bg-info px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
            }
            onClick={() => onSend(input)}
            disabled={loading || !input.trim()}
          >
            {isWidget ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 19V5M12 5L6 11M12 5L18 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              "보내기"
            )}
          </button>
        </div>

        {!isWidget && journeyAtBottom ? (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-medium text-slate-400">이렇게 물어보세요</p>
            <JourneyChips loading={loading} onJourney={onJourney} />
          </div>
        ) : null}

        <p className={`text-center text-[10px] leading-snug text-slate-400 ${isWidget ? "mt-2" : "mt-2"}`}>
          {isWidget
            ? "투자 참고용이며 매매 권유가 아니에요"
            : "매수·매도 질문은 시나리오·체크리스트로 안내해요. 투자 판단은 본인 책임입니다."}
        </p>
      </div>
    </div>
  );
}
