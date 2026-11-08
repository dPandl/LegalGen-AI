// @legalgen-ignore-scan
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as Diff from 'diff';
import { AppState } from './types';
import type { ChatMessage, UserProfile, Project, BeforeInstallPromptEvent } from './types';
import { LegalGenChatService, formatGeminiError } from './services/geminiService';
import {
    tryAutoRescanProjectFolder,
    rescanProjectFolder,
    evaluateCookieBannerStatus,
    selectAndScanWorkspaceRoot,
    saveProjectsToIDB,
    loadProjectsFromIDB,
    type ScanResult
} from './services/folderScanner';
import {
    DocumentTextIcon,
    CheckCircleIcon,
    SparklesIcon,
    ShieldCheckIcon,
    DDG_PARAGRAPH_5_TEXT,
    DSGVO_ART_13_TEXT,
    CogIcon,
    FolderIcon,
    UserIcon,
    PlusIcon,
    TrashIcon,
    GlobeIcon,
    DownloadIcon,
    ArrowPathIcon,
    ScaleJusticeIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    APP_LEGAL_IMPRESSUM,
    APP_LEGAL_DATENSCHUTZ
} from './constants';

import { LandingPage } from './components/LandingPage';
import { UserProfileEditor } from './components/UserProfileEditor';
import { AppSettingsEditor } from './components/AppSettingsEditor';
import { CreateProjectForm } from './components/CreateProjectForm';
import { ProjectDetail } from './components/ProjectDetail';
import { ConversationStep } from './components/ConversationStep';
import { ResultStep } from './components/ResultStep';
import { LegalNoticeModal } from './components/LegalNoticeModal';

async function fetchExternalLawHtml(proxyPath: string, targetUrl: string): Promise<string> {
    const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // 1. Im lokalen Entwicklungsmodus (Vite Dev-Server) den lokalen Dev-Proxy nutzen
    if (isLocalhost && proxyPath) {
        try {
            const proxyRes = await fetch(proxyPath);
            if (proxyRes.ok) {
                const text = await proxyRes.text();
                if (text && !text.includes('<script type="module" src="/index.tsx">')) {
                    return text;
                }
            }
        } catch {}
    }

    // 2. Im Produktionsmodus (z. B. auf GitHub Pages / by-dp.de) über CORS-Proxy abrufen
    // (Verhindert 404 auf statischem Hosting und direkte CORS-Blockaden des Browsers)
    if (!isLocalhost) {
        try {
            const corsRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, {
                signal: AbortSignal.timeout(3500)
            });
            if (corsRes.ok) {
                const text = await corsRes.text();
                if (text && text.length > 200) return text;
            }
        } catch {}
    }

    return '';
}

function detectInstalledPwa(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        if (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: window-controls-overlay)').matches ||
            window.matchMedia('(display-mode: minimal-ui)').matches ||
            Boolean((window.navigator as any).standalone) ||
            window.location.search.includes('source=pwa') ||
            localStorage.getItem('legalgen_pwa_installed') === 'true'
        ) {
            localStorage.setItem('legalgen_pwa_installed', 'true');
            return true;
        }
    } catch {}
    return false;
}

