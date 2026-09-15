import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { MessageCircle, X, Send, Loader2, RotateCcw } from "lucide-react";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth-context";
import {
  fetchChatMessages,
  resetChatSession,
  sendChatMessage,
} from "@/features/chat/api";
import { Markdown } from "@/components/ui/markdown";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ChatMessage } from "../types";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

interface ChatWidgetProps {
  initialMessages?: ChatMessage[];
}

const getWelcomeMessage = (userName?: string): ChatMessage => ({
  role: "ASSISTANT",
  content: `Hello ${userName ?? "there"}! How may I help you today?`,
});

export function ChatWidget({ initialMessages }: ChatWidgetProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [],
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPendingReply, setIsPendingReply] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPendingReply]);

  // Session initialization when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const sessionId = localStorage.getItem("chat_session_id");

    fetchChatMessages(sessionId)
      .then((response) => {
        localStorage.setItem("chat_session_id", response.session_id);
        setMessages([
          getWelcomeMessage(user?.name),
          ...response.messages,
        ]);
      })
      .catch(() => {
        setMessages([getWelcomeMessage(user?.name)]);
      })
      .finally(() => setIsLoadingHistory(false));
  }, [isOpen, user]);

  const form = useForm({
    defaultValues: { message: "" },
    validators: {
      onSubmit: messageSchema,
    },
    onSubmit: async ({ value }) => {
      await handleSubmit(value.message);
    },
  });

  const handleSubmit = useCallback(
    async (content: string) => {
      const sessionId = localStorage.getItem("chat_session_id");
      if (!sessionId || !content.trim()) return;

      setIsSending(true);
      setSendError(null);

      try {
        // Optimistically show the user's message
        const userMessage: ChatMessage = { role: "USER", content };
        setMessages((prev) => [...prev, userMessage]);
        form.reset();

        // Show pending indicator for assistant reply
        setIsPendingReply(true);

        const response = await sendChatMessage(sessionId, content);

        // Add the assistant reply only on success
        setMessages((prev) => [...prev, response.message]);
      } catch (error) {
        // Remove the optimistically added user message on failure
        setMessages((prev) => prev.slice(0, -1));
        setSendError(
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again.",
        );
      } finally {
        setIsSending(false);
        setIsPendingReply(false);
      }
    },
    [form],
  );

  const handleOpen = useCallback(() => {
    setIsLoadingHistory(true);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSendError(null);
    form.reset();
  }, [form]);

  const handleNewChat = useCallback(async () => {
    const sessionId = localStorage.getItem("chat_session_id");
    setIsLoadingHistory(true);
    setSendError(null);
    form.reset();

    try {
      if (sessionId) {
        const response = await resetChatSession(sessionId);
        localStorage.setItem("chat_session_id", response.session_id);
      }
      setMessages([getWelcomeMessage(user?.name)]);
    } catch {
      setSendError("Failed to start a new chat. Please try again.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [form, user]);

  return (
    <>
      {/* FAB Button — bottom right */}
      <Button
        onClick={handleOpen}
        size="icon-lg"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-40 size-12 rounded-full shadow-lg md:bottom-6 md:right-6 md:size-14"
        aria-label="Open chat"
      >
        <MessageCircle className="size-5 md:size-6" />
      </Button>

      {/* Chat Modal */}
      <DialogPrimitive.Root
        open={isOpen}
        onOpenChange={(open, event) => {
          // Only allow closing via the explicit close button (closePress)
          // Block escape key and outside press dismissal
          if (!open && event.reason !== "close-press") return;
          setIsOpen(open);
        }}
        modal
        disablePointerDismissal
      >
        <DialogPrimitive.Portal>
          {/* Backdrop: dim + blur */}
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

          {/* Modal popup */}
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 flex h-[min(600px,80dvh)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-popover text-popover-foreground ring-1 ring-foreground/10 shadow-2xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <DialogPrimitive.Title className="font-heading font-medium">
                Chat Assistant
              </DialogPrimitive.Title>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 sm:size-8 after:absolute after:-inset-2 after:content-['']"
                  onClick={handleNewChat}
                  disabled={isLoadingHistory || isSending}
                  aria-label="New chat"
                  title="New chat"
                >
                  <RotateCcw className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 sm:size-8 after:absolute after:-inset-2 after:content-['']"
                  onClick={handleClose}
                  aria-label="Close chat"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {isLoadingHistory ? (
                /* Loading skeletons */
                <div className="space-y-3">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-10 w-1/2 ml-auto" />
                  <Skeleton className="h-10 w-2/3" />
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        msg.role === "ASSISTANT"
                          ? "bg-muted text-foreground self-start"
                          : "bg-primary text-primary-foreground ml-auto whitespace-pre-wrap",
                      )}
                    >
                      {msg.role === "ASSISTANT" ? (
                        <Markdown>{msg.content}</Markdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  ))}

                  {/* Pending reply indicator */}
                  {isPendingReply && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Assistant is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input form */}
            <div className="border-t px-4 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="flex items-end gap-2"
              >
                <form.Field name="message">
                  {(field) => (
                    <Textarea
                      value={field.state.value}
                      onChange={(e) => {
                        if (sendError) setSendError(null);
                        field.handleChange(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !isMobile) {
                          e.preventDefault();
                          form.handleSubmit();
                        }
                      }}
                      placeholder="Type a message..."
                      className="min-h-10 max-h-30 flex-1 resize-none"
                      disabled={isSending || isLoadingHistory}
                    />
                  )}
                </form.Field>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || isLoadingHistory}
                  aria-label="Send message"
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
              {sendError && (
                <p className="mt-2 text-xs font-medium text-destructive">
                  {sendError}
                </p>
              )}
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
