// @legalgen-ignore-scan
import React, { useState, useRef } from 'react';
import {
    SparklesIcon,
    DownloadIcon,
    UploadIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    FolderIcon,
    ArrowPathIcon
} from '../constants';
import type { Project, UserProfile } from '../types';
import {
    ACCENT_PRESETS,
    DEFAULT_ACCENT,
    GRADIENT_PRESETS,
    GRADIENT_DIRECTIONS,
    loadAccentState,
    saveAccentState,
    type AccentState
} from '../services/accent';

interface AppSettingsEditorProps {
    apiKey: string;
    model: string;
    onSaveKey: (key: string) => void;
    onSaveModel: (model: string) => void;
    ddgText: string;
    dsgvoText: string;
    onSaveDdgText: (text: string) => void;
    onSaveDsgvoText: (text: string) => void;
    onShowDiff: () => void;
    hasUpdates: boolean;
    lastUpdateCheck: string;
    isCheckingLawUpdates: boolean;
    lawCheckFeedback: string | null;
    onCheckLawUpdates: () => void;
    projects: Project[];
    userProfile: UserProfile;
    onRestoreBackup: (projects: Project[], profile: UserProfile) => void;
}

type SettingsTab = 'ai' | 'darstellung' | 'impressum' | 'datenschutz' | 'backup';

const PaletteIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
);

const PipetteIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m2 22 1-1h3l9-9" />
        <path d="M3 21v-3l9-9" />
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
);

const CheckMarkIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const AppSettingsEditor: React.FC<AppSettingsEditorProps> = ({
    apiKey,
    model,
    onSaveKey,
    onSaveModel,
    ddgText,
    dsgvoText,
    onSaveDdgText,
    onSaveDsgvoText,
    onShowDiff,
    hasUpdates,
    lastUpdateCheck,
    isCheckingLawUpdates,
    lawCheckFeedback,
    onCheckLawUpdates,
    projects,
    userProfile,
    onRestoreBackup
}) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('ai');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [localModel, setLocalModel] = useState(model);
    const [localDdgText, setLocalDdgText] = useState(ddgText);
    const [localDsgvoText, setLocalDsgvoText] = useState(dsgvoText);

    const [isSaved, setIsSaved] = useState(false);
    const [isDdgSaved, setIsDdgSaved] = useState(false);
    const [isDsgvoSaved, setIsDsgvoSaved] = useState(false);

    // Accent & Gradient State (from Entwicklungswerkzeuge)
    const [accentState, setAccentState] = useState<AccentState>(() => loadAccentState());

    const updateAccent = (patch: Partial<AccentState> | { color?: string; gradientOn?: boolean; color2?: string; direction?: string }) => {
        setAccentState(prev => {
            const nextColor = 'color' in patch && patch.color ? patch.color : prev.color;
            const prevGrad = prev.gradient || { on: false, color2: '#14b8a6', direction: '135deg' };
            const nextGrad = {
                on: 'gradientOn' in patch && patch.gradientOn !== undefined ? patch.gradientOn : prevGrad.on,
                color2: 'color2' in patch && patch.color2 ? patch.color2 : prevGrad.color2,
                direction: 'direction' in patch && patch.direction ? patch.direction : prevGrad.direction
            };
            const next: AccentState = { color: nextColor, gradient: nextGrad };
            saveAccentState(next);
            return next;
        });
    };

    React.useEffect(() => {
        setLocalApiKey(apiKey);
    }, [apiKey]);

    React.useEffect(() => {
        setLocalModel(model);
    }, [model]);

    React.useEffect(() => {
        setLocalDdgText(ddgText);
    }, [ddgText]);

    React.useEffect(() => {
        setLocalDsgvoText(dsgvoText);
    }, [dsgvoText]);

    const handleSaveAISettings = () => {
        onSaveKey(localApiKey);
        onSaveModel(localModel);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleSaveDdgSettings = () => {
        onSaveDdgText(localDdgText);
        setIsDdgSaved(true);
        setTimeout(() => setIsDdgSaved(false), 3000);
    };

    const handleSaveDsgvoSettings = () => {
        onSaveDsgvoText(localDsgvoText);
        setIsDsgvoSaved(true);
        setTimeout(() => setIsDsgvoSaved(false), 3000);
    };

    const handleExportBackup = () => {
        const payload = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            userProfile,
            projects
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `legalgen_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setBackupStatus({ type: 'success', message: 'Backup-Datei wurde erfolgreich heruntergeladen.' });
    };

    const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(String(event.target?.result || '{}'));
                if (!Array.isArray(parsed.projects) || typeof parsed.userProfile !== 'object') {
                    throw new Error('Ungültiges Backup-Format');
                }
                onRestoreBackup(parsed.projects, parsed.userProfile);
                setBackupStatus({
                    type: 'success',
                    message: `${parsed.projects.length} Projekt(e) und Ihre Stammdaten wurden erfolgreich wiederhergestellt!`
                });
            } catch (err) {
                setBackupStatus({
                    type: 'error',
                    message: 'Fehler beim Importieren: Die gewählte JSON-Datei ist kein gültiges LegalGen-Backup.'
                });
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const currentAccent = (accentState.color || DEFAULT_ACCENT).toLowerCase();
    const isPresetAccent = ACCENT_PRESETS.some(p => p.value.toLowerCase() === currentAccent);
    const gradOn = !!accentState.gradient?.on;
    const gradColor2 = accentState.gradient?.color2 || '#14b8a6';
    const gradDirection = accentState.gradient?.direction || '135deg';

    return (
        <div className="w-full">
            <div className="app-roster-toolbar settings-toolbar flex items-center justify-between gap-3 flex-wrap">
                <h1 className="app-page-title">Einstellungen</h1>
                <div className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-500 bg-white/80 px-3.5 py-1.5 rounded-full shadow-sm">
                        Gesetzesprüfung: <strong className="text-slate-700">{lastUpdateCheck}</strong>
                    </span>
                    <button
                        type="button"
                        onClick={onCheckLawUpdates}
                        disabled={isCheckingLawUpdates}
                        className="modal-btn-secondary inline-flex items-center gap-1.5 text-xs"
                        title="Gesetzestexte (§ 5 DDG & DSGVO) jetzt auf Aktualität prüfen"
                    >
                        <ArrowPathIcon className={`w-3.5 h-3.5 ${isCheckingLawUpdates ? 'animate-spin' : ''}`} />
                        <span>{isCheckingLawUpdates ? 'Prüfe…' : 'Auf Aktualität prüfen'}</span>
                    </button>
                </div>
            </div>

            {lawCheckFeedback && (
                <div className="app-toast">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    <span>{lawCheckFeedback}</span>
                </div>
            )}

            <div className="settings-page">
                {/* Left Sticky Navigation */}
                <nav className="settings-nav" aria-label="Einstellungsbereiche">
                    <button
                        type="button"
                        onClick={() => setActiveTab('ai')}
                        className={`settings-tab ${activeTab === 'ai' ? 'settings-tab-active' : ''}`}
                    >
                        <SparklesIcon className="w-4 h-4 shrink-0" />
                        <span>KI & Modell</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('darstellung')}
                        className={`settings-tab ${activeTab === 'darstellung' ? 'settings-tab-active' : ''}`}
                    >
                        <PaletteIcon className="w-4 h-4 shrink-0" />
                        <span>Darstellung</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('impressum')}
                        className={`settings-tab ${activeTab === 'impressum' ? 'settings-tab-active' : ''}`}
                    >
                        <DocumentTextIcon className="w-4 h-4 shrink-0" />
                        <span>Impressum (§ 5 DDG)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('datenschutz')}
                        className={`settings-tab ${activeTab === 'datenschutz' ? 'settings-tab-active' : ''}`}
                    >
                        <ShieldCheckIcon className="w-4 h-4 shrink-0" />
                        <span>Datenschutz (DSGVO)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('backup')}
                        className={`settings-tab ${activeTab === 'backup' ? 'settings-tab-active' : ''}`}
                    >
                        <FolderIcon className="w-4 h-4 shrink-0" />
                        <span>Speicher & Sicherung</span>
                    </button>
                </nav>

                {/* Right Settings Content Card */}
                <div key={activeTab} className="settings-content app-tab-enter">
                    {activeTab === 'ai' && (
                        <>
                            <section className="settings-section">
                                <h4>Gemini API-Schlüssel</h4>
                                <p>
                                    Ihr persönlicher Google Gemini API-Key wird ausschließlich lokal in Ihrem Browser (<code>localStorage</code>) gespeichert und direkt für Anfragen an die Google Gemini API genutzt.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="modal-label">API-Key</label>
                                        <input
                                            type="password"
                                            value={localApiKey}
                                            onChange={(e) => setLocalApiKey(e.target.value)}
                                            placeholder="AIzaSy..."
                                            className="modal-input font-mono"
                                        />
                                    </div>
                                    <div>
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-primary-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                                        >
                                            <SparklesIcon className="w-3.5 h-3.5" />
                                            <span>API-Key in Google AI Studio abrufen</span>
                                        </a>
                                    </div>
                                </div>
                            </section>

                            <section className="settings-section">
                                <h4>KI-Modell</h4>
                                <p>
                                    Wählen Sie das Gemini-Modell für die Rechtstexte-Generierung aus. <strong>gemini-3.8-flash</strong> bietet volle 1.500 kostenlose Anfragen pro Tag im Free-Tier.
                                </p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="modal-label">Modell auswählen</label>
                                        <select
                                            value={localModel}
                                            onChange={(e) => setLocalModel(e.target.value)}
                                            className="modal-input bg-white"
                                        >
                                            <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Blitzschnell: ~1–3 Sek. – Empfohlen für schnellen Dialog)</option>
                                            <option value="gemini-3.6-flash">gemini-3.6-flash (Schnell & Ausgewogen)</option>
                                            <option value="gemini-3.8-flash">gemini-3.8-flash (Reasoning-Modell für komplexe Fälle)</option>
                                            <option value="gemini-3.8-pro">gemini-3.8-pro (Für anspruchsvolle juristische Analysen)</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleSaveAISettings}
                                            className="modal-btn-primary"
                                        >
                                            Einstellungen speichern
                                        </button>
                                        {isSaved && (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                                <CheckCircleIcon className="w-4 h-4" />
                                                <span>Gespeichert</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'darstellung' && (
                        <>
                            <section className="settings-section">
                                <h4>Akzentfarbe</h4>
                                <p>
                                    Die Farbe für Knöpfe, Auswahl und Hervorhebungen. Wirkt sofort in der gesamten App.
                                </p>
                                <div className="app-swatches">
                                    {ACCENT_PRESETS.map(preset => {
                                        const active = currentAccent === preset.value.toLowerCase();
                                        return (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                title={preset.name}
                                                aria-label={preset.name}
                                                aria-pressed={active}
                                                onClick={() => updateAccent({ color: preset.value })}
                                                className={`app-swatch ${active ? 'app-swatch-on' : ''}`}
                                                style={{ background: preset.value }}
                                            >
                                                {active && <CheckMarkIcon className="w-4 h-4" />}
                                            </button>
                                        );
                                    })}
                                    <label
                                        title="Eigene Farbe"
                                        className={`app-swatch app-swatch-custom ${!isPresetAccent ? 'app-swatch-on' : ''}`}
                                        style={!isPresetAccent ? { background: currentAccent } : undefined}
                                    >
                                        <input
                                            type="color"
                                            value={currentAccent}
                                            onChange={(e) => updateAccent({ color: e.target.value })}
                                            aria-label="Eigene Farbe"
                                        />
                                        {!isPresetAccent ? (
                                            <CheckMarkIcon className="w-4 h-4" />
                                        ) : (
                                            <PipetteIcon className="w-4 h-4" />
                                        )}
                                    </label>
                                </div>
                            </section>

                            <section className="settings-section">
                                <h4>Farbverlauf</h4>
                                <p>
                                    Hauptknöpfe, aktive Navigation und der runde Aktionsknopf unten rechts bekommen einen Verlauf von der Akzentfarbe zu einer zweiten Farbe.
                                </p>
                                <div className="space-y-4">
                                    <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={gradOn}
                                            onChange={(e) => updateAccent({ gradientOn: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span>Farbverlauf einschalten</span>
                                    </label>

                                    {gradOn && (
                                        <div className="space-y-4 pt-1">
                                            <div>
                                                <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                                    Verlaufsvorlagen:
                                                </span>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {GRADIENT_PRESETS.map(preset => {
                                                        const isCurrent =
                                                            currentAccent === preset.color1.toLowerCase() &&
                                                            gradColor2.toLowerCase() === preset.color2.toLowerCase();
                                                        return (
                                                            <button
                                                                key={preset.name}
                                                                type="button"
                                                                title={preset.name}
                                                                onClick={() => updateAccent({ color: preset.color1, color2: preset.color2 })}
                                                                style={{
                                                                    height: '32px',
                                                                    background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`,
                                                                    borderRadius: '10px',
                                                                    border: isCurrent ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.12)',
                                                                    boxShadow: isCurrent ? '0 0 0 2px #38bdf8' : 'none'
                                                                }}
                                                                className="flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.02]"
                                                            >
                                                                {isCurrent && <CheckMarkIcon className="w-3.5 h-3.5 text-white" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] font-semibold text-slate-600">Startfarbe</span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={currentAccent}
                                                            onChange={(e) => updateAccent({ color: e.target.value })}
                                                            className="w-9 h-9 p-0.5 bg-white border border-slate-300 rounded-lg cursor-pointer shrink-0"
                                                        />
                                                        <span className="text-xs font-mono text-slate-500">{currentAccent}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] font-semibold text-slate-600">Verlaufsfarbe</span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={gradColor2}
                                                            onChange={(e) => updateAccent({ color2: e.target.value })}
                                                            className="w-9 h-9 p-0.5 bg-white border border-slate-300 rounded-lg cursor-pointer shrink-0"
                                                        />
                                                        <span className="text-xs font-mono text-slate-500">{gradColor2}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[11px] font-semibold text-slate-600">Verlaufsrichtung</span>
                                                    <span className="text-[10px] font-semibold text-primary-600">Klick = Richtung umkehren</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {GRADIENT_DIRECTIONS.map(d => {
                                                        const active = gradDirection === d.main || gradDirection === d.back;
                                                        const isBack = gradDirection === d.back;
                                                        return (
                                                            <button
                                                                key={d.main}
                                                                type="button"
                                                                title={`${d.title} (Klicken zum Umkehren)`}
                                                                onClick={() => updateAccent({ direction: gradDirection === d.main ? d.back : d.main })}
                                                                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-full border transition-all ${
                                                                    active
                                                                        ? 'border-primary-600 bg-sky-50 text-primary-700 font-bold shadow-sm'
                                                                        : 'border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <span>{isBack ? d.backLabel : d.mainLabel}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'impressum' && (
                        <section className="settings-section">
                            <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
                                <h4>Impressum-Grundlage (§ 5 DDG)</h4>
                                <div className="flex items-center gap-2">
                                    {hasUpdates && (
                                        <button
                                            type="button"
                                            onClick={onShowDiff}
                                            className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-primary-700 text-xs font-bold rounded-full transition-colors"
                                        >
                                            Änderungen anzeigen
                                        </button>
                                    )}
                                    <a
                                        href="https://www.gesetze-im-internet.de/ddg/__5.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-primary-600 hover:underline"
                                    >
                                        Quelle: gesetze-im-internet.de
                                    </a>
                                </div>
                            </div>
                            <p>
                                Dieser Gesetzestext dient der KI als verbindliche Referenz bei der Erstellung Ihres Impressums.
                            </p>
                            <textarea
                                value={localDdgText}
                                onChange={(e) => setLocalDdgText(e.target.value)}
                                rows={14}
                                className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-primary-600 leading-relaxed"
                                placeholder="Gesetzestext zu § 5 DDG..."
                            />
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={handleSaveDdgSettings}
                                    className="modal-btn-primary"
                                >
                                    Impressum-Vorlage speichern
                                </button>
                                {isDdgSaved && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>Gespeichert</span>
                                    </span>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'datenschutz' && (
                        <section className="settings-section">
                            <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
                                <h4>Datenschutzerklärung-Grundlage (Art. 13 DSGVO)</h4>
                                <div className="flex items-center gap-2">
                                    {hasUpdates && (
                                        <button
                                            type="button"
                                            onClick={onShowDiff}
                                            className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-primary-700 text-xs font-bold rounded-full transition-colors"
                                        >
                                            Änderungen anzeigen
                                        </button>
                                    )}
                                    <a
                                        href="https://www.ihk.de/regensburg/fachthemen/recht/online-recht-und-datenschutz/eu-datenschutzgrundverordnung/anforderungen-an-websites-nach-der-ds-gvo-4158848"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-primary-600 hover:underline"
                                    >
                                        Quelle: ihk.de (Regensburg)
                                    </a>
                                </div>
                            </div>
                            <p>
                                Diese Anforderungen dienen der KI als Grundlage bei der Erstellung Ihrer Datenschutzerklärung.
                            </p>
                            <textarea
                                value={localDsgvoText}
                                onChange={(e) => setLocalDsgvoText(e.target.value)}
                                rows={14}
                                className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-primary-600 leading-relaxed"
                                placeholder="Gesetzestext / Anforderungen zu Art. 13 DSGVO..."
                            />
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={handleSaveDsgvoSettings}
                                    className="modal-btn-primary"
                                >
                                    Datenschutz-Vorlage speichern
                                </button>
                                {isDsgvoSaved && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>Gespeichert</span>
                                    </span>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'backup' && (
                        <>
                            <section className="settings-section">
                                <h4>Backup speichern</h4>
                                <p>
                                    Sichert alle Ihre angelegten Projekte ({projects.length} {projects.length === 1 ? 'Projekt' : 'Projekte'}) inklusive generierter Rechtstexte sowie Ihr hinterlegtes Stammdaten-Profil in einer JSON-Datei.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleExportBackup}
                                    className="modal-btn-primary inline-flex items-center gap-2"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                    <span>Als JSON-Datei speichern</span>
                                </button>
                            </section>

                            <section className="settings-section">
                                <h4>Backup wiederherstellen</h4>
                                <p>
                                    Lädt Projekte und Stammdaten aus einer zuvor exportierten JSON-Sicherungsdatei.
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={handleImportBackup}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="modal-btn-secondary inline-flex items-center gap-2"
                                >
                                    <UploadIcon className="w-4 h-4" />
                                    <span>Backup-Datei auswählen…</span>
                                </button>

                                {backupStatus && (
                                    <div
                                        className={`mt-3 p-3.5 rounded-2xl text-xs font-semibold border ${
                                            backupStatus.type === 'success'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                : 'bg-red-50 border-red-200 text-red-800'
                                        }`}
                                    >
                                        {backupStatus.message}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
