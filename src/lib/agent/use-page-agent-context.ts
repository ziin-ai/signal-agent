import { useEffect, useState } from "react";
import { readPageAgentContext } from "./chat-client";

export function usePageAgentContext() {
  const [context, setContext] = useState(() => readPageAgentContext());

  useEffect(() => {
    function refresh() {
      setContext(readPageAgentContext());
    }
    refresh();
    document.addEventListener("astro:page-load", refresh);
    return () => document.removeEventListener("astro:page-load", refresh);
  }, []);

  return context;
}
