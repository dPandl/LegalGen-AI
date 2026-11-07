// @legalgen-ignore-scan
import React, { useState } from 'react';
import {
    APP_LEGAL_IMPRESSUM,
    APP_LEGAL_DATENSCHUTZ,
    ClipboardIcon,
    CheckCircleIcon
} from '../constants';

interface LegalNoticeModalProps {
    initialTab?: 'impressum' | 'datenschutz';
    onClose: () => void;
}

export const LegalNoticeModal: React.FC<LegalNoticeModalProps> = ({
    initialTab = 'impressum',
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'impressum' | 'datenschutz'>(initialTab);
    const [copied, setCopied] = useState(false);

    const currentText = activeTab === 'impressum' ? APP_LEGAL_IMPRESSUM : APP_LEGAL_DATENSCHUTZ;

    const handleCopy = () => {
        navigator.clipboard.writeText(currentText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const parseInline = (text: string) => {
        // Find links and bold markdown
        const parts = text.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className="font-bold text-slate-900">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            if (part.startsWith('http://') || part.startsWith('https://')) {
                const cleanUrl = part.replace(/[.,;)]+$/, '');
                const suffix = part.slice(cleanUrl.length);
                return (
                    <React.Fragment key={index}>
                        <a
                            href={cleanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline break-all font-medium"
                        >
                            {cleanUrl}
                        </a>
                        {suffix}
                    </React.Fragment>
                );
            }
            return part;
        });
    };

    const renderFormattedLegal = (content: string) => {
        const lines = content.split('\n');
        return (
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {lines.map((rawLine, idx) => {
                    const line = rawLine.trim();

                    if (!line) {
                        return <div key={idx} className="h-2" />;
                    }

                    if (line === '---') {
                        return <hr key={idx} className="my-4 border-slate-200" />;
                    }

                    // Alleinstehende Zeilen zwischen ** ** als Überschrift hervorheben
                    if (line.startsWith('**') && line.endsWith('**')) {
                        const headingText = line.slice(2, -2);
                        if (headingText === 'Impressum' || headingText === 'Datenschutzerklärung') {
                            return (
                                <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-1 pb-1">
                                    {headingText}
                                </h2>
                            );
                        }
                        if (/^\d+\./.test(headingText)) {
                            return (
                                <h3 key={idx} className="text-sm sm:text-base font-bold text-slate-900 pt-3 pb-0.5 border-b border-slate-100">
                                    {headingText}
                                </h3>
                            );
                        }
                        if (/^[a-z]\)/i.test(headingText)) {
                            return (
                                <h4 key={idx} className="text-xs sm:text-sm font-bold text-primary-800 pt-2 pb-0.5">
                                    {headingText}
                                </h4>
                            );
                        }
                        return (
                            <h4 key={idx} className="text-xs sm:text-sm font-bold text-slate-900 pt-2 pb-0.5">
                                {headingText}
                            </h4>
                        );
                    }

                    // Aufzählungszeichen (* oder -)
                    if (line.startsWith('*   ') || line.startsWith('* ') || line.startsWith('- ')) {
                        const bulletText = line.replace(/^(\*\s+|\-\s+)/, '');
                        return (
                            <div key={idx} className="flex items-start gap-2.5 pl-3 py-0.5">
                                <span className="text-primary-600 font-bold text-base leading-none select-none">•</span>
                                <div className="flex-1">{parseInline(bulletText)}</div>
                            </div>
                        );
                    }

                    return (
                        <p key={idx} className="text-slate-700">
                            {parseInline(line)}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-dialog modal-lg max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header shrink-0">
                    <div>
                        <h3 className="modal-title">
                            {activeTab === 'impressum' ? 'Impressum' : 'Datenschutzerklärung'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Rechtliche Pflichtangaben dieser Web-App „LegalGen AI“ (§ 5 DDG &amp; Art. 13 DSGVO).
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close"
                        aria-label="Schließen"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap pb-3 pt-1 border-b border-slate-100 shrink-0">
                    <div className="app-seg inline-flex p-1 rounded-full">
                        <button
                            type="button"
                            onClick={() => setActiveTab('impressum')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                activeTab === 'impressum'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Impressum (§ 5 DDG)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('datenschutz')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                activeTab === 'datenschutz'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Datenschutz (DSGVO)
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full text-primary-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                        title="Diesen Rechtstext in die Zwischenablage kopieren"
                    >
                        {copied ? (
                            <>
                                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Kopiert!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardIcon className="w-3.5 h-3.5" />
                                <span>Text kopieren</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="p-4 sm:p-5 bg-slate-50/70 rounded-2xl overflow-y-auto flex-1 my-3 pr-2">
                    {renderFormattedLegal(currentText)}
                </div>

                <div className="modal-footer flex items-center justify-between gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">
                        Pascal Pander · LegalGen AI
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-btn-primary"
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};

