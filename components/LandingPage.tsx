// @legalgen-ignore-scan
import React, { useEffect } from 'react';
import {
    SparklesIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    FolderIcon,
    DownloadIcon
} from '../constants';

interface LandingPageProps {
    canInstallPwa: boolean;
    isStandalonePwa: boolean;
    onInstallPwa: () => void;
    onEnterApp: () => void;
    onOpenLegal?: (tab: 'impressum' | 'datenschutz') => void;
}

const ScaleJusticeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
);

const KeyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="7.5" cy="15.5" r="5.5" />
        <path d="m21 2-9.6 9.6" />
        <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({
    canInstallPwa,
    onInstallPwa,
    onEnterApp,
    onOpenLegal
}) => {
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []);

    return (
        <div className="min-h-screen w-full bg-[#e9edf3] text-slate-800 antialiased selection:bg-sky-200 flex items-center justify-center app-page-enter">
            {/* Main Fullscreen Content */}
            <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-5 sm:py-6 space-y-4">
                {/* Hero Section */}
                <div className="hub-card !p-6 sm:!p-8 text-center relative overflow-hidden">
                    <div className="max-w-3xl mx-auto space-y-3.5">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-primary-700">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                <span>KI-Generator für Impressum &amp; Datenschutz</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                <span>100 % Lokal im Browser</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                <span>§ 5 DDG · Art. 13 DSGVO · § 25 TDDDG</span>
                            </span>
                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 shadow-sm mx-auto flex items-center justify-center">
                            <img
                                src="./icon.png"
                                alt="LegalGen AI Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Rechtstexte für Ihre Projekte – <span className="text-primary-600">automatisch aus Ihrem Code</span>
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                            <strong>LegalGen AI</strong> scannt auf Wunsch direkt lokal im Browser Ihren Projekt-Ordner, erkennt genutzte Frameworks, externe Dienste, das App-Icon sowie die <strong>Cookie-Banner-Pflicht nach § 25 TDDDG</strong> und erstellt im geführten KI-Dialog ein maßgeschneidertes Impressum und eine Datenschutzerklärung.
                        </p>

                        <div className="pt-1.5 flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={onEnterApp}
                                className="modal-btn-primary !px-7 !py-3 !text-sm sm:!text-base inline-flex items-center gap-2.5 shadow-md"
                            >
                                <span>Jetzt App öffnen</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>

                            {canInstallPwa && (
                                <button
                                    type="button"
                                    onClick={onInstallPwa}
                                    className="modal-btn-secondary !px-5 !py-3 !text-xs sm:!text-sm inline-flex items-center gap-2"
                                >
                                    <DownloadIcon className="w-4 h-4 text-primary-600" />
                                    <span>Als Desktop-/Mobile-App installieren (PWA)</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Wichtige Hinweise: Eigener API-Key & Kein Ersatz für einen Anwalt */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Hinweis 1: Eigener API-Key */}
                    <div className="hub-card !p-6 sm:!p-7 border-l-4 !border-l-sky-500 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="inline-flex items-center gap-2.5 text-primary-700 font-bold text-base">
                                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-primary-600 flex items-center justify-center shrink-0">
                                        <KeyIcon className="w-5 h-5" />
                                    </div>
                                    <span>Eigener Gemini API-Key benötigt</span>
                                </div>
                                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-primary-700">
                                    100 % Client-Side
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Da <strong>LegalGen AI</strong> komplett ohne zwischengeschalteten Server direkt in Ihrem Browser arbeitet, benötigen Sie für die KI-Generierung einen eigenen <strong>Google Gemini API-Key</strong>.
                            </p>
                            <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc pl-4">
                                <li>
                                    Einen API-Schlüssel erhalten Sie <strong>kostenlos</strong> mit Ihrem Google-Konto im offiziellen <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">Google AI Studio</a>.
                                </li>
                                <li>
                                    Ihr Key wird <strong>ausschließlich lokal in Ihrem Browser</strong> (<code>localStorage</code>) gespeichert und niemals an Dritte übertragen.
                                </li>
                            </ul>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                            <span>Einrichtung jederzeit in den App-Einstellungen möglich</span>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700"
                            >
                                <span>Google AI Studio öffnen &rarr;</span>
                            </a>
                        </div>
                    </div>

                    {/* Hinweis 2: Kein Ersatz für einen Anwalt */}
                    <div className="hub-card !p-6 sm:!p-7 border-l-4 !border-l-amber-500 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="inline-flex items-center gap-2.5 text-amber-900 font-bold text-base">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <ScaleJusticeIcon className="w-5 h-5" />
                                    </div>
                                    <span>Kein Ersatz für einen Anwalt</span>
                                </div>
                                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800">
                                    Rechtlicher Hinweis
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                <strong>LegalGen AI</strong> ist ein technischer KI-Assistent und Code-Scanner zur strukturierten Erstellung von Textentwürfen – jedoch <strong>ausdrücklich kein Ersatz für eine individuelle Rechtsberatung durch einen Rechtsanwalt</strong>.
                            </p>
                            <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc pl-4">
                                <li>
                                    Die Nutzung dieser Anwendung stellt <strong>keine Rechtsdienstleistung im Sinne des Rechtsdienstleistungsgesetzes (RDG)</strong> dar.
                                </li>
                                <li>
                                    KI-Modelle können Fehler machen oder spezielle rechtliche Anforderungen Ihres Einzelfalls übersehen. Prüfen Sie alle Texte vor Verwendung sorgfältig.
                                </li>
                            </ul>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                            <span>Orientierung an § 5 DDG · Art. 13 DSGVO · § 25 TDDDG</span>
                            <span>Verwendung auf eigene Verantwortung</span>
                        </div>
                    </div>
                </div>

                {/* 4 Feature-Karten */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hub-card !p-5 space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary-600 flex items-center justify-center">
                            <FolderIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800">Lokaler Projekt-Ordner-Scan</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Erkennt über 50 Dienste &amp; Pakete (Firebase, Supabase, Stripe, Google Fonts, Analytics, Hosting u.v.m.) sowie Ihr Projekt-Icon direkt im Browser – ohne Code-Upload.
                        </p>
                    </div>

                    <div className="hub-card !p-5 space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ShieldCheckIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800">Cookie-Banner-Check (§ 25 TDDDG)</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Prüft automatisch, ob Ihr Quellcode einwilligungspflichtige Tracking-Dienste nutzt und ob ein Cookie-Consent-Banner verbaut oder gar nicht nötig ist.
                        </p>
                    </div>

                    <div className="hub-card !p-5 space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary-600 flex items-center justify-center">
                            <DocumentTextIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800">Geführter KI-Dialog &amp; Export</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Stellt nur noch Fragen, die nicht bereits durch Ihren Code oder Ihr Profil beantwortet sind. Exportieren Sie fertige Texte als <strong>.MD</strong>, <strong>.HTML</strong> oder <strong>.TXT</strong>.
                        </p>
                    </div>

                    <div className="hub-card !p-5 space-y-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DownloadIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800">Vollwertige PWA &amp; Backup</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Mit einem Klick als eigenständige Desktop- oder Mobile-App installierbar. Alle Projekte und Stammdaten bleiben lokal und sind als JSON-Backup sicherbar.
                        </p>
                    </div>
                </div>

                {/* Footer with Impressum & Datenschutz links */}
                <footer className="pt-3 pb-1 text-center text-xs text-slate-500 space-y-1.5">
                    <div className="flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenLegal && onOpenLegal('impressum')}
                            className="hover:text-primary-700 underline underline-offset-4 font-semibold text-slate-600 transition-colors"
                        >
                            Impressum (§ 5 DDG)
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                            type="button"
                            onClick={() => onOpenLegal && onOpenLegal('datenschutz')}
                            className="hover:text-primary-700 underline underline-offset-4 font-semibold text-slate-600 transition-colors"
                        >
                            Datenschutzerklärung (DSGVO)
                        </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                        LegalGen AI · 100 % Client-Side Web-App · Pascal Pander
                    </p>
                </footer>
            </main>
        </div>
    );
};
