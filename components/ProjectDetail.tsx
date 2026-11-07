// @legalgen-ignore-scan
import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
import { selectAndScanProjectFolder, rescanProjectFolder, evaluateCookieBannerStatus } from '../services/folderScanner';
import {
    ArrowLeftIcon,
    GlobeIcon,
    ArrowPathIcon,
    ClipboardIcon,
    DocumentTextIcon,
    SparklesIcon,
    PencilSquareIcon,
    DownloadIcon,
    CheckCircleIcon,
    FolderIcon,
    ShieldCheckIcon
} from '../constants';

interface ProjectDetailsProps {
    project: Project;
    onBack: () => void;
    onRegenerate: (mode: 'both' | 'impressum' | 'datenschutz') => void;
    onUpdateProject: (updated: Project) => void;
    onEdit: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailsProps> = ({ project, onBack, onRegenerate, onUpdateProject, onEdit }) => {
    const [activeTab, setActiveTab] = useState<'impressum' | 'datenschutz'>('impressum');
    const [copied, setCopied] = useState(false);
    const [copiedBoth, setCopiedBoth] = useState(false);
    const [isEditingText, setIsEditingText] = useState(false);
    const [draftText, setDraftText] = useState('');
    const [savedManualToast, setSavedManualToast] = useState(false);
    const [scanToast, setScanToast] = useState(false);
    const [isRescanning, setIsRescanning] = useState(false);

    useEffect(() => {
        setIsEditingText(false);
        setDraftText(activeTab === 'impressum' ? project.impressum : project.datenschutzerklaerung);
    }, [activeTab, project.impressum, project.datenschutzerklaerung]);

    const handleStartManualEdit = () => {
        setDraftText(activeTab === 'impressum' ? project.impressum : project.datenschutzerklaerung);
        setIsEditingText(true);
    };

    const handleSaveManualEdit = () => {
        const updatedProject: Project = {
            ...project,
            impressum: activeTab === 'impressum' ? draftText : project.impressum,
            datenschutzerklaerung: activeTab === 'datenschutz' ? draftText : project.datenschutzerklaerung,
        };
        onUpdateProject(updatedProject);
        setIsEditingText(false);
        setSavedManualToast(true);
        setTimeout(() => setSavedManualToast(false), 2500);
    };

    const convertMarkdownToHtml = (md: string, title: string) => {
        const lines = md.split('\n');
        const bodyLines = lines.map(line => {
            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (formatted.startsWith('### ')) return `<h3>${formatted.substring(4)}</h3>`;
            if (formatted.startsWith('## ')) return `<h2>${formatted.substring(3)}</h2>`;
            if (formatted.startsWith('# ')) return `<h1>${formatted.substring(2)}</h1>`;
            if (formatted.trim().startsWith('- ') || formatted.trim().startsWith('* ')) {
                return `<li>${formatted.trim().substring(2)}</li>`;
            }
            if (formatted.trim() === '') return '<br/>';
            return `<p>${formatted}</p>`;
        }).join('\n');

        return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} – ${project.name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5rem; }
    p, li { margin: 0.4rem 0; }
  </style>
</head>
<body>
${bodyLines}
</body>
</html>`;
    };

    const handleExportDocument = (format: 'md' | 'txt' | 'html') => {
        const currentText = activeTab === 'impressum' ? project.impressum : project.datenschutzerklaerung;
        if (!currentText) return;

        const docTitle = activeTab === 'impressum' ? 'Impressum' : 'Datenschutzerklaerung';
        const safeProjName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        let content = currentText;
        let mimeType = 'text/plain;charset=utf-8';

        if (format === 'txt') {
            content = currentText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#+\s+/gm, '');
        } else if (format === 'html') {
            content = convertMarkdownToHtml(currentText, activeTab === 'impressum' ? 'Impressum' : 'Datenschutzerklärung');
            mimeType = 'text/html;charset=utf-8';
        } else {
            mimeType = 'text/markdown;charset=utf-8';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeProjName}_${docTitle}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleUpdateFolder = async (selectNew: boolean) => {
        setIsRescanning(true);
        try {
            const result = (selectNew || !project.projectPath)
                ? await selectAndScanProjectFolder()
                : await rescanProjectFolder(project.projectPath);
            if (result) {
                onUpdateProject({
                    ...project,
                    projectPath: result.folderPath,
                    detectedServices: result.detectedServices,
                    codeAnalysisSummary: result.codeAnalysisSummary || '',
                    iconDataUrl: result.iconDataUrl || project.iconDataUrl,
                    impressum: project.impressum || result.detectedImpressum || '',
                    datenschutzerklaerung: project.datenschutzerklaerung || result.detectedDatenschutz || ''
                });
                setScanToast(true);
                setTimeout(() => setScanToast(false), 2500);
            }
        } catch (error) {
            console.error("Fehler beim Verknüpfen/Scannen des Ordners:", error);
        } finally {
            setIsRescanning(false);
        }
    };

    const handleCopy = () => {
        const textToCopy = activeTab === 'impressum' ? project.impressum : project.datenschutzerklaerung;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyBoth = () => {
        const parts: string[] = [];
        if (project.impressum && project.impressum.trim()) {
            parts.push(project.impressum.trim());
        }
        if (project.datenschutzerklaerung && project.datenschutzerklaerung.trim()) {
            parts.push(project.datenschutzerklaerung.trim());
        }
        const textToCopy = parts.join('\n\n---\n\n');
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopiedBoth(true);
            setTimeout(() => setCopiedBoth(false), 2000);
        }
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

    const currentText = activeTab === 'impressum' ? project.impressum : project.datenschutzerklaerung;
    const cookieStatus = evaluateCookieBannerStatus(
        project.projectPath,
        project.detectedServices,
        project.codeAnalysisSummary
    );

    return (
        <div className="w-full">
            {/* Sticky Top Area with Breadcrumb & Actions */}
            <div className="kid-area-top">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <nav className="app-breadcrumb" aria-label="Brotkrumen">
                        <button type="button" onClick={onBack} className="app-crumb">
                            Projekte
                        </button>
                        <span className="app-crumb-sep">&rsaquo;</span>
                        <span className="app-crumb-current">{project.name}</span>
                    </nav>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={onEdit}
                            className="kid-edit"
                        >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                            <span>Projektdaten bearbeiten</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onRegenerate('both')}
                            className="modal-btn-primary inline-flex items-center gap-2 text-xs shadow-sm"
                        >
                            <SparklesIcon className="w-3.5 h-3.5" />
                            <span>Beide Rechtstexte generieren</span>
                        </button>
                    </div>
                </div>
            </div>

            {savedManualToast && (
                <div className="app-toast">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    <span>Manuelle Änderungen am {activeTab === 'impressum' ? 'Impressum' : 'Datenschutztext'} gespeichert</span>
                </div>
            )}

            {scanToast && (
                <div className="app-toast">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    <span>Projekt-Ordner erfolgreich neu geladen & analysiert</span>
                </div>
            )}

            {/* Two-Column Overview Grid */}
            <div className="project-overview-grid">
                {/* Left Sidebar Card: Project Metadata & Folder Scan */}
                <div className="hub-card project-side-card space-y-5">
                    <div>
                        <div className="flex items-center gap-3">
                            {(project.iconDataUrl || (project.projectPath && /dP Legal App/i.test(project.projectPath))) && (
                                <img
                                    src={project.iconDataUrl || './icon.png'}
                                    alt={project.name}
                                    className="w-11 h-11 rounded-2xl object-contain bg-slate-50 border border-slate-100 p-1.5 shrink-0"
                                />
                            )}
                            <div className="min-w-0">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight truncate">{project.name}</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Angelegt am {project.createdAt}</p>
                            </div>
                        </div>

                        {project.url && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                                <GlobeIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {project.url.startsWith('http') || project.url.includes('.') ? (
                                    <a
                                        href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono hover:text-primary-600 truncate transition-colors"
                                    >
                                        {project.url}
                                    </a>
                                ) : (
                                    <span className="font-mono truncate">{project.url}</span>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {(project.projectTypes || ['Webseite']).map((type) => (
                                <span key={type} className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
                                    {type}
                                </span>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    onUpdateProject({
                                        ...project,
                                        isCommercial: project.isCommercial === false ? true : false
                                    });
                                }}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-transform active:scale-95 cursor-pointer ${
                                    project.isCommercial !== false
                                        ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                                title="Klicken, um zwischen „Kommerziell“ und „Gratis / Privat“ umzuschalten"
                            >
                                {project.isCommercial !== false ? 'Kommerziell' : 'Gratis / Privat'}
                            </button>
                        </div>
                    </div>

                    {/* Linked Project Folder */}
                    <div className="pt-3.5 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <FolderIcon className="w-4 h-4 text-primary-600" />
                                Lokaler Projekt-Ordner
                            </span>
                        </div>

                        {project.projectPath ? (
                            <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 truncate" title={project.projectPath}>
                                {project.projectPath}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">
                                Kein lokaler Projekt-Ordner verknüpft.
                            </p>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                            {project.projectPath ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateFolder(true)}
                                        disabled={isRescanning}
                                        className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 disabled:opacity-50 text-slate-700 rounded-full text-xs font-semibold transition-colors"
                                    >
                                        Ordner ändern
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateFolder(false)}
                                        disabled={isRescanning}
                                        className="flex-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 disabled:opacity-50 text-primary-700 rounded-full text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
                                    >
                                        {isRescanning ? (
                                            <>
                                                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                                <span>Lade…</span>
                                            </>
                                        ) : (
                                            <span>Neu scannen</span>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleUpdateFolder(true)}
                                    disabled={isRescanning}
                                    className="w-full px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 disabled:opacity-50 text-slate-700 rounded-full text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
                                >
                                    {isRescanning ? (
                                        <>
                                            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                            <span>Scanne…</span>
                                        </>
                                    ) : (
                                        <span>Ordner auswählen & scannen</span>
                                    )}
                                </button>
                            )}
                        </div>

                        {project.projectPath && project.detectedServices && project.detectedServices.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Erkannte Dienste ({project.detectedServices.length})
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.detectedServices.map((service) => (
                                        <span key={service} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                                            <CheckCircleIcon className="w-3 h-3 shrink-0" />
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {cookieStatus.status !== 'unknown' && (
                            <div className="space-y-1 pt-1">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Cookie-Banner (§ 25 TDDDG)
                                </div>
                                <div
                                    title={cookieStatus.detailText}
                                    className={`px-3 py-2 rounded-xl text-xs border ${
                                        cookieStatus.status === 'implemented'
                                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                                            : cookieStatus.status === 'missing_warning'
                                            ? 'bg-red-50 border-red-200 text-red-800'
                                            : 'bg-slate-50 border-slate-200/80 text-slate-600'
                                    }`}
                                >
                                    <div className="font-bold flex items-center gap-1.5">
                                        <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                                        <span>{cookieStatus.shortLabel}</span>
                                    </div>
                                    <div className="text-[11px] opacity-85 mt-0.5 line-clamp-2">{cookieStatus.detailText}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Main Card: Document Viewer & Editor */}
                <div className="hub-card flex flex-col min-h-[480px]">
                    {/* Segmented Control + Toolbar */}
                    <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-slate-100">
                        <div className="app-seg inline-flex p-1 rounded-full">
                            <button
                                type="button"
                                onClick={() => setActiveTab('impressum')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'impressum' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                Impressum
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('datenschutz')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === 'datenschutz' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                Datenschutzerklärung
                            </button>
                        </div>

                        {currentText && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {!isEditingText ? (
                                    <button
                                        type="button"
                                        onClick={handleStartManualEdit}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors"
                                        title="Text manuell im Editor bearbeiten"
                                    >
                                        <PencilSquareIcon className="w-3.5 h-3.5" />
                                        <span>Bearbeiten</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingText(false)}
                                            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200/80 transition-colors"
                                        >
                                            Abbrechen
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveManualEdit}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                        >
                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                            <span>Speichern</span>
                                        </button>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={() => onRegenerate(activeTab)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors"
                                >
                                    <ArrowPathIcon className="w-3.5 h-3.5" />
                                    <span>Mit KI aktualisieren</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    title={`${activeTab === 'impressum' ? 'Impressum' : 'Datenschutzerklärung'} in die Zwischenablage kopieren`}
                                >
                                    <ClipboardIcon className="w-3.5 h-3.5" />
                                    <span>{copied ? 'Kopiert!' : `${activeTab === 'impressum' ? 'Impressum' : 'Datenschutz'} kopieren`}</span>
                                </button>

                                {(project.impressum || project.datenschutzerklaerung) && (
                                    <button
                                        type="button"
                                        onClick={handleCopyBoth}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full text-primary-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                                        title="Impressum und Datenschutzerklärung zusammen in die Zwischenablage kopieren"
                                    >
                                        <ClipboardIcon className="w-3.5 h-3.5" />
                                        <span>{copiedBoth ? 'Beide kopiert!' : 'Beide Texte kopieren'}</span>
                                    </button>
                                )}

                                <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => handleExportDocument('md')}
                                        className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-white hover:text-slate-900 rounded-full flex items-center gap-1 transition-colors"
                                        title="Als Markdown (.md) herunterladen"
                                    >
                                        <DownloadIcon className="w-3 h-3" />
                                        .MD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleExportDocument('html')}
                                        className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-white hover:text-slate-900 rounded-full transition-colors"
                                        title="Als fertige HTML-Datei (.html) herunterladen"
                                    >
                                        .HTML
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleExportDocument('txt')}
                                        className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-white hover:text-slate-900 rounded-full transition-colors"
                                        title="Als reine Textdatei (.txt) herunterladen"
                                    >
                                        .TXT
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Document Content Body */}
                    <div key={`${activeTab}-${isEditingText ? 'edit' : 'view'}`} className="pt-5 flex-1 app-tab-enter">
                        {isEditingText ? (
                            <div className="space-y-2.5">
                                <p className="text-xs text-slate-500">
                                    Bearbeiten Sie den Text direkt im Markdown-Format (z. B. <code>## Überschrift</code>, <code>**fett**</code>, <code>- Liste</code>):
                                </p>
                                <textarea
                                    value={draftText}
                                    onChange={(e) => setDraftText(e.target.value)}
                                    rows={18}
                                    className="w-full p-4 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-primary-600"
                                    placeholder="Rechtstext hier eingeben oder anpassen..."
                                />
                            </div>
                        ) : currentText ? (
                            <div className="max-h-[62vh] overflow-y-auto pr-2">
                                {renderMarkdown(currentText)}
                            </div>
                        ) : (
                            <div className="text-center py-16 space-y-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-base font-bold text-slate-800">
                                        Noch kein {activeTab === 'impressum' ? 'Impressum' : 'Datenschutztext'} vorhanden
                                    </h4>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Starten Sie den KI-Generator oder verfassen Sie den Text manuell im Editor.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-2.5 pt-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => onRegenerate(activeTab)}
                                        className="modal-btn-primary inline-flex items-center gap-2 text-xs shadow-sm"
                                    >
                                        <SparklesIcon className="w-3.5 h-3.5" />
                                        <span>Jetzt mit KI erstellen</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStartManualEdit}
                                        className="modal-btn-secondary inline-flex items-center gap-1.5 text-xs"
                                    >
                                        <PencilSquareIcon className="w-3.5 h-3.5" />
                                        <span>Manuell verfassen</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Back Button */}
            <button
                type="button"
                onClick={onBack}
                className="app-back"
                aria-label="Zurück zu allen Projekten"
            >
                <ArrowLeftIcon className="w-5 h-5 shrink-0" />
                <span className="app-back-text">Alle Projekte</span>
            </button>
        </div>
    );
};
