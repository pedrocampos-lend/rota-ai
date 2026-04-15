import type { Message } from '../types'

interface Props {
  message: Message
}

function applyInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-300">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-blue-300">$1</code>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="underline text-blue-400 hover:text-blue-300 transition-colors">$1</a>')
}

function renderMarkdown(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let inUl = false
  let inOl = false

  const closeUl = () => { if (inUl) { result.push('</ul>'); inUl = false } }
  const closeOl = () => { if (inOl) { result.push('</ol>'); inOl = false } }

  for (const line of lines) {
    const isUlItem = /^[\*\-] (.+)/.test(line)
    const isOlItem = /^\d+\. (.+)/.test(line)

    if (!isUlItem) closeUl()
    if (!isOlItem) closeOl()

    if (/^### (.+)/.test(line)) {
      result.push(`<h3 class="text-sm font-bold text-white mt-4 mb-1.5 flex items-center gap-1.5">${applyInline(line.replace(/^### /, ''))}</h3>`)
    } else if (/^## (.+)/.test(line)) {
      result.push(`<h2 class="text-base font-bold text-white mt-4 mb-2">${applyInline(line.replace(/^## /, ''))}</h2>`)
    } else if (/^# (.+)/.test(line)) {
      result.push(`<h1 class="text-lg font-bold text-white mt-4 mb-2">${applyInline(line.replace(/^# /, ''))}</h1>`)
    } else if (/^---+$/.test(line.trim())) {
      result.push('<hr class="border-gray-600/50 my-3" />')
    } else if (isUlItem) {
      if (!inUl) { result.push('<ul class="space-y-1.5 my-2">'); inUl = true }
      const content = line.replace(/^[\*\-] /, '')
      result.push(`<li class="flex gap-2 items-start"><span class="text-blue-400 mt-0.5 flex-shrink-0">•</span><span class="text-gray-200">${applyInline(content)}</span></li>`)
    } else if (isOlItem) {
      if (!inOl) { result.push('<ol class="space-y-2 my-2">'); inOl = true }
      const match = line.match(/^(\d+)\. (.+)/)
      if (match) {
        result.push(`<li class="flex gap-2 items-start"><span class="text-blue-400 font-bold min-w-[1.4rem] flex-shrink-0">${match[1]}.</span><span class="text-gray-200">${applyInline(match[2])}</span></li>`)
      }
    } else if (line.trim() === '') {
      result.push('<div class="h-1.5"></div>')
    } else {
      result.push(`<p class="leading-relaxed text-gray-200">${applyInline(line)}</p>`)
    }
  }

  closeUl()
  closeOl()
  return result.join('')
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
          ✈
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-tr-sm'
            : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <span
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}
        <div
          className={`text-xs mt-1.5 ${
            isUser ? 'text-blue-200 text-right' : 'text-gray-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
