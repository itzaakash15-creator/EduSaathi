"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Loader2, Bot, User, Trash2, Sparkles } from "lucide-react";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { chatWithAssistant, createChatMessage } from "@/lib/api";
import { getUserChatMessages, saveChatMessage, clearUserChatMessages } from "@/lib/db";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SUGGESTED_PROMPTS = [
  "What schemes am I eligible for?",
  "What documents do I need for NSP?",
  "When is the PM Internship deadline?",
  "How do I improve my match score?",
];

function renderMarkdownish(text: string) {
  return text.split("\n").map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx}>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={i}>{part}</span>;
        })}
        {lineIdx < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export default function ChatPage() {
  const { user, profile, isDemo } = useAuth();
  
  const defaultInitialMsg = useMemo(() => {
    const firstName = profile?.name ? profile.name.split(" ")[0] : "Aakash";
    return createChatMessage(
      "assistant",
      `Hello ${firstName}! I'm your EduSaathi AI assistant. I'm connected directly to Gemini AI and know your profile (${profile?.education || "B.Tech Computer Science"}, ${profile?.state || "Tamil Nadu"}).\n\nAsk me about schemes, eligibility, document requirements, deadlines, or career strategies!`
    );
  }, [profile]);

  const [messages, setMessages] = useState<ChatMessage[]>([defaultInitialMsg]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const uid = user?.uid || (isDemo ? "demo-user-001" : "");

  useEffect(() => {
    if (!uid) return;
    getUserChatMessages(uid, isDemo).then((saved) => {
      if (saved.length > 0) {
        setMessages(saved);
      } else {
        setMessages([defaultInitialMsg]);
      }
    }).catch(() => {});
  }, [uid, isDemo, defaultInitialMsg]);

  const handleClearChat = async () => {
    if (uid) {
      await clearUserChatMessages(uid, isDemo);
    }
    setMessages([defaultInitialMsg]);
    toast.success("Chat history cleared");
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg = createChatMessage("user", text.trim());
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    if (uid) {
      saveChatMessage(uid, userMsg, isDemo).catch(() => {});
    }

    try {
      const history = updated.map((m) => ({ role: m.role, content: m.content }));
      const reply = await chatWithAssistant(history, profile);
      const assistantMsg = createChatMessage("assistant", reply);
      setMessages((prev) => [...prev, assistantMsg]);
      if (uid) {
        saveChatMessage(uid, assistantMsg, isDemo).catch(() => {});
      }
    } catch (err: unknown) {
      const errMsgText = err instanceof Error ? err.message : "Error connecting to AI service";
      const assistantMsg = createChatMessage(
        "assistant",
        `⚠️ **Connection Notice**: ${errMsgText}\n\nPlease verify that the backend API is running on port 8001.`
      );
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <FadeIn>
        <PageHeader
          title="AI Assistant"
          description="Ask about eligibility, documents, deadlines, and application strategy."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="gap-2 rounded-xl text-xs border-indigo-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Chat
            </Button>
          }
        />
      </FadeIn>


      <FadeIn delay={0.05} className="mb-4 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="rounded-full border border-indigo-100 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600 hover:shadow-xs disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </FadeIn>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-indigo-100/80 bg-white/75 p-5 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs",
                msg.role === "user"
                  ? "bg-slate-900"
                  : "bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 shadow-indigo-500/25"
              )}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4.5 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-tr-xs bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20"
                  : "rounded-tl-xs border border-indigo-100/80 bg-white/95 text-slate-800 shadow-xs"
              )}
            >
              {msg.role === "assistant"
                ? renderMarkdownish(msg.content)
                : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-indigo-100/80 bg-white/95 px-4.5 py-3 text-sm text-indigo-700 shadow-xs">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              EduSaathi is thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about schemes, documents, or deadlines…"
          className="min-h-[46px] max-h-32 resize-none rounded-2xl border-indigo-100/80 bg-white/80 backdrop-blur-xl shadow-xs focus-visible:border-indigo-400 focus-visible:ring-indigo-200"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="h-11.5 w-11.5 shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-600"
          disabled={loading || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
