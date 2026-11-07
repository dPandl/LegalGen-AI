// @legalgen-ignore-scan
import React, { useState } from 'react';
import type { Project } from '../types';
import { selectAndScanProjectFolder } from '../services/folderScanner';
import {
    ArrowLeftIcon,
    FolderIcon,
    CheckCircleIcon,
    ArrowPathIcon
} from '../constants';

interface CreateProjectFormProps {
    project?: Project;
    onSave: (
        name: string,
        url: string,
        projectTypes: string[],
        isCommercial: boolean,
        projectPath?: string,
        detectedServices?: string[],
        codeAnalysisSummary?: string,
        iconDataUrl?: string
    ) => void;
    onCancel: () => void;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ project, onSave, onCancel }) => {
    const [name, setName] = useState(project?.name || '');
    const [url, setUrl] = useState(project?.url || '');
    const [selectedTypes, setSelectedTypes] = useState<string[]>(project?.projectTypes || ['Webseite']);
    const [isCommercial, setIsCommercial] = useState<boolean>(project?.isCommercial ?? true);
    const [projectPath, setProjectPath] = useState<string>(project?.projectPath || '');
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [detectedServices, setDetectedServices] = useState<string[]>(project?.detectedServices || []);
    const [codeAnalysisSummary, setCodeAnalysisSummary] = useState<string>(project?.codeAnalysisSummary || '');
    const [iconDataUrl, setIconDataUrl] = useState<string | undefined>(project?.iconDataUrl);

    const handleSelectFolder = async () => {
        try {
            setIsScanning(true);
            const result = await selectAndScanProjectFolder();
            if (result) {
                setProjectPath(result.folderPath);
                if (result.name && !name) {
                    setName(result.name);
                }
                if (result.homepageUrl && !url) {
                    setUrl(result.homepageUrl);
                }
                if (result.inferredProjectTypes && result.inferredProjectTypes.length > 0) {
                    setSelectedTypes(result.inferredProjectTypes);
                }
                setDetectedServices(result.detectedServices);
                setCodeAnalysisSummary(result.codeAnalysisSummary || '');
                if (result.iconDataUrl) {
                    setIconDataUrl(result.iconDataUrl);
                }
            }
        } catch (error) {
            console.error("Fehler beim Scannen des Ordners:", error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim(), url.trim(), selectedTypes, isCommercial, projectPath, detectedServices, codeAnalysisSummary, iconDataUrl);
        }
    };

    const typesOptions = ['Webseite', 'Mobile App', 'SaaS / Web-App', 'Desktop-Software', 'Andere'];

    return (
        <div className="w-full">
            {/* Sticky Top Area with Breadcrumb */}
            <div className="kid-area-top">
                <div className="flex items-center justify-between gap-3">
                    <nav className="app-breadcrumb" aria-label="Brotkrumen">
                        <button type="button" onClick={onCancel} className="app-crumb">
                            Projekte
                        </button>
                        <span className="app-crumb-sep">&rsaquo;</span>
                        <span className="app-crumb-current">
                            {project ? 'Projekt bearbeiten' : 'Neues Projekt'}
                        </span>
                    </nav>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="hub-card space-y-5 w-full">
                <div>
                    <h2 className="settings-section-title">
                        {project ? 'Projekt bearbeiten' : 'Neues Projekt anlegen'}
                    </h2>
                    <p className="settings-section-desc mb-0">
                        {project
                            ? 'Passen Sie die Basisdaten und den verknüpften Projekt-Ordner Ihres Projekts an.'
                            : 'Geben Sie die Basisdaten Ihres Projekts ein oder wählen Sie direkt einen lokalen Projekt-Ordner zur automatischen Analyse.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
                    {/* Linke Spalte: Basisdaten */}
                    <div className="space-y-4">
                        <div>
                            <label className="modal-label">Projekt-Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="modal-input"
                                placeholder="z.B. Meine Portfolio-Webseite"
                            />
                        </div>

                        <div>
                            <label className="modal-label">Plattform-URL / Webadresse (optional)</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="modal-input"
                                placeholder="z.B. https://meinedomain.de oder App Store Link"
                            />
                        </div>

                        <div>
                            <label className="modal-label">Nutzungsart</label>
                            <div className="app-seg grid grid-cols-2 p-1 rounded-full">
                                <button
                                    type="button"
                                    onClick={() => setIsCommercial(true)}
                                    className={`py-2 px-4 rounded-full text-xs font-bold transition-colors ${
                                        isCommercial ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Gewerblich / Kommerziell
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCommercial(false)}
                                    className={`py-2 px-4 rounded-full text-xs font-bold transition-colors ${
                                        !isCommercial ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Komplett gratis / Privat
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5 pl-1">
                                {isCommercial
                                    ? 'Bietet Produkte oder Dienstleistungen an bzw. erzielt Einnahmen.'
                                    : 'Keine Einnahmen, rein privates oder gemeinnütziges Projekt.'}
                            </p>
                        </div>
                    </div>

                    {/* Rechte Spalte: Projekt-Ordner & Projekttyp */}
                    <div className="space-y-4">
                        <div className="settings-row flex-col items-stretch gap-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <div className="settings-row-title flex items-center gap-1.5">
                                        <FolderIcon className="w-4 h-4 text-primary-600" />
                                        <span>Lokaler Projekt-Ordner (optional)</span>
                                    </div>
                                    <div className="settings-row-desc">
                                        Wählen Sie einen Projekt-Ordner aus, um Name, Icon, Module und Dienste automatisch zu erkennen.
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSelectFolder}
                                    className="modal-btn-secondary inline-flex items-center gap-1.5 shrink-0"
                                >
                                    <FolderIcon className="w-4 h-4" />
                                    <span>Ordner auswählen…</span>
                                </button>
                            </div>

                            {isScanning && (
                                <div className="text-xs text-primary-600 font-semibold flex items-center gap-2 pt-1">
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                    <span>Analysiere Projekt-Quellcode…</span>
                                </div>
                            )}

                            {projectPath && (
                                <div className="space-y-2.5 pt-1">
                                    <div className="flex items-center gap-2.5">
                                        {iconDataUrl && (
                                            <img
                                                src={iconDataUrl}
                                                alt="Projekt-Icon"
                                                className="w-9 h-9 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                                            />
                                        )}
                                        <div className="text-xs font-mono text-slate-600 truncate bg-white px-3.5 py-2 border border-slate-200 rounded-full flex-1">
                                            {projectPath}
                                        </div>
                                    </div>
                                    {detectedServices.length > 0 ? (
                                        <div>
                                            <p className="text-xs font-bold text-slate-600 mb-1.5">Erkannte Dienste:</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {detectedServices.map(s => (
                                                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                                        <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        !isScanning && (
                                            <p className="text-xs text-slate-500">
                                                Keine datenschutzrelevanten Drittanbieter-Standarddienste direkt erkannt.
                                            </p>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="modal-label">Projekttyp (Mehrfachauswahl möglich)</label>
                            <div className="flex flex-wrap gap-2">
                                {typesOptions.map((type) => {
                                    const isSelected = selectedTypes.includes(type);
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    if (selectedTypes.length > 1) {
                                                        setSelectedTypes(selectedTypes.filter(t => t !== type));
                                                    }
                                                } else {
                                                    setSelectedTypes([...selectedTypes, type]);
                                                }
                                            }}
                                            className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                                                isSelected
                                                    ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="modal-btn-secondary"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="submit"
                        className="modal-btn-primary"
                    >
                        {project ? 'Änderungen speichern' : 'Projekt anlegen'}
                    </button>
                </div>
            </form>

            {/* Floating Back Button */}
            <button
                type="button"
                onClick={onCancel}
                className="app-back"
                aria-label="Zurück"
            >
                <ArrowLeftIcon className="w-5 h-5 shrink-0" />
                <span className="app-back-text">Zurück</span>
            </button>
        </div>
    );
};
