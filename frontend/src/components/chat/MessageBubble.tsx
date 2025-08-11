import React from 'react'
import { Message } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatTimestamp, isRTL, formatCitation } from '@/lib/utils'
import { Copy, User, Bot, Check, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  onCopy?: (content: string) => void
}

export function MessageBubble({ message, onCopy }: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false)
  const isUser = message.role === 'user'
  const isRtl = isRTL(message.content)

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-islamic-gold-500 animate-spin" />
      case 'sent':
        return <Check className="w-3 h-3 text-islamic-green-500" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className={cn(
      "flex gap-3 p-4 group hover:bg-islamic-green-50/50 transition-colors",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <Avatar className={cn(
        "w-8 h-8 shrink-0",
        isUser ? "bg-islamic-teal-100" : "bg-islamic-green-100"
      )}>
        <AvatarFallback className={cn(
          isUser 
            ? "bg-islamic-teal-100 text-islamic-teal-700" 
            : "bg-islamic-green-100 text-islamic-green-700"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message Header */}
        <div className={cn(
          "flex items-center gap-2 mb-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-sm font-medium text-islamic-green-800">
            {isUser ? 'You' : 'Islamic Finance AI'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>

        {/* Message Bubble */}
        <div className={cn(
          "relative max-w-3xl rounded-2xl px-4 py-3 shadow-sm",
          isUser 
            ? "bg-islamic-teal-600 text-white ml-auto" 
            : "bg-white border border-islamic-green-200",
          isRtl && "text-right font-arabic"
        )}>
          {/* Message Text */}
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser 
              ? "prose-invert" 
              : "prose-islamic-green prose-headings:text-islamic-green-800"
          )}>
            <p className="whitespace-pre-wrap break-words mb-0">
              {message.content}
            </p>
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-islamic-green-100">
              <div className="text-xs font-medium text-islamic-green-700 mb-2">
                References:
              </div>
              <div className="space-y-1">
                {message.citations.map((citation, index) => (
                  <div 
                    key={index}
                    className="text-xs text-islamic-green-600 bg-islamic-green-50 rounded px-2 py-1"
                  >
                    {formatCitation(citation)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity",
              isUser ? "left-2" : "right-2"
            )}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