export default function App() {
    // Navigation: Zeige Fullscreen-Landingpage nur im normalen Browser, wenn die PWA nicht installiert ist und man noch nichts gemacht hat
    const [appState, setAppState] = useState<AppState>(() => {
        try {
            if (detectInstalledPwa()) {
                return AppState.DASHBOARD;
            }

            const savedProjects = localStorage.getItem('legalgen_projects');
            const hasProjects = savedProjects ? JSON.parse(savedProjects).length > 0 : false;

            const savedProfile = localStorage.getItem('legalgen_profile');
            const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
            const hasProfile = Boolean(
                parsedProfile && (parsedProfile.name || parsedProfile.email || parsedProfile.companyName || parsedProfile.street)
            );

            const hasKey = Boolean(localStorage.getItem('legalgen_api_key')?.trim());
            const hasEntered = localStorage.getItem('legalgen_has_entered') === 'true';

            if (hasProjects || hasProfile || hasKey || hasEntered) {
                return AppState.DASHBOARD;
            }
        } catch {}
        return AppState.LANDING;
    });

    // Core data
    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('legalgen_projects');
        const list: Project[] = saved ? JSON.parse(saved) : [];
        let modified = false;
        const mapped = list.map((p) => {
            const isSelfApp =
                /legalgen|dp legal app|legal app/i.test(p.name) ||
                Boolean(p.projectPath && /dp legal app|legalgen/i.test(p.projectPath));
            if (isSelfApp && (!p.impressum || !p.datenschutzerklaerung)) {
                modified = true;
                return {
                    ...p,
                    impressum: p.impressum || APP_LEGAL_IMPRESSUM,
                    datenschutzerklaerung: p.datenschutzerklaerung || APP_LEGAL_DATENSCHUTZ
                };
            }
            return p;
        });
        if (modified) {
            try {
                localStorage.setItem('legalgen_projects', JSON.stringify(mapped));
            } catch (e) {}
        }
        return mapped;
    });

    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('legalgen_profile');
        return saved ? JSON.parse(saved) : {
            name: '', street: '', zipCode: '', city: '',
            email: '', phone: '', companyName: '',
            legalForm: '', representative: '', ustId: '',
            entityType: 'private'
        };
    });

    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [chatProject, setChatProject] = useState<Project | null>(null);

    // Dashboard Search & Filter
    const [projectSearchQuery, setProjectSearchQuery] = useState<string>('');
    const [projectFilterTab, setProjectFilterTab] = useState<'all' | 'missing_impressum' | 'missing_datenschutz' | 'private' | 'commercial'>('all');

    const projectCounts = useMemo(() => {
        return {
            all: projects.length,
            missingImpressum: projects.filter(p => !p.impressum).length,
            missingDatenschutz: projects.filter(p => !p.datenschutzerklaerung).length,
            private: projects.filter(p => p.isCommercial === false).length,
            commercial: projects.filter(p => p.isCommercial !== false).length,
        };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        let list = projects;

        if (projectFilterTab === 'missing_impressum') {
            list = list.filter(p => !p.impressum);
        } else if (projectFilterTab === 'missing_datenschutz') {
            list = list.filter(p => !p.datenschutzerklaerung);
        } else if (projectFilterTab === 'private') {
            list = list.filter(p => p.isCommercial === false);
        } else if (projectFilterTab === 'commercial') {
            list = list.filter(p => p.isCommercial !== false);
        }

        const q = projectSearchQuery.trim().toLowerCase();
        if (q) {
            list = list.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(q);
                const urlMatch = (p.url || '').toLowerCase().includes(q);
                const pathMatch = (p.projectPath || '').toLowerCase().includes(q);
                const typeMatch = (p.projectTypes || []).some(t => t.toLowerCase().includes(q));
                const serviceMatch = (p.detectedServices || []).some(s => s.toLowerCase().includes(q));
                const commercialMatch =
                    (q.includes('komm') && p.isCommercial !== false) ||
                    ((q.includes('grat') || q.includes('priv')) && p.isCommercial === false);
                const statusMatch =
                    (q.includes('fehl') && (!p.impressum || !p.datenschutzerklaerung)) ||
                    (q.includes('vorhand') && (p.impressum || p.datenschutzerklaerung));

                return nameMatch || urlMatch || pathMatch || typeMatch || serviceMatch || commercialMatch || statusMatch;
            });
        }

        return list;
    }, [projects, projectSearchQuery, projectFilterTab]);

    // Chat States
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedTexts, setGeneratedTexts] = useState<{ impressum: string; datenschutzerklaerung: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [chatMode, setChatMode] = useState<'both' | 'impressum' | 'datenschutz'>('both');
    const [legalModalTab, setLegalModalTab] = useState<'impressum' | 'datenschutz' | null>(null);

    // Gemini Settings (100% local in browser localStorage)
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('legalgen_api_key') || '');
    const [isKeyLoaded, setIsKeyLoaded] = useState<boolean>(true);
    const [model, setModel] = useState<string>(() => {
        const savedModel = localStorage.getItem('legalgen_model') || 'gemini-3.5-flash-lite';
        if (savedModel.startsWith('gemini-1.') || savedModel.startsWith('gemini-2.')) {
            localStorage.setItem('legalgen_model', 'gemini-3.5-flash-lite');
            return 'gemini-3.5-flash-lite';
        }
        return savedModel;
    });

    const [modelFallbackNotification, setModelFallbackNotification] = useState<{
        newModel: string;
        reason: string;
    } | null>(null);

    // PWA Install Prompt State
    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isStandalonePwa, setIsStandalonePwa] = useState<boolean>(() => detectInstalledPwa());

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
        };
        const handleAppInstalled = () => {
            setDeferredInstallPrompt(null);
            setIsStandalonePwa(true);
            localStorage.setItem('legalgen_pwa_installed', 'true');
            localStorage.setItem('legalgen_has_entered', 'true');
            setAppState((prev) => (prev === AppState.LANDING ? AppState.DASHBOARD : prev));
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallPwa = useCallback(async () => {
        if (!deferredInstallPrompt) return;
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            setDeferredInstallPrompt(null);
            setIsStandalonePwa(true);
            localStorage.setItem('legalgen_pwa_installed', 'true');
            localStorage.setItem('legalgen_has_entered', 'true');
            setAppState((prev) => (prev === AppState.LANDING ? AppState.DASHBOARD : prev));
        }
    }, [deferredInstallPrompt]);

    // Law references states
    const [ddgText, setDdgText] = useState<string>(() => {
        return localStorage.getItem('legalgen_ddg_text') || DDG_PARAGRAPH_5_TEXT;
    });
    const [dsgvoText, setDsgvoText] = useState<string>(() => {
        return localStorage.getItem('legalgen_dsgvo_text') || DSGVO_ART_13_TEXT;
    });

    const [lawUpdateNotification, setLawUpdateNotification] = useState<{
        title: string;
        details: Array<{
            type: 'impressum' | 'dsgvo';
            label: string;
            oldText: string;
            newText: string;
        }>;
    } | null>(null);

    const [showDiffModal, setShowDiffModal] = useState<boolean>(false);
    const [lastUpdateCheck, setLastUpdateCheck] = useState<string>(
        () => localStorage.getItem('legalgen_last_update_check') || 'Bisher keine Prüfung erfolgt'
    );
    const [isCheckingLawUpdates, setIsCheckingLawUpdates] = useState<boolean>(false);
    const [lawCheckFeedback, setLawCheckFeedback] = useState<string | null>(null);

    const checkLawUpdates = useCallback(async (manual = false) => {
        if (manual) {
            setIsCheckingLawUpdates(true);
            setLawCheckFeedback(null);
        }

        const updates: Array<{
            type: 'impressum' | 'dsgvo';
            label: string;
            oldText: string;
            newText: string;
        }> = [];

        const storedDdg = localStorage.getItem('legalgen_ddg_text');
        const storedDsgvo = localStorage.getItem('legalgen_dsgvo_text');

        let updatedDdg = storedDdg !== null ? storedDdg : DDG_PARAGRAPH_5_TEXT;
        let updatedDsgvo = storedDsgvo !== null ? storedDsgvo : DSGVO_ART_13_TEXT;
        let ddgFetchSuccess = false;
        let dsgvoFetchSuccess = false;

        try {
            const html = await fetchExternalLawHtml(
                '/api-law/ddg',
                'https://www.gesetze-im-internet.de/ddg/__5.html'
            );

            if (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const paragraphs = doc.querySelectorAll('.jurAbsatz');
                let text = '';
                if (paragraphs.length > 0) {
                    text = Array.from(paragraphs)
                        .map(p => p.textContent || '')
                        .join('\n');
                } else if (doc.getElementById('content')) {
                    const mainContent = doc.getElementById('content')!;
                    text = mainContent.innerText || mainContent.textContent || '';
                }

                text = text.trim();

                if (text && text.length > 200) {
                    ddgFetchSuccess = true;
                    if (!text.startsWith('Digitale-Dienste-Gesetz')) {
                        text = `Digitale-Dienste-Gesetz * (DDG)\n§ 5 Allgemeine Informationspflicht\n${text}`;
                    }

                    const currentClean = updatedDdg.replace(/\s+/g, '').trim();
                    const newClean = text.replace(/\s+/g, '').trim();
                    if (currentClean !== newClean) {
                        updates.push({
                            type: 'impressum',
                            label: 'Impressums-Grundlage (§ 5 DDG)',
                            oldText: updatedDdg,
                            newText: text
                        });
                        updatedDdg = text;
                    }
                }
            }
        } catch (e) {
            console.warn("Konnte § 5 DDG nicht automatisch aktualisieren:", e);
        }

        try {
            const ihkUrl = 'https://www.ihk.de/regensburg/fachthemen/recht/online-recht-und-datenschutz/eu-datenschutzgrundverordnung/anforderungen-an-websites-nach-der-ds-gvo-4158848';
            const html = await fetchExternalLawHtml('/api-law/ihk', ihkUrl);

            if (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const richTextDiv =
                    doc.querySelector('main#main .richtext') ||
                    doc.querySelector('main .richtext') ||
                    doc.querySelector('main#main') ||
                    doc.querySelector('main') ||
                    doc.querySelector('.richtext') ||
                    doc.querySelector('.gfi-richtext') ||
                    doc.querySelector('.col-lg-8') ||
                    doc.getElementById('main-content');

                let text = '';
                if (richTextDiv) {
                    const contentClone = richTextDiv.cloneNode(true) as HTMLElement;
                    contentClone.querySelectorAll(
                        'script, style, noscript, .cookie-consent-banner, header, footer, nav, ' +
                        '.gfi-contact, .gfi-contact-box, .gfi-meta, .gfi-sharing, .sharing, ' +
                        '.social-share, .social-media-sharing, .print-btn, iframe, ' +
                        '.contact-card, .contact-info, .footer-info, button, svg'
                    ).forEach(el => el.remove());
                    text = contentClone.innerText || contentClone.textContent || '';
                } else {
                    const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
                    if (mainMatch) {
                        text = mainMatch[0]
                            .replace(/<script[\s\S]*?<\/script>/gi, '')
                            .replace(/<style[\s\S]*?<\/style>/gi, '')
                            .replace(/<button[\s\S]*?<\/button>/gi, '')
                            .replace(/<svg[\s\S]*?<\/svg>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&amp;/g, '&')
                            .replace(/\s+/g, ' ')
                            .trim();
                    }
                }

                text = text.trim();
                text = text.replace(/^Nr\.\s*\d+\s*/i, '').trim();
                text = text.replace(/\n\s*Kontakt\s+Susanne Kroiß[\s\S]*$/i, '').trim();
                text = text.replace(/\n\s*Kontakt\s*E-Mail schreiben[\s\S]*$/i, '').trim();
                text = text.replace(/\n\s*teilen\s*\n\s*drucken[\s\S]*$/i, '').trim();
                text = text.replace(/\n\s*drucken\s*$/i, '').trim();
                text = text.trim();

                if (text && text.length > 500) {
                    dsgvoFetchSuccess = true;
                    const currentClean = updatedDsgvo.replace(/\s+/g, '').trim();
                    const newClean = text.replace(/\s+/g, '').trim();
                    if (currentClean !== newClean) {
                        updates.push({
                            type: 'dsgvo',
                            label: 'Datenschutzerklärung-Grundlage (IHK-Vorgaben)',
                            oldText: updatedDsgvo,
                            newText: text
                        });
                        updatedDsgvo = text;
                    }
                }
            }
        } catch (e) {
            console.warn("Konnte DSGVO nicht automatisch aktualisieren:", e);
        }

        if (updates.length > 0) {
            updates.forEach(u => {
                if (u.type === 'impressum') {
                    setDdgText(u.newText);
                    localStorage.setItem('legalgen_ddg_text', u.newText);
                } else {
                    setDsgvoText(u.newText);
                    localStorage.setItem('legalgen_dsgvo_text', u.newText);
                }
            });

            const labels = updates.map(u => u.label).join(' & ');
            setLawUpdateNotification({
                title: `Automatische Aktualisierung durchgeführt für: ${labels}`,
                details: updates
            });
        }

        const nowStr = new Date().toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        localStorage.setItem('legalgen_last_update_check', nowStr);
        setLastUpdateCheck(nowStr);

        if (manual) {
            setIsCheckingLawUpdates(false);
            if (!ddgFetchSuccess && !dsgvoFetchSuccess) {
                setLawCheckFeedback(
                    'Die externen Gesetzesseiten konnten nicht abgerufen werden (Netzwerk- oder CORS-Einschränkung). Die integrierten Vorlagen bleiben unverändert aktiv.'
                );
            } else if (updates.length > 0) {
                const labels = updates.map(u => u.label).join(' & ');
                setLawCheckFeedback(`Aktualisierung erfolgreich: ${labels} wurde von der Webseite geladen!`);
            } else {
                setLawCheckFeedback('§ 5 DDG & Art. 13 DSGVO online geprüft – Vorlagen stimmen mit dem aktuellen Gesetzestext überein.');
            }
            setTimeout(() => setLawCheckFeedback(null), 5000);
        }
    }, []);

    // Auto-update law texts on launch
    useEffect(() => {
        checkLawUpdates(false);
    }, [checkLawUpdates]);

    // Immer ganz nach oben scrollen bei Seitenwechsel
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [appState, activeProject]);

    const chatService = useRef<LegalGenChatService | null>(null);

    // Save helpers
    const saveProjectsToStorage = (updated: Project[]) => {
        setProjects(updated);
        try {
            localStorage.setItem('legalgen_projects', JSON.stringify(updated));
        } catch (e) {
            console.warn('localStorage Quota überschritten, bereinige große Icons:', e);
            try {
                const lightweight = updated.map(p => ({
                    ...p,
                    iconDataUrl: p.iconDataUrl && p.iconDataUrl.length > 25000 ? undefined : p.iconDataUrl
                }));
                localStorage.setItem('legalgen_projects', JSON.stringify(lightweight));
            } catch (e2) {
                console.error('Konnte Projekte nicht in localStorage speichern:', e2);
            }
        }
        saveProjectsToIDB(updated);
    };

    // Lade vollständige Projekte aus IndexedDB als sicheren Backup-Speicher
    useEffect(() => {
        loadProjectsFromIDB().then(stored => {
            if (stored && Array.isArray(stored) && stored.length > 0) {
                setProjects(prev => (prev.length === 0 ? stored : prev));
            }
        }).catch(() => {});
    }, []);

    // Automatische Korrektur für bestehende Projekte: Wenn keine Zahlungs-/Werbedienste erkannt wurden, als Gratis / Privat einstufen
    useEffect(() => {
        const migratedKey = 'legalgen_commercial_auto_migrated_v2';
        if (localStorage.getItem(migratedKey) !== 'true' && projects.length > 0) {
            const COMMERCIAL_CHECK = /stripe|paypal|klarna|revenuecat|admob|werbung|zahlung/i;
            let changed = false;
            const updated = projects.map(p => {
                const hasCommercial = p.detectedServices?.some(s => COMMERCIAL_CHECK.test(s));
                if (!hasCommercial && p.isCommercial !== false) {
                    changed = true;
                    return { ...p, isCommercial: false };
                }
                return p;
            });
            if (changed) {
                saveProjectsToStorage(updated);
            }
            localStorage.setItem(migratedKey, 'true');
        }
    }, [projects]);

    // Automatische Bereinigung von fälschlicherweise als Impressum/Datenschutz gespeichertem Quellcode
    useEffect(() => {
        const cleanupKey = 'legalgen_cleanup_bogus_legal_code_v1';
        if (localStorage.getItem(cleanupKey) !== 'true' && projects.length > 0) {
            let changed = false;
            const isBogus = (txt?: string) => {
                if (!txt || txt.trim().length < 20) return false;
                const isCode = /^\s*(import\s+|export\s+|const\s+|var\s+|function\s+|\/\*)/.test(txt);
                const hasLegalHeader = /(?:#+|\*\*)\s*(?:Impressum|Datenschutzerklärung|Angaben\s+gemäß)/i.test(txt) ||
                                       /\b(?:§\s*5\s*DDG|§\s*5\s*TMG|Art\.\s*13\s*DSGVO)\b/i.test(txt);
                return isCode && !hasLegalHeader;
            };

            const updated = projects.map(p => {
                let pChanged = false;
                let newImp = p.impressum;
                let newDs = p.datenschutzerklaerung;
                if (isBogus(newImp)) {
                    newImp = '';
                    pChanged = true;
                }
                if (isBogus(newDs)) {
                    newDs = '';
                    pChanged = true;
                }
                if (pChanged) {
                    changed = true;
                    return { ...p, impressum: newImp, datenschutzerklaerung: newDs };
                }
                return p;
            });

            if (changed) {
                saveProjectsToStorage(updated);
            }
            localStorage.setItem(cleanupKey, 'true');
        }
    }, [projects]);

    // Automatisches Nachladen von erkannten Rechtstexten für lokal verknüpfte Projekte
    const checkedDocsProjectIdsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        const candidateProjects = projects.filter(
            p => p.projectPath && (!p.impressum || !p.datenschutzerklaerung) && !checkedDocsProjectIdsRef.current.has(p.id)
        );
        if (candidateProjects.length === 0) return;

        let isMounted = true;
        const checkExistingDocs = async () => {
            let updatedList = [...projects];
            let hasChanges = false;

            for (const proj of candidateProjects) {
                checkedDocsProjectIdsRef.current.add(proj.id);
                if (!isMounted) break;
                try {
                    const scan = await tryAutoRescanProjectFolder(proj.projectPath!, true);
                    if (scan && (scan.detectedImpressum || scan.detectedDatenschutz)) {
                        updatedList = updatedList.map(item => {
                            if (item.id === proj.id) {
                                const newImp = item.impressum || scan.detectedImpressum || '';
                                const newDs = item.datenschutzerklaerung || scan.detectedDatenschutz || '';
                                if (newImp !== item.impressum || newDs !== item.datenschutzerklaerung) {
                                    hasChanges = true;
                                    return {
                                        ...item,
                                        impressum: newImp,
                                        datenschutzerklaerung: newDs,
                                        detectedServices: scan.detectedServices || item.detectedServices,
                                        codeAnalysisSummary: scan.codeAnalysisSummary || item.codeAnalysisSummary,
                                        iconDataUrl: scan.iconDataUrl || item.iconDataUrl
                                    };
                                }
                            }
                            return item;
                        });
                    }
                } catch {
                    // Stille Ignorierung bei fehlender Berechtigung
                }
            }

            if (hasChanges && isMounted) {
                setProjects(updatedList);
                saveProjectsToStorage(updatedList);
            }
        };

        checkExistingDocs();

        return () => {
            isMounted = false;
        };
    }, [projects]);

    const [rescanningProjectId, setRescanningProjectId] = useState<string | null>(null);

    const handleRescanCardProject = async (project: Project) => {
        if (!project.projectPath) return;
        setRescanningProjectId(project.id);
        try {
            const scan = await rescanProjectFolder(project.projectPath);
            if (scan) {
                const updatedList = projects.map(p => {
                    if (p.id === project.id) {
                        return {
                            ...p,
                            projectPath: scan.folderPath,
                            detectedServices: scan.detectedServices,
                            codeAnalysisSummary: scan.codeAnalysisSummary || p.codeAnalysisSummary,
                            iconDataUrl: scan.iconDataUrl || p.iconDataUrl,
                            impressum: p.impressum || scan.detectedImpressum || '',
                            datenschutzerklaerung: p.datenschutzerklaerung || scan.detectedDatenschutz || ''
                        };
                    }
                    return p;
                });
                setProjects(updatedList);
                saveProjectsToStorage(updatedList);
            }
        } catch (err) {
            console.error('Fehler beim Neuscannen des Projekt-Ordners:', err);
        } finally {
            setRescanningProjectId(null);
        }
    };

    const handleToggleCommercial = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = projects.map(p =>
            p.id === project.id ? { ...p, isCommercial: p.isCommercial === false ? true : false } : p
        );
        saveProjectsToStorage(updated);
        if (activeProject?.id === project.id) {
            setActiveProject({ ...activeProject, isCommercial: activeProject.isCommercial === false ? true : false });
        }
    };

    const handleSaveProfile = (updated: UserProfile) => {
        setUserProfile(updated);
        localStorage.setItem('legalgen_profile', JSON.stringify(updated));
    };

    // Project creation trigger
    const handleCreateProject = (
        name: string,
        url: string,
        projectTypes: string[],
        isCommercial: boolean,
        projectPath?: string,
        detectedServices?: string[],
        codeAnalysisSummary?: string,
        iconDataUrl?: string
    ) => {
        const newProj: Project = {
            id: Date.now().toString(),
            name: name,
            url: url,
            projectTypes: projectTypes,
            isCommercial: isCommercial,
            impressum: '',
            datenschutzerklaerung: '',
            createdAt: new Date().toLocaleDateString('de-DE'),
            projectPath: projectPath,
            detectedServices: detectedServices,
            codeAnalysisSummary: codeAnalysisSummary,
            iconDataUrl: iconDataUrl
        };
        const updatedProjects = [newProj, ...projects];
        saveProjectsToStorage(updatedProjects);
        setAppState(AppState.DASHBOARD);
    };

    const startGeneratorChat = async (project: Project, mode: 'both' | 'impressum' | 'datenschutz' = 'both') => {
        if (!apiKey.trim()) {
            setError('Bitte tragen Sie zuerst einen Gemini API-Key in den Einstellungen ein.');
            return;
        }

        setChatMode(mode);
        setIsLoading(true);
        setError(null);
        setAppState(AppState.CHAT);

        let currentProject = project;
        setChatProject(currentProject);

        if (project.projectPath) {
            try {
                const scanResult = await tryAutoRescanProjectFolder(project.projectPath);
                if (scanResult) {
                    currentProject = {
                        ...project,
                        detectedServices: scanResult.detectedServices,
                        codeAnalysisSummary: scanResult.codeAnalysisSummary || project.codeAnalysisSummary,
                        iconDataUrl: scanResult.iconDataUrl || project.iconDataUrl,
                        impressum: currentProject.impressum || scanResult.detectedImpressum || '',
                        datenschutzerklaerung: currentProject.datenschutzerklaerung || scanResult.detectedDatenschutz || ''
                    };
                    const updatedList = projects.map(p => p.id === currentProject.id ? currentProject : p);
                    saveProjectsToStorage(updatedList);
                }
            } catch (scanErr) {
                console.warn('Automatischer Code-Scan vor Chat-Start fehlgeschlagen:', scanErr);
            }
        }

        setActiveProject(currentProject);

        try {
            chatService.current = new LegalGenChatService(
                currentProject.name,
                currentProject.url,
                currentProject.projectTypes || ['Webseite'],
                userProfile,
                apiKey,
                model,
                ddgText,
                dsgvoText,
                mode,
                currentProject.detectedServices,
                currentProject.isCommercial,
                currentProject.impressum,
                currentProject.datenschutzerklaerung,
                currentProject.codeAnalysisSummary,
                (newModel, reason) => {
                    setModel(newModel);
                    localStorage.setItem('legalgen_model', newModel);
                    setModelFallbackNotification({ newModel, reason });
                }
            );
            const firstQuestion = await chatService.current.startConversation();
            setMessages([{ role: 'assistant', content: firstQuestion }]);
        } catch (err: any) {
            console.error(err);
            setError(formatGeminiError(err));
            setChatProject(null);
            setAppState(AppState.DASHBOARD);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = useCallback(async (overrideMessage?: string) => {
        const textToSend = (overrideMessage !== undefined ? overrideMessage : userInput).trim();
        if (!textToSend || !chatService.current) return;

        const newUserMessage: ChatMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, newUserMessage]);
        if (overrideMessage === undefined) {
            setUserInput('');
        }
        setIsLoading(true);
        setError(null);

        try {
            const responseText = await chatService.current.sendMessage(textToSend);

            if (chatService.current.isFinalDocument(responseText)) {
                const docs = chatService.current.extractDocuments(responseText);
                setGeneratedTexts(docs);
                setAppState(AppState.SHOW_RESULT);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
            }
        } catch (err) {
            console.error(err);
            const errorMessage = formatGeminiError(err);
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    }, [userInput]);

    const handleSaveFinalResult = () => {
        const targetProj = chatProject || activeProject;
        if (!generatedTexts || !targetProj) return;

        const updatedProjects: Project[] = projects.map(p => {
            if (p.id === targetProj.id) {
                const finalImpressum =
                    generatedTexts.impressum && generatedTexts.impressum !== 'KEEP_EXISTING'
                        ? generatedTexts.impressum
                        : p.impressum;
                const finalDatenschutz =
                    generatedTexts.datenschutzerklaerung && generatedTexts.datenschutzerklaerung !== 'KEEP_EXISTING'
                        ? generatedTexts.datenschutzerklaerung
                        : p.datenschutzerklaerung;
                const updated = {
                    ...p,
                    impressum: finalImpressum,
                    datenschutzerklaerung: finalDatenschutz
                };
                setActiveProject(updated);
                return updated;
            }
            return p;
        });

        saveProjectsToStorage(updatedProjects);
        setMessages([]);
        setGeneratedTexts(null);
        setChatProject(null);
        setAppState(AppState.DASHBOARD);
    };

    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjectToDelete(project);
    };

    const confirmDeleteProject = () => {
        if (!projectToDelete) return;
        const updated = projects.filter(p => p.id !== projectToDelete.id);
        saveProjectsToStorage(updated);
        if (activeProject?.id === projectToDelete.id) {
            setActiveProject(null);
        }
        setProjectToDelete(null);
    };

    const handleUpdateProject = (updatedProj: Project) => {
        const updated = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
        saveProjectsToStorage(updated);
        setActiveProject(updatedProj);
        setAppState(AppState.DASHBOARD);
    };

    // Workspace Root Folder Scanner (Alle Entwicklungsprojekte aus einem Überordner laden)
    const [isScanningWorkspace, setIsScanningWorkspace] = useState<boolean>(false);
    const [workspaceScanProgress, setWorkspaceScanProgress] = useState<string | null>(null);
    const [workspaceScanFolder, setWorkspaceScanFolder] = useState<string | null>(null);
    const [workspaceScanStats, setWorkspaceScanStats] = useState<{
        current: number;
        total: number;
        remainingSec: number | null;
    } | null>(null);
    const [workspaceModalData, setWorkspaceModalData] = useState<{
        rootFolderName: string;
        items: Array<{
            scan: ScanResult;
            selected: boolean;
            existingProjectId?: string;
        }>;
    } | null>(null);

    const handleScanWorkspaceFolder = async () => {
        try {
            setIsScanningWorkspace(true);
            setWorkspaceScanProgress('Suche Projekte…');
            setWorkspaceScanFolder(null);
            setWorkspaceScanStats(null);
            const scanStartTime = Date.now();
            const summary = await selectAndScanWorkspaceRoot((currentFolder, currentIdx, total) => {
                const elapsedMs = Date.now() - scanStartTime;
                let remainingSec: number | null = null;
                if (currentIdx >= 2 && elapsedMs > 200) {
                    const avgPerFolder = elapsedMs / (currentIdx - 1);
                    const remainingItems = Math.max(0, total - currentIdx + 1);
                    remainingSec = Math.max(1, Math.ceil((avgPerFolder * remainingItems) / 1000));
                }
                setWorkspaceScanProgress(`Scanne (${currentIdx} / ${total})…`);
                setWorkspaceScanFolder(currentFolder);
                setWorkspaceScanStats({ current: currentIdx, total, remainingSec });
            });
            if (!summary) return;

            if (summary.projects.length === 0) {
                setError(`Im gewählten Ordner „${summary.rootFolderName}“ wurden keine Entwicklungsprojekte gefunden.`);
                return;
            }

            const items = summary.projects.map((scan) => {
                const existing = projects.find(
                    (p) =>
                        (p.projectPath && p.projectPath.toLowerCase() === scan.folderPath.toLowerCase()) ||
                        p.name.trim().toLowerCase() === scan.name.trim().toLowerCase()
                );
                return {
                    scan,
                    selected: !existing,
                    existingProjectId: existing?.id
                };
            });

            setWorkspaceModalData({
                rootFolderName: summary.rootFolderName,
                items
            });
        } catch (err) {
            console.error('Fehler beim Workspace-Scan:', err);
            setError('Fehler beim Scannen des Entwicklungs-Ordners.');
        } finally {
            setIsScanningWorkspace(false);
            setWorkspaceScanProgress(null);
            setWorkspaceScanFolder(null);
            setWorkspaceScanStats(null);
        }
    };

    const handleConfirmWorkspaceImport = () => {
        if (!workspaceModalData) return;
        try {
            const selectedItems = workspaceModalData.items.filter((i) => i.selected);
            if (selectedItems.length === 0) {
                setWorkspaceModalData(null);
                return;
            }

            const updatedExistingMap = new Map<string, ScanResult>();
            const newProjectsToCreate: Project[] = [];
            const baseNow = Date.now();
            const todayStr = new Date().toLocaleDateString('de-DE');

            selectedItems.forEach((item, idx) => {
                if (item.existingProjectId) {
                    updatedExistingMap.set(item.existingProjectId, item.scan);
                } else {
                    newProjectsToCreate.push({
                        id: `${baseNow}-${idx}`,
                        name: item.scan.name || item.scan.folderPath,
                        url: item.scan.homepageUrl || '',
                        projectTypes:
                            item.scan.inferredProjectTypes && item.scan.inferredProjectTypes.length > 0
                                ? item.scan.inferredProjectTypes
                                : ['Webseite'],
                        isCommercial: Boolean(item.scan.inferredIsCommercial),
                        impressum: item.scan.detectedImpressum || '',
                        datenschutzerklaerung: item.scan.detectedDatenschutz || '',
                        createdAt: todayStr,
                        projectPath: item.scan.folderPath,
                        detectedServices: item.scan.detectedServices,
                        codeAnalysisSummary: item.scan.codeAnalysisSummary,
                        iconDataUrl: item.scan.iconDataUrl
                    });
                }
            });

            const updatedList = projects.map((p) => {
                const scanUpdate = updatedExistingMap.get(p.id);
                if (!scanUpdate) return p;
                return {
                    ...p,
                    projectPath: scanUpdate.folderPath,
                    url: p.url || scanUpdate.homepageUrl || '',
                    detectedServices: scanUpdate.detectedServices,
                    codeAnalysisSummary: scanUpdate.codeAnalysisSummary || p.codeAnalysisSummary,
                    iconDataUrl: scanUpdate.iconDataUrl || p.iconDataUrl,
                    impressum: p.impressum || scanUpdate.detectedImpressum || '',
                    datenschutzerklaerung: p.datenschutzerklaerung || scanUpdate.detectedDatenschutz || ''
                };
            });

            saveProjectsToStorage([...newProjectsToCreate, ...updatedList]);
        } catch (err) {
            console.error('Fehler beim Übernehmen der Projekte:', err);
        } finally {
            setWorkspaceModalData(null);
        }
    };

    const renderMainContent = () => {
        switch (appState) {
            case AppState.DASHBOARD:
                if (activeProject) {
                    return (
                        <ProjectDetail
                            project={activeProject}
                            onBack={() => setActiveProject(null)}
                            onRegenerate={(mode) => {
                                startGeneratorChat(activeProject, mode);
                            }}
                            onUpdateProject={handleUpdateProject}
                            onEdit={() => {
                                setEditingProject(activeProject);
                                setAppState(AppState.CREATE_PROJECT);
                            }}
                        />
                    );
                }
                return (
                    <div>
                        <div className="app-roster-toolbar flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                                <h1 className="app-page-title">Projekte</h1>
                                {projects.length > 0 && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/80 text-slate-600 shadow-sm">
                                        {projects.length} {projects.length === 1 ? 'Projekt' : 'Projekte'}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleScanWorkspaceFolder}
                                    disabled={isScanningWorkspace}
                                    className="modal-btn-secondary inline-flex items-center gap-1.5 text-xs shadow-sm"
                                    title="Einen Überordner (z. B. Ihren Entwicklungs-Ordner) auswählen, um alle darin enthaltenen Projekte automatisch zu erkennen"
                                >
                                    {isScanningWorkspace ? (
                                        <>
                                            <ArrowPathIcon className="w-3.5 h-3.5 text-primary-600 animate-spin" />
                                            <span>{workspaceScanProgress || 'Scanne Ordner…'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <FolderIcon className="w-3.5 h-3.5 text-primary-600" />
                                            <span>Entwicklungs-Ordner scannen</span>
                                        </>
                                    )}
                                </button>
                                <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/85 text-slate-500 shadow-sm">
                                    <SparklesIcon className="w-3.5 h-3.5 text-primary-600" />
                                    <span>Modell:</span>
                                    <strong className="text-slate-700">{model}</strong>
                                </span>
                            </div>
                        </div>

                        {isScanningWorkspace && projects.length > 0 && (
                            <div className="hub-card mb-5 p-4 space-y-2 border border-sky-100 bg-sky-50/40">
                                <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-600 tabular-nums">
                                    <span className="flex items-center gap-2">
                                        <ArrowPathIcon className="w-4 h-4 text-primary-600 animate-spin shrink-0" />
                                        <span>
                                            {workspaceScanStats && workspaceScanStats.total > 0
                                                ? `${Math.round((workspaceScanStats.current / workspaceScanStats.total) * 100)} % (${workspaceScanStats.current} von ${workspaceScanStats.total})`
                                                : (workspaceScanProgress || 'Scanne Entwicklungs-Ordner…')}
                                        </span>
                                    </span>
                                    <span className="text-right text-slate-500">
                                        {workspaceScanStats?.remainingSec !== null && workspaceScanStats?.remainingSec !== undefined
                                            ? `Noch ca. ${workspaceScanStats.remainingSec} Sek.`
                                            : ''}
                                    </span>
                                </div>
                                {workspaceScanStats && workspaceScanStats.total > 0 && (
                                    <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-600 rounded-full transition-all duration-150"
                                            style={{
                                                width: `${Math.min(100, Math.round((workspaceScanStats.current / workspaceScanStats.total) * 100))}%`
                                            }}
                                        />
                                    </div>
                                )}
                                {workspaceScanFolder && (
                                    <p className="text-xs font-mono text-slate-500 truncate">
                                        Aktuell: <strong className="text-slate-700">{workspaceScanFolder}</strong>
                                    </p>
                                )}
                            </div>
                        )}

                        {projects.length > 0 ? (
                            <div>
                                {/* Suchleiste & Filter-Chips */}
                                <div className="mb-5 space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                                        {/* Suchfeld */}
                                        <div className="relative flex-1 min-w-[240px]">
                                            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="search"
                                                name="search-projects-filter"
                                                role="searchbox"
                                                autoComplete="off"
                                                spellCheck={false}
                                                data-dashlane-ignore="true"
                                                data-form-type="other"
                                                data-lpignore="true"
                                                data-1p-ignore="true"
                                                data-bwignore="true"
                                                value={projectSearchQuery}
                                                onChange={(e) => setProjectSearchQuery(e.target.value)}
                                                placeholder="Projekte nach Name, Typ oder Dienst durchsuchen…"
                                                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/90 rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                            />
                                            {projectSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setProjectSearchQuery('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                                    title="Suche leeren"
                                                >
                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Filter-Chips */}
                                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => setProjectFilterTab('all')}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                                    projectFilterTab === 'all'
                                                        ? 'bg-slate-900 text-white shadow-sm'
                                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                                                }`}
                                            >
                                                Alle ({projectCounts.all})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProjectFilterTab('missing_impressum')}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                                    projectFilterTab === 'missing_impressum'
                                                        ? 'bg-amber-600 text-white shadow-sm'
                                                        : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200/80'
                                                }`}
                                            >
                                                Impressum fehlt ({projectCounts.missingImpressum})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProjectFilterTab('missing_datenschutz')}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                                    projectFilterTab === 'missing_datenschutz'
                                                        ? 'bg-amber-600 text-white shadow-sm'
                                                        : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200/80'
                                                }`}
                                            >
                                                Datenschutz fehlt ({projectCounts.missingDatenschutz})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProjectFilterTab('private')}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                                    projectFilterTab === 'private'
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200/80'
                                                }`}
                                            >
                                                Gratis / Privat ({projectCounts.private})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProjectFilterTab('commercial')}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                                    projectFilterTab === 'commercial'
                                                        ? 'bg-sky-600 text-white shadow-sm'
                                                        : 'bg-white text-sky-700 hover:bg-sky-50 border border-sky-200/80'
                                                }`}
                                            >
                                                Kommerziell ({projectCounts.commercial})
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {filteredProjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredProjects.map(project => {
                                    const hasImpressum = !!project.impressum;
                                    const hasDatenschutz = !!project.datenschutzerklaerung;
                                    const cookieStatus = evaluateCookieBannerStatus(
                                        project.projectPath,
                                        project.detectedServices,
                                        project.codeAnalysisSummary
                                    );

                                    return (
                                        <div
                                            key={project.id}
                                            onClick={() => setActiveProject(project)}
                                            className="hub-card cursor-pointer flex flex-col justify-between group h-full"
                                        >
                                            <div className="flex flex-col flex-1">
                                                {/* Header: Icon + Titel + Löschen */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0 flex items-center gap-3 flex-1">
                                                        {project.iconDataUrl ? (
                                                            <img
                                                                src={project.iconDataUrl}
                                                                alt={project.name}
                                                                className="w-10 h-10 rounded-2xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-primary-600 border border-sky-100 flex items-center justify-center shrink-0">
                                                                <FolderIcon className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                        <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-primary-600 transition-colors" title={project.name}>
                                                            {project.name}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0 -mr-1">
                                                        {project.projectPath && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRescanCardProject(project);
                                                                }}
                                                                className="hub-round shrink-0 hover:!bg-primary-50 hover:!text-primary-600"
                                                                title="Projekt-Ordner erneut scannen"
                                                            >
                                                                <ArrowPathIcon className={`w-4 h-4 ${rescanningProjectId === project.id ? 'animate-spin text-primary-600' : ''}`} />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDeleteProject(project, e)}
                                                            className="hub-round shrink-0 hover:!bg-red-50 hover:!text-red-600"
                                                            title="Projekt löschen"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Badges: Volle Kartenbreite (kein Abschneiden der Kapseln) */}
                                                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold flex-wrap">
                                                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full whitespace-nowrap">
                                                        {project.projectTypes?.[0] || 'Webseite'}
                                                    </span>
                                                    {project.projectTypes && project.projectTypes.length > 1 && (
                                                        <span
                                                            className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] whitespace-nowrap"
                                                            title={project.projectTypes.slice(1).join(', ')}
                                                        >
                                                            +{project.projectTypes.length - 1}
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleToggleCommercial(project, e)}
                                                        className={`px-2.5 py-0.5 rounded-full transition-transform active:scale-95 cursor-pointer whitespace-nowrap ${
                                                            project.isCommercial !== false
                                                                ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                        }`}
                                                        title="Klicken, um zwischen „Kommerziell“ und „Gratis / Privat“ umzuschalten"
                                                    >
                                                        {project.isCommercial !== false ? 'Kommerziell' : 'Gratis / Privat'}
                                                    </button>
                                                </div>

                                                {/* Meta-Zeilen: Exakt 2 feste Zeilenhöhen */}
                                                <div className="mt-3.5 space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate h-4">
                                                        <GlobeIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span className="font-mono truncate">{project.url || 'Keine URL hinterlegt'}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 h-3.5">Angelegt am {project.createdAt}</p>
                                                </div>

                                                {/* Status-Sektion: Feste 2-Zeilen-Struktur für identische Höhe */}
                                                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                                                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                                                        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full truncate ${hasImpressum ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                            <DocumentTextIcon className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate">Impressum {hasImpressum ? 'vorhanden' : 'fehlt'}</span>
                                                        </span>
                                                        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full truncate ${hasDatenschutz ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                            <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate">Datenschutz {hasDatenschutz ? 'vorhanden' : 'fehlt'}</span>
                                                        </span>
                                                    </div>

                                                    <div className="h-6 flex items-center">
                                                        {cookieStatus.status !== 'unknown' ? (
                                                            <span
                                                                title={cookieStatus.detailText}
                                                                className={`w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold truncate ${
                                                                    cookieStatus.status === 'implemented'
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : cookieStatus.status === 'missing_warning'
                                                                        ? 'bg-red-50 text-red-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                            >
                                                                <CheckCircleIcon className="w-3 h-3 shrink-0" />
                                                                <span className="truncate">{cookieStatus.shortLabel}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-400 bg-slate-50">
                                                                <span className="truncate">Kein Cookie-Check</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Dokumenten-Buttons: Alle Karten sitzen auf exakt derselben vertikalen Achse */}
                                                <div className="mt-4 pt-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startGeneratorChat(project, 'impressum')}
                                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-primary-700 whitespace-nowrap transition-colors"
                                                        >
                                                            <DocumentTextIcon className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Impressum</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => startGeneratorChat(project, 'datenschutz')}
                                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-primary-700 whitespace-nowrap transition-colors"
                                                        >
                                                            <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Datenschutz</span>
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => startGeneratorChat(project, 'both')}
                                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
                                                    >
                                                        <SparklesIcon className="w-3.5 h-3.5 shrink-0" />
                                                        <span>{hasImpressum && hasDatenschutz ? 'Beide Texte aktualisieren' : 'Beide Dokumente generieren'}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Footer: Bottom row */}
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                                                {project.detectedServices && project.detectedServices.length > 0 ? (
                                                    <span className="text-[11px] text-slate-400 font-medium truncate">
                                                        {project.detectedServices.length} erkannte Dienste
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">Kein Ordner-Scan</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveProject(project)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 -mr-2 rounded-full text-primary-600 hover:text-primary-700 hover:bg-sky-50 font-semibold cursor-pointer shrink-0"
                                                >
                                                    Öffnen &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                    </div>
                                ) : (
                                    <div className="hub-card text-center py-12 max-w-md mx-auto mt-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                                            <MagnifyingGlassIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">Keine passenden Projekte gefunden</h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {projectSearchQuery
                                                ? `Kein Projekt entspricht der Suche „${projectSearchQuery}“.`
                                                : 'Kein Projekt entspricht den aktuell gewählten Filtern.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProjectSearchQuery('');
                                                setProjectFilterTab('all');
                                            }}
                                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full transition-colors mx-auto"
                                        >
                                            <ArrowPathIcon className="w-3.5 h-3.5" />
                                            <span>Filter &amp; Suche zurücksetzen</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : isScanningWorkspace ? (
                            <div className="hub-card text-center py-16 max-w-xl mx-auto mt-6">
                                <div className="w-14 h-14 rounded-full bg-sky-50 text-primary-600 flex items-center justify-center mx-auto">
                                    <ArrowPathIcon className="w-7 h-7 text-primary-600 animate-spin" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-slate-800">Entwicklungs-Ordner wird gescannt…</h3>
                                <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
                                    Gefundene Projekte werden analysiert und für Sie vorbereitet.
                                </p>

                                <div className="mt-6 w-full max-w-md mx-auto space-y-2 px-4">
                                    {workspaceScanStats && workspaceScanStats.total > 0 ? (
                                        <div className="space-y-1.5">
                                            <div className="w-full flex items-center justify-between gap-4 text-xs font-semibold text-slate-600 tabular-nums">
                                                <span>
                                                    {Math.round((workspaceScanStats.current / workspaceScanStats.total) * 100)} % ({workspaceScanStats.current} von {workspaceScanStats.total})
                                                </span>
                                                <span className="text-right text-slate-500">
                                                    {workspaceScanStats.remainingSec !== null
                                                        ? `Noch ca. ${workspaceScanStats.remainingSec} Sek.`
                                                        : 'Berechne Restdauer…'}
                                                </span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-600 rounded-full transition-all duration-150"
                                                    style={{
                                                        width: `${Math.min(100, Math.round((workspaceScanStats.current / workspaceScanStats.total) * 100))}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400">Suche nach Projektdateien…</div>
                                    )}
                                    {workspaceScanFolder && (
                                        <p className="w-full text-xs font-mono text-slate-500 truncate text-center pt-1">
                                            Aktuell: <strong className="text-slate-700">{workspaceScanFolder}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="hub-card text-center py-16 max-w-xl mx-auto mt-6">
                                <div className="w-14 h-14 rounded-full bg-sky-50 text-primary-600 flex items-center justify-center mx-auto">
                                    <FolderIcon className="w-7 h-7" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-slate-800">Noch kein Projekt angelegt</h3>
                                <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
                                    Erstellen Sie Ihr erstes Projekt, um ein Impressum und eine Datenschutzerklärung mit KI-Unterstützung zu generieren.
                                </p>
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingProject(null);
                                            setAppState(AppState.CREATE_PROJECT);
                                        }}
                                        className="modal-btn-primary inline-flex items-center gap-2 text-sm shadow-sm whitespace-nowrap"
                                    >
                                        <PlusIcon className="w-4 h-4 shrink-0" />
                                        <span>Einzelnes Projekt erstellen</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleScanWorkspaceFolder}
                                        disabled={isScanningWorkspace}
                                        className="modal-btn-secondary inline-flex items-center gap-2 text-sm shadow-sm whitespace-nowrap"
                                    >
                                        <FolderIcon className="w-4 h-4 text-primary-600 shrink-0" />
                                        <span>Entwicklungs-Ordner scannen</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setEditingProject(null);
                                setAppState(AppState.CREATE_PROJECT);
                            }}
                            className="app-fab"
                            aria-label="Neues Projekt"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="app-fab-icon"
                                aria-hidden="true"
                            >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" y1="18" x2="12" y2="12" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                            <span className="app-fab-text">Neues Projekt</span>
                        </button>
                    </div>
                );
            case AppState.PROFILE:
                return (
                    <UserProfileEditor
                        profile={userProfile}
                        onSave={handleSaveProfile}
                    />
                );
            case AppState.CREATE_PROJECT:
                return (
                    <CreateProjectForm
                        project={editingProject || undefined}
                        onSave={(name, url, projectTypes, isCommercial, projectPath, detectedServices, codeAnalysisSummary, iconDataUrl) => {
                            if (editingProject) {
                                handleUpdateProject({
                                    ...editingProject,
                                    name,
                                    url,
                                    projectTypes,
                                    isCommercial,
                                    projectPath,
                                    detectedServices,
                                    codeAnalysisSummary,
                                    iconDataUrl: iconDataUrl || editingProject.iconDataUrl
                                });
                                setEditingProject(null);
                            } else {
                                handleCreateProject(name, url, projectTypes, isCommercial, projectPath, detectedServices, codeAnalysisSummary, iconDataUrl);
                            }
                        }}
                        onCancel={() => {
                            setEditingProject(null);
                            setAppState(AppState.DASHBOARD);
                        }}
                    />
                );
            case AppState.SETTINGS:
                return (
                    <AppSettingsEditor
                        apiKey={apiKey}
                        model={model}
                        onSaveKey={(key) => {
                            setApiKey(key);
                            localStorage.setItem('legalgen_api_key', key);
                        }}
                        onSaveModel={(m) => {
                            setModel(m);
                            localStorage.setItem('legalgen_model', m);
                        }}
                        ddgText={ddgText}
                        dsgvoText={dsgvoText}
                        onSaveDdgText={(text) => {
                            setDdgText(text);
                            localStorage.setItem('legalgen_ddg_text', text);
                        }}
                        onSaveDsgvoText={(text) => {
                            setDsgvoText(text);
                            localStorage.setItem('legalgen_dsgvo_text', text);
                        }}
                        onShowDiff={() => setShowDiffModal(true)}
                        hasUpdates={!!lawUpdateNotification}
                        lastUpdateCheck={lastUpdateCheck}
                        isCheckingLawUpdates={isCheckingLawUpdates}
                        lawCheckFeedback={lawCheckFeedback}
                        onCheckLawUpdates={() => checkLawUpdates(true)}
                        projects={projects}
                        userProfile={userProfile}
                        onRestoreBackup={(restoredProjects, restoredProfile) => {
                            saveProjectsToStorage(restoredProjects);
                            handleSaveProfile(restoredProfile);
                            setActiveProject(null);
                        }}
                    />
                );
            case AppState.CHAT:
                return (
                    <ConversationStep
                        projectName={chatProject ? chatProject.name : activeProject ? activeProject.name : 'Projekt'}
                        messages={messages}
                        userInput={userInput}
                        setUserInput={setUserInput}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        currentModel={model}
                        fallbackNotification={modelFallbackNotification}
                        onDismissFallbackNotification={() => setModelFallbackNotification(null)}
                        onCancel={() => {
                            setMessages([]);
                            setGeneratedTexts(null);
                            setChatProject(null);
                            setModelFallbackNotification(null);
                            setAppState(AppState.DASHBOARD);
                        }}
                    />
                );
            case AppState.SHOW_RESULT:
                if (!generatedTexts) return null;
                return (
                    <ResultStep
                        impressum={generatedTexts.impressum}
                        datenschutz={generatedTexts.datenschutzerklaerung}
                        existingImpressum={chatProject?.impressum ?? activeProject?.impressum}
                        existingDatenschutz={chatProject?.datenschutzerklaerung ?? activeProject?.datenschutzerklaerung}
                        onSave={handleSaveFinalResult}
                        onCancel={() => {
                            setGeneratedTexts(null);
                            setChatProject(null);
                            setAppState(AppState.DASHBOARD);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const isProjectsSection =
        appState === AppState.DASHBOARD ||
        appState === AppState.CREATE_PROJECT;

    if (appState === AppState.LANDING && !isStandalonePwa) {
        return (
            <>
                <LandingPage
                    canInstallPwa={Boolean(deferredInstallPrompt)}
                    isStandalonePwa={isStandalonePwa}
                    onInstallPwa={handleInstallPwa}
                    onOpenLegal={(tab) => setLegalModalTab(tab)}
                    onEnterApp={() => {
                        localStorage.setItem('legalgen_has_entered', 'true');
                        setActiveProject(null);
                        setEditingProject(null);
                        setAppState(AppState.DASHBOARD);
                    }}
                />
                {legalModalTab && (
                    <LegalNoticeModal
                        initialTab={legalModalTab}
                        onClose={() => setLegalModalTab(null)}
                    />
                )}
            </>
        );
    }

    return (
        <div className="app-fixed-layout text-slate-800 antialiased selection:bg-sky-200">
            {/* Floating Sidebar */}
            <nav className="app-sidebar" aria-label="Hauptnavigation">
                <div
                    className="app-sidebar-brand cursor-pointer"
                    onClick={() => {
                        setActiveProject(null);
                        setEditingProject(null);
                        setAppState(isStandalonePwa ? AppState.DASHBOARD : AppState.LANDING);
                    }}
                    title={isStandalonePwa ? 'Zu den Projekten' : 'Landingpage anzeigen'}
                >
                    <img className="app-sidebar-logo" src="./icon.png" alt="LegalGen AI" />
                    <span>LegalGen AI</span>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setActiveProject(null);
                        setEditingProject(null);
                        setAppState(AppState.DASHBOARD);
                    }}
                    className={`app-nav-item ${isProjectsSection ? 'app-nav-active' : ''}`}
                >
                    <span className="app-nav-icon">
                        <FolderIcon className="w-4 h-4" />
                    </span>
                    <span>Projekte</span>
                </button>

                {chatProject && (messages.length > 0 || generatedTexts !== null) && (
                    <button
                        type="button"
                        onClick={() => {
                            setActiveProject(chatProject);
                            setAppState(generatedTexts !== null ? AppState.SHOW_RESULT : AppState.CHAT);
                        }}
                        className={`app-nav-item ${
                            appState === AppState.CHAT || appState === AppState.SHOW_RESULT
                                ? 'app-nav-active'
                                : '!text-primary-700 !bg-sky-50/90 hover:!bg-sky-100 ring-1 ring-primary-200/80 shadow-sm'
                        } transition-all`}
                        title={`Zum laufenden KI-Chat für „${chatProject.name}“`}
                    >
                        <span className="app-nav-icon relative">
                            <SparklesIcon className="w-4 h-4 text-primary-600" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </span>
                        <span className="truncate">
                            {appState === AppState.CHAT || appState === AppState.SHOW_RESULT
                                ? 'KI-Chat'
                                : `Chat: ${chatProject.name}`}
                        </span>
                        {isLoading && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 animate-ping" />
                        )}
                    </button>
                )}

                <div style={{ flex: 1 }} />

                {deferredInstallPrompt && (
                    <button
                        type="button"
                        onClick={handleInstallPwa}
                        className="app-nav-item !text-primary-700 !bg-sky-50/80 hover:!bg-sky-100 mb-1"
                        title="LegalGen AI als eigenständige App (PWA) installieren"
                    >
                        <span className="app-nav-icon">
                            <DownloadIcon className="w-4 h-4 text-primary-600" />
                        </span>
                        <span>App installieren</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => {
                        setAppState(AppState.PROFILE);
                    }}
                    className={`app-nav-item ${appState === AppState.PROFILE ? 'app-nav-active' : ''}`}
                >
                    <span className="app-nav-icon">
                        <UserIcon className="w-4 h-4" />
                    </span>
                    <span>Mein Profil</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setAppState(AppState.SETTINGS);
                    }}
                    className={`app-nav-item ${appState === AppState.SETTINGS ? 'app-nav-active' : ''}`}
                >
                    <span className="app-nav-icon">
                        <CogIcon className="w-4 h-4" />
                    </span>
                    <span>Einstellungen</span>
                    {lawUpdateNotification && (
                        <span className="app-nav-badge">1</span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setLegalModalTab('impressum')}
                    className="app-nav-item !text-slate-500 hover:!text-slate-800"
                    title="Impressum &amp; Datenschutzerklärung dieser Web-App anzeigen"
                >
                    <span className="app-nav-icon">
                        <ScaleJusticeIcon className="w-4 h-4 text-slate-500" />
                    </span>
                    <span>Rechtliches</span>
                </button>
            </nav>

            {/* Main Fixed Content Area */}
            <main className="app-main-fixed w-full mx-auto flex flex-col">
                <div className="app-scroll-wide app-soft app-page-enter w-full min-h-0 pt-3.5 pb-20">
                    {lawUpdateNotification && (
                        <div className="mb-4 p-4 bg-sky-50 border border-sky-200 text-sky-900 rounded-[22px] text-sm font-semibold flex items-center justify-between shadow-sm flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                                <SparklesIcon className="w-4 h-4 text-primary-600 shrink-0" />
                                <span>{lawUpdateNotification.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDiffModal(true)}
                                    className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
                                >
                                    Änderungen anzeigen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLawUpdateNotification(null)}
                                    className="px-3 py-1.5 rounded-full text-slate-500 hover:bg-white/70 text-xs font-semibold transition-colors"
                                >
                                    Ausblenden
                                </button>
                            </div>
                        </div>
                    )}

                    {isKeyLoaded && !apiKey.trim() && appState !== AppState.SETTINGS && appState !== AppState.LANDING && (
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-[22px] flex items-center justify-between text-sm text-amber-900 shadow-sm flex-wrap gap-3">
                            <div className="flex items-center gap-2.5">
                                <CogIcon className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Bitte tragen Sie einen <strong>Gemini API-Key</strong> in den Einstellungen ein, um den KI-Generator zu nutzen.</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAppState(AppState.SETTINGS)}
                                className="px-4 py-1.5 rounded-full bg-white text-amber-900 font-semibold text-xs shadow-sm hover:bg-amber-100/60 transition-colors"
                            >
                                Einstellungen öffnen
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-[22px] text-sm font-semibold flex items-center justify-between gap-2">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="px-2.5 py-1 rounded-full text-xs text-red-600 hover:bg-red-100 transition-colors"
                            >
                                Schließen
                            </button>
                        </div>
                    )}

                    <div
                        key={`${appState}-${activeProject?.id || 'list'}-${editingProject?.id || 'none'}`}
                        className="app-page-enter"
                    >
                        {renderMainContent()}
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {projectToDelete && (
                <div className="confirm-modal-overlay" onClick={() => setProjectToDelete(null)}>
                    <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 text-red-600 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <TrashIcon className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Projekt löschen?</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Möchten Sie das Projekt <strong className="text-slate-800 font-semibold">„{projectToDelete.name}“</strong> wirklich unwiderruflich löschen? Dadurch gehen auch die generierten Rechtstexte verloren.
                        </p>
                        <div className="flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setProjectToDelete(null)}
                                className="confirm-btn-cancel"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteProject}
                                className="confirm-btn-delete"
                            >
                                Ja, löschen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Workspace Scan Selection Modal */}
            {workspaceModalData && (
                <div className="modal-overlay" onClick={() => setWorkspaceModalData(null)}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">
                                    Gefundene Projekte in „{workspaceModalData.rootFolderName}“
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {workspaceModalData.items.length}{' '}
                                    {workspaceModalData.items.length === 1 ? 'Projekt wurde' : 'Projekte wurden'} im Entwicklungs-Ordner erkannt. Wählen Sie aus, welche Projekte angelegt oder aktualisiert werden sollen.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setWorkspaceModalData(null)}
                                className="modal-close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body space-y-3">
                            <div className="flex items-center justify-between gap-2 pb-1">
                                <span className="text-xs font-bold text-slate-500">
                                    {workspaceModalData.items.filter((i) => i.selected).length} von {workspaceModalData.items.length} ausgewählt
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setWorkspaceModalData((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          items: prev.items.map((item) => ({ ...item, selected: true }))
                                                      }
                                                    : null
                                            )
                                        }
                                        className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-primary-700 transition-colors"
                                    >
                                        Alle auswählen
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setWorkspaceModalData((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          items: prev.items.map((item) => ({ ...item, selected: false }))
                                                      }
                                                    : null
                                            )
                                        }
                                        className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                    >
                                        Auswahl aufheben
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 max-h-[58vh] overflow-y-auto pr-1">
                                {workspaceModalData.items.map((item, idx) => {
                                    const cookieEval = evaluateCookieBannerStatus(
                                        item.scan.folderPath,
                                        item.scan.detectedServices,
                                        item.scan.codeAnalysisSummary
                                    );
                                    return (
                                        <label
                                            key={item.scan.folderPath}
                                            className={`px-3.5 py-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                                                item.selected
                                                    ? 'bg-sky-50/60 border-primary-600 shadow-sm'
                                                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.selected}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setWorkspaceModalData((prev) => {
                                                        if (!prev) return null;
                                                        const nextItems = [...prev.items];
                                                        nextItems[idx] = { ...nextItems[idx], selected: checked };
                                                        return { ...prev, items: nextItems };
                                                    });
                                                }}
                                                className="w-4 h-4 rounded shrink-0"
                                            />

                                            {item.scan.iconDataUrl ? (
                                                <img
                                                    src={item.scan.iconDataUrl}
                                                    alt={item.scan.name}
                                                    className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-primary-600 flex items-center justify-center shrink-0">
                                                    <FolderIcon className="w-5 h-5" />
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="font-bold text-sm text-slate-800 truncate">
                                                            {item.scan.name || item.scan.folderPath}
                                                        </span>
                                                        {item.existingProjectId ? (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 shrink-0">
                                                                Bereits angelegt (Scan-Update)
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 shrink-0">
                                                                Neu
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[220px] shrink-0">
                                                        {item.scan.folderPath}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    {(item.scan.inferredProjectTypes || ['Webseite']).map((t) => (
                                                        <span
                                                            key={t}
                                                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-primary-700">
                                                        {item.scan.detectedServices.length} Dienste
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        item.scan.inferredIsCommercial
                                                            ? 'bg-sky-50 text-sky-700'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                        {item.scan.inferredIsCommercial ? 'Kommerziell' : 'Gratis / Privat'}
                                                    </span>
                                                    {item.scan.detectedImpressum && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                                            ✓ Impressum erkannt
                                                        </span>
                                                    )}
                                                    {item.scan.detectedDatenschutz && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                                            ✓ Datenschutz erkannt
                                                        </span>
                                                    )}
                                                    {cookieEval.status !== 'unknown' && (
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                                cookieEval.status === 'implemented'
                                                                    ? 'bg-emerald-50 text-emerald-700'
                                                                    : cookieEval.status === 'missing_warning'
                                                                    ? 'bg-red-50 text-red-700'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {cookieEval.shortLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="modal-footer flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setWorkspaceModalData(null)}
                                className="modal-btn-secondary"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmWorkspaceImport}
                                disabled={workspaceModalData.items.filter((i) => i.selected).length === 0}
                                className="modal-btn-primary"
                            >
                                {workspaceModalData.items.filter((i) => i.selected).length}{' '}
                                {workspaceModalData.items.filter((i) => i.selected).length === 1
                                    ? 'Projekt übernehmen'
                                    : 'Projekte übernehmen'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Diff Modal */}
            {showDiffModal && lawUpdateNotification && (
                <div className="modal-overlay" onClick={() => setShowDiffModal(false)}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Vergleich der Textaktualisierungen</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Unterschiede zwischen den alten lokalen Vorlagen und den neu heruntergeladenen Gesetzestexten.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDiffModal(false)}
                                className="modal-close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body space-y-6">
                            {lawUpdateNotification.details.map((detail, idx) => {
                                const diffResult = Diff.diffWordsWithSpace(detail.oldText, detail.newText);
                                return (
                                    <div key={idx} className="space-y-2">
                                        <h4 className="font-bold text-sm text-slate-700 flex items-center justify-between">
                                            <span>{detail.label}</span>
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">Wortbasierter Vergleich</span>
                                        </h4>
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-80 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                            {diffResult.map((part: any, i: number) => {
                                                if (part.added) {
                                                    return (
                                                        <span key={i} className="bg-emerald-100 text-emerald-800 px-0.5 rounded font-semibold" title="Hinzugefügt">
                                                            {part.value}
                                                        </span>
                                                    );
                                                }
                                                if (part.removed) {
                                                    return (
                                                        <span key={i} className="bg-red-100 text-red-800 line-through px-0.5 rounded font-semibold" title="Entfernt">
                                                            {part.value}
                                                        </span>
                                                    );
                                                }
                                                return <span key={i} className="text-slate-600">{part.value}</span>;
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={() => setShowDiffModal(false)}
                                className="modal-btn-primary"
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Legal Notice Modal (Impressum & Datenschutzerklärung der Web-App) */}
            {legalModalTab && (
                <LegalNoticeModal
                    initialTab={legalModalTab}
                    onClose={() => setLegalModalTab(null)}
                />
            )}
        </div>
    );
}
