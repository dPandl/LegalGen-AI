// @legalgen-ignore-scan
import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { PaperAirplaneIcon, ArrowLeftIcon, SparklesIcon } from '../constants';

const parseMessageContent = (raw: string): { cleanText: string; options: string[] } => {
    const match = raw.match(/<OPTIONS>([\s\S]*?)<\/OPTIONS>/i);
    if (!match) {
        return { cleanText: raw.trim(), options: [] };
    }
    const cleanText = raw.replace(/<OPTIONS>[\s\S]*?<\/OPTIONS>/gi, '').trim();
    const options = match[1]
        .split('|')
        .map(o => o.trim())
        .filter(Boolean);
    return { cleanText, options };
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </>
    );
};

interface ChatViewProps {
    projectName: string;
    messages: ChatMessage[];
    userInput: string;
    setUserInput: (val: string) => void;
    onSendMessage: (overrideMessage?: string) => void;
    isLoading: boolean;
    onCancel: () => void;
    currentModel?: string;
    fallbackNotification?: { newModel: string; reason: string } | null;
    onDismissFallbackNotification?: () => void;
}

export const ConversationStep: React.FC<ChatViewProps> = ({
    projectName,
    messages,
    userInput,
    setUserInput,
    onSendMessage,
    isLoading,
    onCancel,
    currentModel,
    fallbackNotification,
    onDismissFallbackNotification
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className="w-full">
            <div className="kid-area-top">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <nav className="app-breadcrumb" aria-label="Brotkrumen">
                        <button type="button" onClick={onCancel} className="app-crumb">
                            Projekte
                        </button>
                        <span className="app-crumb-sep">&rsaquo;</span>
                        <span className="app-crumb-current">KI-Generator: {projectName}</span>
                    </nav>
                </div>
            </div>

            <div className="hub-card flex flex-col h-[72vh] max-w-4xl">
                <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <SparklesIcon className="w-4 h-4 text-primary-600 shrink-0" />
                        <span className="truncate">Klicken Sie auf eine Antwortmöglichkeit oder tippen Sie unten Ihre Antwort ein.</span>
                    </div>
                    {currentModel && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-primary-700 inline-flex items-center gap-1.5 border border-sky-100 shrink-0">
                            <SparklesIcon className="w-3 h-3 text-primary-600" />
                            <span>Modell: {currentModel}</span>
                        </span>
                    )}
                </div>

                {fallbackNotification && (
                    <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-base select-none">⚡</span>
                            <div>
                                <strong>Automatischer Modell-Wechsel:</strong> {fallbackNotification.reason} Die Generierung läuft jetzt nahtlos mit <strong>{fallbackNotification.newModel}</strong> (1.500 Anfragen/Tag) weiter.
                            </div>
                        </div>
                        {onDismissFallbackNotification && (
                            <button
                                type="button"
                                onClick={onDismissFallbackNotification}
                                className="text-amber-700 hover:text-amber-950 font-bold px-1.5 py-0.5 rounded text-sm shrink-0"
                                title="Hinweis schließen"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}

                <div className="flex-grow bg-slate-50/80 rounded-2xl p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => {
                        const isLastAssistantMsg = msg.role === 'assistant' && index === messages.length - 1;
                        const { cleanText, options } = msg.role === 'assistant'
                            ? parseMessageContent(msg.content)
                            : { cleanText: msg.content, options: [] };

                        return (
                            <div key={index} className="space-y-2.5">
                                <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white text-xs font-bold shadow-sm">
                                            KI
                                        </span>
                                    )}
                                    <div
                                        className={`rounded-2xl px-4 py-3 max-w-[82%] whitespace-pre-wrap text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user'
                                                ? 'bg-primary-600 text-white rounded-tr-sm'
                                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                                        }`}
                                    >
                                        {msg.role === 'assistant' ? <MarkdownRenderer content={cleanText} /> : cleanText}
                                    </div>
                                </div>

                                {isLastAssistantMsg && !isLoading && options.length > 0 && (
                                    <div className="pl-11 flex flex-wrap gap-2">
                                        {options.map((opt, optIdx) => (
                                            <button
                                                key={optIdx}
                                                type="button"
                                                onClick={() => onSendMessage(opt)}
                                                className="px-4 py-2 text-xs font-semibold rounded-full border border-sky-200 bg-sky-50 text-primary-700 hover:bg-primary-600 hover:text-white hover:border-primary-600 shadow-sm transition-all cursor-pointer active:scale-95 text-left"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {isLoading && (
                        <div className="flex items-start gap-3 justify-start">
                            <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white text-xs font-bold shadow-sm">
                                KI
                            </span>
                            <div className="rounded-2xl px-4 py-3 bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm flex items-center gap-3">
                                <div className="flex items-center justify-center gap-1.5 shrink-0">
                                    <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce"></span>
                                </div>
                                <span className="text-xs text-slate-500">Antwort wird formuliert…</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="mt-4 flex gap-2.5 items-end">
                    <textarea
                        rows={2}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Eigene Antwort hier eingeben (Enter zum Senden)…"
                        className="flex-grow block w-full px-4 py-2.5 border border-slate-200 rounded-2xl placeholder-slate-400 focus:outline-none focus:border-primary-600 text-sm transition resize-none"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => onSendMessage()}
                        disabled={isLoading || !userInput.trim()}
                        className="modal-btn-primary inline-flex justify-center items-center px-5 h-[56px] rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={onCancel}
                className="app-back"
                aria-label="Zurück"
            >
                <ArrowLeftIcon className="w-5 h-5 shrink-0" />
                <span className="app-back-text">Abbrechen</span>
            </button>
        </div>
    );
};
