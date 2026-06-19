import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  className?: string;
};

export default function JiinChatMarkdown({ content, className = "" }: Props) {
  if (!content.trim()) return null;

  return (
    <div className={`jiin-chat-markdown ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
