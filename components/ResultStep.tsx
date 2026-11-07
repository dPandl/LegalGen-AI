// @legalgen-ignore-scan
import React, { useState } from 'react';
import { CheckCircleIcon, ArrowLeftIcon, ClipboardIcon } from '../constants';

interface ResultViewProps {
    impressum: string;
    datenschutz: string;
    existingImpressum?: string;
    existingDatenschutz?: string;
    onSave: () => void;
    onCancel: () => void;
}

export const ResultStep: React.FC<ResultViewProps> = ({
    impressum,
    datenschutz,
    existingImpressum,
    existingDatenschutz,
    onSave,
    onCancel
}) => {
    const [activeTab, setActiveTab] = useState<'impressum' | 'datenschutz'>(() => {
        if (impressum === 'KEEP_EXISTING' && datenschutz && datenschutz !== 'KEEP_EXISTING') {
            return 'datenschutz';
        }
        return 'impressum';
    });
    const [copiedActive, setCopiedActive] = useState(false);
    const [copiedBoth, setCopiedBoth] = useState(false);

    const getFinalText = (text: string, existing?: string) => {
        if (text && text !== 'KEEP_EXISTING') return text;
        if (existing && existing.trim()) return existing;
        return '';
    };

    const handleCopyActive = () => {
        const textToCopy = activeTab === 'impressum'
            ? getFinalText(impressum, existingImpressum)
            : getFinalText(datenschutz, existingDatenschutz);
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopiedActive(true);
            setTimeout(() => setCopiedActive(false), 2000);
        }
    };

    const handleCopyBoth = () => {
        const finalImp = getFinalText(impressum, existingImpressum);
        const finalDs = getFinalText(datenschutz, existingDatenschutz);
        const parts: string[] = [];
        if (finalImp) parts.push(finalImp);
        if (finalDs) parts.push(finalDs);
        if (parts.length > 0) {
            navigator.clipboard.writeText(parts.join('\n\n---\n\n'));
            setCopiedBoth(true);
            setTimeout(() => setCopiedBoth(false), 2000);
        }
    };

    const getDisplayText = (text: string, existing?: string, type: string = 'Rechtstext') => {
        if (text === 'KEEP_EXISTING') {
            if (existing && existing.trim()) {
                return `${existing}\n\n--- HINWEIS DER APP ---\n[Der bestehende Text dieses Dokuments wurde beibehalten und nicht verändert.]`;
            }
            return `Für dieses Projekt wurde in diesem Durchlauf kein(e) ${type} generiert (z. B. weil laut Analyse nicht benötigt oder im Chat abgewählt).`;
        }
        return text;
    };

    const parseInline = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const renderMarkdown = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n');
        return (
            <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
                {lines.map((line, idx) => {
                    if (line.startsWith('### ')) {
                        return <h4 key={idx} className="text-base font-bold text-slate-800 pt-3 pb-1">{parseInline(line.substring(4))}</h4>;
                    }
                    if (line.startsWith('## ')) {
                        return <h3 key={idx} className="text-lg font-bold text-slate-800 pt-4 pb-1 border-b border-slate-100">{parseInline(line.substring(3))}</h3>;
                    }
                    if (line.startsWith('# ')) {
                        return <h2 key={idx} className="text-xl font-bold text-slate-900 pt-5 pb-2">{parseInline(line.substring(2))}</h2>;
                    }
                    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                        const cleanLine = line.trim().substring(2);
                        return (
                            <div key={idx} className="flex gap-2 pl-4 py-0.5">
                                <span className="text-slate-400 select-none">•</span>
                                <span className="text-slate-700">{parseInline(cleanLine)}</span>
                            </div>
                        );
                    }
                    if (line.trim() === '') {
                        return <div key={idx} className="h-1.5" />;
                    }
                    return <p key={idx} className="text-slate-700">{parseInline(line)}</p>;
                })}
            </div>
        );
    };

    const rawText = activeTab === 'impressum'
        ? getDisplayText(impressum, existingImpressum, 'Impressum')
        : getDisplayText(datenschutz, existingDatenschutz, 'Datenschutzerklärung');

    return (
        <div className="w-full">
            <div className="kid-area-top">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <nav className="app-breadcrumb" aria-label="Brotkrumen">
                        <button type="button" onClick={onCancel} className="app-crumb">
                            Projekte
                        </button>
                        <span className="app-crumb-sep">&rsaquo;</span>
                        <span className="app-crumb-current">Generierte Rechtstexte</span>
                    </nav>
                </div>
            </div>

            <div className="hub-card space-y-5 max-w-4xl">
                <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Entwürfe prüfen</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Überprüfen Sie die generierten Texte und übernehmen Sie diese anschließend in Ihr Projekt.
                        </p>
                    </div>

                    <div className="app-seg inline-flex p-1 rounded-full">
                        <button
                            type="button"
                            onClick={() => setActiveTab('impressum')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                activeTab === 'impressum' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Impressum
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('datenschutz')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                activeTab === 'datenschutz' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Datenschutzerklärung
                        </button>
                    </div>
                </div>

                <div className="p-5 bg-slate-50/70 rounded-2xl max-h-[55vh] overflow-y-auto">
                    {renderMarkdown(rawText)}
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleCopyActive}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            title={`${activeTab === 'impressum' ? 'Impressum' : 'Datenschutzerklärung'} in die Zwischenablage kopieren`}
                        >
                            <ClipboardIcon className="w-3.5 h-3.5" />
                            <span>{copiedActive ? 'Kopiert!' : `${activeTab === 'impressum' ? 'Impressum' : 'Datenschutz'} kopieren`}</span>
                        </button>

                        {(getFinalText(impressum, existingImpressum) || getFinalText(datenschutz, existingDatenschutz)) && (
                            <button
                                type="button"
                                onClick={handleCopyBoth}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full text-primary-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                                title="Impressum und Datenschutzerklärung zusammen mit Trenner in die Zwischenablage kopieren"
                            >
                                <ClipboardIcon className="w-3.5 h-3.5" />
                                <span>{copiedBoth ? 'Beide kopiert!' : 'Beide Texte kopieren'}</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="modal-btn-secondary"
                        >
                            Verwerfen
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            className="modal-btn-primary inline-flex items-center gap-2"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Im Projekt speichern</span>
                        </button>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onCancel}
                className="app-back"
                aria-label="Verwerfen und zurück"
            >
                <ArrowLeftIcon className="w-5 h-5 shrink-0" />
                <span className="app-back-text">Zurück</span>
            </button>
        </div>
    );
};
