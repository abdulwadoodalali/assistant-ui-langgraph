"use client";

import { useRef } from "react";
import { Thread } from "@assistant-ui/react";
import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";
import { makeMarkdownText } from "@assistant-ui/react-markdown";

import { createThread, getThreadState, sendMessage } from "@/lib/chatApi";

const MarkdownText = makeMarkdownText();

export function MyAssistant() {
  const threadIdRef = useRef<string | undefined>();
  const runtime = useLangGraphRuntime({
    threadId: threadIdRef.current,
    stream: async (messages) => {
      if (!threadIdRef.current) {
        const { thread_id } = await createThread();
        threadIdRef.current = thread_id;
      }
      const threadId = threadIdRef.current;
      return sendMessage({
        threadId,
        messages,
      });
    },
    onSwitchToNewThread: async () => {
      const { thread_id } = await createThread();
      threadIdRef.current = thread_id;
    },
    onSwitchToThread: async (threadId) => {
      const state = await getThreadState(threadId);
      threadIdRef.current = threadId;
      return { messages: state.values.messages };
    },
  });

  return (
    <Thread
      welcome={{
        suggestions: [
          {
            prompt: "How is John Doe Doing on the 18th of June 2024?",
          },
          {
            prompt: "How is Brian Stone doing on June 21, 2023?",
          },
          {
            prompt: "can you compare John Doe's state between today (18th of June 2024) and his pre-op on the 18th of March 2024?",
          },
          {
            prompt: "Taking into consideration the data for John Doe since his admission on the 14th of June up until his last day, give me a daily summary to ICD billing codes, along with a full summary of their journey with a final ICD codes for the full stay.",
          },
        ],
      }}
      runtime={runtime}
      assistantMessage={{ components: { Text: MarkdownText } }}
    />
  );
}
