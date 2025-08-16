import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Ask about Islamic finance...",
  disabled = false,
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_CHARACTER_COUNT = 2000;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!!value.trim() && !isLoading && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!!value.trim() && !isLoading && !disabled) {
      onSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [value]);

  const isValidCharacterCount = useMemo(
    () => value.trim().length > 0 && value.length <= MAX_CHARACTER_COUNT,
    [value]
  );

  return (
    <div
      className={cn(
        "border-t border-islamic-green-200 dark:border-islamic-green-800/25 bg-background p-4",
        className
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3">
          {/* Input Area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={cn(
                "bg-background min-h-[22px] max-h-[120px] resize-none pr-12 py-3",
                "border-islamic-green-200 focus:border-islamic-green-400 dark:border-islamic-green-800 dark:focus:border-islamic-green-700",
                "placeholder:text-gray-400/75 dark:placeholder:text-islamic-green-50/50"
              )}
              rows={1}
            />

            {/* Character count */}
            {value.length > MAX_CHARACTER_COUNT - 200 && (
              <div className="absolute bottom-2 right-2 text-xs text-islamic-green-400 dark:text-islamic-green-600">
                {value.length}/{MAX_CHARACTER_COUNT}
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || disabled || !isValidCharacterCount}
            variant="islamic"
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-islamic-green-50/75">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="text-islamic-green-400">
            {value.length > MAX_CHARACTER_COUNT - 200 &&
              `${MAX_CHARACTER_COUNT - value.length} characters remaining`}
          </span>
        </div>
      </div>
    </div>
  );
}
