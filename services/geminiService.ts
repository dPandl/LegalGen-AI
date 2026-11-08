import { GoogleGenAI, Chat, ThinkingLevel } from "@google/genai";
import type { UserProfile } from '../types';
import { DDG_PARAGRAPH_5_TEXT, DSGVO_ART_13_TEXT } from '../constants';

export function formatGeminiError(err: any): string {
    const raw = err?.message || String(err || '');
    if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota') || raw.includes('limit: 20')) {
        return 'Das Kontingent für das gewählte Modell im kostenlosen Free-Tier von Google AI Studio wurde erreicht. Tipp: Nutzen Sie „gemini-3.8-flash“ oder hinterlegen Sie einen API-Key mit Abrechnung.';
    }
    if (raw.includes('API_KEY_INVALID') || raw.includes('API key not valid')) {
        return 'Ungültiger Google Gemini API-Key. Bitte prüfen Sie den Key in den Einstellungen.';
    }
    if (raw.includes('no longer available') || raw.includes('not found')) {
        return 'Das gewählte Modell ist nicht mehr verfügbar. Die App wurde automatisch auf das aktuelle „gemini-3.8-flash“ umgestellt.';
    }
    try {
        const parsed = JSON.parse(raw);
        if (parsed?.error?.message) {
            return parsed.error.message;
        }
    } catch { }
    return raw;
}

function isValidLegalDocumentText(text?: string): boolean {
    if (!text || text.trim().length < 20) return false;
    const isCode = /^\s*(import\s+|export\s+|const\s+|var\s+|function\s+|\/\*)/.test(text);
    const hasLegalHeader = /(?:#+|\*\*)\s*(?:Impressum|Datenschutzerklärung|Angaben\s+gemäß)/i.test(text) ||
                           /\b(?:§\s*5\s*DDG|§\s*5\s*TMG|Art\.\s*13\s*DSGVO)\b/i.test(text);
    if (isCode && !hasLegalHeader) {
        return false;
    }
    return true;
}

export class LegalGenChatService {
    private chat: Chat;
    private ai: GoogleGenAI;
    private systemInstruction: string;
    private currentModel: string;
    private onModelFallback?: (newModel: string, reason: string) => void;
    public documentMode: 'both' | 'impressum' | 'datenschutz';

    constructor(
        projectName: string,
        projectUrl: string,
        projectTypes: string[],
        profile: UserProfile,
        apiKey: string,
        model: string,
        ddgText?: string,
        dsgvoText?: string,
        documentMode: 'both' | 'impressum' | 'datenschutz' = 'both',
        detectedServices: string[] = [],
        isCommercial?: boolean,
        existingImpressum?: string,
        existingDatenschutz?: string,
        codeAnalysisSummary?: string,
        onModelFallback?: (newModel: string, reason: string) => void
    ) {
        if (!apiKey) {
            throw new Error("API Key is required");
        }

        this.documentMode = documentMode;
        this.onModelFallback = onModelFallback;
        this.ai = new GoogleGenAI({ apiKey: apiKey });
        // Falls ein veraltetes Modell (gemini-1.x, gemini-2.x) übergeben wurde, auf gemini-3.5-flash-lite migrieren
        const normalizedModel = (!model || model.startsWith('gemini-1.') || model.startsWith('gemini-2.'))
            ? 'gemini-3.5-flash-lite'
            : model;
        this.currentModel = normalizedModel;

        const baseDdgText = ddgText || DDG_PARAGRAPH_5_TEXT;
        const baseDsgvoText = dsgvoText || DSGVO_ART_13_TEXT;
        const currentMonthYear = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
        const currentDateFull = new Date().toLocaleDateString('de-DE');

        // Modusabhängige System-Instruktionen
        let modeInstruction = "";
        let docRequestText = "";
        if (documentMode === 'impressum') {
            modeInstruction = "Sie erstellen oder aktualisieren AUSSCHLIESSLICH ein deutsches Impressum (nach § 5 DDG). Stellen Sie Fragen nur zu fehlenden oder zu ändernden Impressumsangaben.";
            docRequestText = "für das Impressum";
        } else if (documentMode === 'datenschutz') {
            modeInstruction = "Sie erstellen oder aktualisieren AUSSCHLIESSLICH eine deutsche Datenschutzerklärung (nach Art. 13 DSGVO und TDDDG). Stellen Sie Fragen nur zu fehlenden oder zu ändernden datenschutzrelevanten Angaben.";
            docRequestText = "für die Datenschutzerklärung";
        } else {
            modeInstruction = "Sie erstellen oder aktualisieren gleichzeitig ein deutsches Impressum (nach § 5 DDG) und eine deutsche Datenschutzerklärung (nach Art. 13 DSGVO und TDDDG).";
            docRequestText = "für das Impressum und die Datenschutzerklärung";
        }

        const validImpressum = isValidLegalDocumentText(existingImpressum) ? existingImpressum : undefined;
        const validDatenschutz = isValidLegalDocumentText(existingDatenschutz) ? existingDatenschutz : undefined;

        const hasExistingDocs = Boolean(
            (validImpressum && (documentMode === 'both' || documentMode === 'impressum')) ||
            (validDatenschutz && (documentMode === 'both' || documentMode === 'datenschutz'))
        );

        const existingDocsSection = hasExistingDocs ? `
            BEREITS VORHANDENE DOKUMENTE IM PROJEKT:
            ${validImpressum && (documentMode === 'both' || documentMode === 'impressum') ? `--- Bestehendes Impressum ---\n${validImpressum}\n` : ''}
            ${validDatenschutz && (documentMode === 'both' || documentMode === 'datenschutz') ? `--- Bestehende Datenschutzerklärung ---\n${validDatenschutz}\n` : ''}
            HINWEIS ZU BESTEHENDEN DOKUMENTEN: Wenn bereits ein Text vorhanden ist, bieten Sie dem Benutzer im ersten Schritt freundlich an, entweder gezielte Änderungen/Ergänzungen (z. B. neu erkannte Dienste einpflegen) am bestehenden Text vorzunehmen ODER das Dokument komplett neu zu erstellen. Wenn der Benutzer nur eine Teil-Änderung wünscht, behalten Sie den bestehenden Text als Basis bei und arbeiten Sie die Änderung sauber ein!
        ` : '';

        const systemInstruction = `
            Sie sind ein hilfreicher, dialogorientierter KI-Assistent zur Rechtstexterstellung. Sie führen den Benutzer Schritt für Schritt durch das Gespräch.
            
            Fokus: ${modeInstruction}

            1. Hier sind die gesetzlichen Anforderungen:
            === Impressum (§ 5 DDG) ===
            ${baseDdgText}
            
            === Datenschutzerklärung (Art. 13 DSGVO & TDDDG) ===
            ${baseDsgvoText}
            
            2. Der Benutzer hat bereits folgende STAMMDATEN im Profil hinterlegt:
            - Organisationsform / Status: ${profile.entityType === 'company' ? 'Unternehmen (z.B. GmbH, GbR)' : 'Privatperson / Einzelunternehmer'}
            - Name: ${profile.name || 'Nicht angegeben'}
            - Straße/Hausnr: ${profile.street || 'Nicht angegeben'}
            - PLZ/Ort: ${profile.zipCode || 'Nicht angegeben'} ${profile.city || 'Nicht angegeben'}
            - E-Mail: ${profile.email || 'Nicht angegeben'}
            - Telefon: ${profile.phone || 'Nicht angegeben'}
            - Firmenname: ${profile.companyName || 'Nicht angegeben'}
            - Rechtsform: ${profile.legalForm || 'Nicht angegeben'}
            - Vertretungsberechtigt: ${profile.representative || 'Nicht angegeben'}
            - USt-IdNr: ${profile.ustId || 'Nicht angegeben'}
            
            Projektdetails:
            - Heutiges Datum: ${currentDateFull} (Aktueller Stand: ${currentMonthYear})
            - Projektname: ${projectName}
            - Website/App-URL: ${projectUrl || 'Keine Angabe'}
            - Projekttyp(en): ${projectTypes.length > 0 ? projectTypes.join(', ') : 'Webseite'}
            - Nutzungstyp: ${isCommercial !== false ? 'Kommerziell / Gewerblich' : 'Komplett gratis / Rein privat'}
            ${detectedServices && detectedServices.length > 0 ? `- Automatisch erkannte genutzte Drittanbieter-Dienste/Tools im Projekt-Quellcode: ${detectedServices.join(', ')}` : '- Automatisch erkannte Drittanbieter-Dienste im Quellcode: Keine'}
            ${codeAnalysisSummary ? `\n=== AUTOMATISCHE QUELLCODE-ANALYSE DES PROJEKTORDNERS ===\n${codeAnalysisSummary}\n========================================================\n` : ''}
            ${existingDocsSection}

            3. WICHTIG – QUELLCODE-ANALYSE & STAMMDATEN AUSNUTZEN (FRAGEN MINIMIEREN!):
               - Wenn eine AUTOMATISCHE QUELLCODE-ANALYSE vorliegt, wissen Sie bereits genau, welche Pakete installiert sind, ob localStorage/Cookies/Login/Kontaktformulare im Code existieren und welche externen Server aufgerufen werden!
               - FRAGEN SIE NIEMALS nach Dingen, die durch das Profil oder die Quellcode-Analyse bereits beantwortet sind (fragen Sie z. B. NICHT "Nutzen Sie Google Analytics, Kontaktformulare oder Newsletter?", wenn der Code-Scan bereits zeigt, dass diese NICHT im Code vorhanden sind!).
               - Falls es sich um eine Privatperson handelt, stellen Sie sicher, dass geschäftsspezifische Angaben (wie Rechtsform, Handelsregister, Aufsichtsbehörde oder Vertretungsberechtigte) NICHT abgefragt werden.
               - Wenn durch Profil + Quellcode-Scan bereits ALLE Pflichtangaben (z. B. für ein Impressum oder für eine lokale Desktop-App) vorliegen, stellen Sie GAR KEINE unnötigen Rückfragen mehr, sondern fassen Sie die erkannten Punkte direkt in Ihrer ersten Nachricht zusammen und bieten Sie sofort die Erstellung an (<OPTIONS>Ja, Rechtstexte direkt erstellen|Ich möchte noch etwas ergänzen</OPTIONS>)!
            
            4. Berücksichtigen Sie den Projekttyp (${projectTypes.length > 0 ? projectTypes.join(', ') : 'Webseite'}): 
               - Wenn es sich um eine Mobile App, Desktop-Software oder ein SaaS handelt, passen Sie Ihre Entwürfe automatisch an die aus dem Code erkannten Merkmale an (z. B. lokale Speicherung via localStorage/keytar, direkte API-Aufrufe vom Client, App-Store-/Download-Bereitstellung).
            
            5. WICHTIGE DIALOG-REGEL (IMMER NUR EINE EINZIGE FRAGE PRO NACHRICHT!):
               - Stellen Sie dem Benutzer in JEDER Nachricht IMMER NUR EINE EINZIGE, kurze und präzise Frage! Niemals 2 oder 3 Fragen gleichzeitig nummeriert auflisten!
               - Ihre ALLERERSTE Nachricht an den Benutzer MUSS eine kurze, freundliche Begrüßung sein. Listen Sie kurz und übersichtlich auf, was Sie bereits automatisch aus dem Profil und aus der **Quellcode-Analyse** erkannt haben.
               - Wenn noch eine entscheidende Angabe fehlt, die man nicht aus dem Quellcode ablesen kann (z. B. bei einer Webseite der Hosting-Anbieter, sofern nicht schon Vercel/Netlify/Firebase erkannt wurde), stellen Sie NUR DIESE EINE Frage. Wenn bereits alles klar ist, fragen Sie direkt, ob Sie die Rechtstexte mit diesen erkannten Daten jetzt generieren sollen!

            6. KLICKBARE ANTWORTMÖGLICHKEITEN (<OPTIONS>) MITLIEFERN:
               - Fügen Sie am Ende JEDER Nachricht, in der Sie dem Benutzer eine Frage stellen (auch bei der Zusammenfassung zur Bestätigung am Schluss!), 3 bis 5 passende, kurze Schnell-Antwortmöglichkeiten im Tag <OPTIONS>...</OPTIONS> hinzu, getrennt durch das Pipe-Symbol "|".
               - WICHTIG: Verwenden Sie NIEMALS Platzhalter-Optionen wie "Anderer Anbieter" oder "Sonstiges" (dafür hat der Benutzer das freie Textfeld darunter!). Nennen Sie stattdessen immer konkrete, gängige Antworten!
               - Wenn Sie nach dem Hosting fragen, schlagen Sie IMMER "GitHub Pages" als erste Option vor:
                 <OPTIONS>GitHub Pages|Vercel / Netlify|Hetzner / Netcup|Nur lokal (Kein Online-Hosting)</OPTIONS>
               - Beispiel für die Bestätigungsfrage vor der Generierung:
                 Ich habe alle Angaben zusammen. Soll ich die Rechtstexte jetzt erstellen?
                 <OPTIONS>Ja, Rechtstexte jetzt erstellen|Ich möchte noch etwas ergänzen</OPTIONS>

            7. Wenn Sie alle notwendigen Informationen Schritt für Schritt gesammelt haben, fassen Sie diese kurz zusammen und fragen Sie den Benutzer (mit <OPTIONS>Ja, Rechtstexte jetzt erstellen|Noch etwas ändern</OPTIONS>), ob Sie das Dokument bzw. die Dokumente erstellen sollen.

            8. Nach der Bestätigung des Benutzers MUSS Ihre ALLERLETZTE Antwort NUR die generierten Texte im XML-Format enthalten (OHNE <OPTIONS>-Tag).
               WICHTIG: Sie MÜSSEN BEIDE XML-Tags (<IMPRESSUM_FINAL> und <DATENSCHUTZ_FINAL>) ausgeben, damit der Parser sie ausliest. Falls ein Dokument in dieser Runde nicht erstellt oder geändert wurde, befüllen Sie das Tag exakt mit dem Wort "KEEP_EXISTING" (um dem System zu signalisieren, dass der alte Wert bestehen bleiben soll).
               Nutzen Sie exakt das folgende Format:
            
            <IMPRESSUM_FINAL>
            [Hier der vollständige, professionell formatierte Impressum-Text, oder "KEEP_EXISTING"]
            </IMPRESSUM_FINAL>
            
            <DATENSCHUTZ_FINAL>
            [Hier der vollständige, professionell formatierte Datenschutzerklärung-Text, oder "KEEP_EXISTING"]
            </DATENSCHUTZ_FINAL>

            9. DATUMSANGABE / STAND DER RECHTSTEXTE:
               - Wenn Sie am Ende der Datenschutzerklärung oder des Impressums eine Datums- oder Standangabe setzen, verwenden Sie IMMER den aktuellen Monat und das aktuelle Jahr: „Stand: ${currentMonthYear}“. Niemals veraltete Jahreszahlen aus der Vergangenheit einsetzen!
        `;

        this.systemInstruction = systemInstruction;

        const thinkingConfig = this.getThinkingConfig();
        const chatConfig: any = {
            systemInstruction: this.systemInstruction,
        };
        if (thinkingConfig) {
            chatConfig.thinkingConfig = thinkingConfig;
        }

        this.chat = this.ai.chats.create({
            model: this.currentModel,
            config: chatConfig,
        });
    }

    public isFinalDocument(text: string): boolean {
        if (text.includes('<IMPRESSUM_FINAL>') || text.includes('<DATENSCHUTZ_FINAL>')) {
            return true;
        }

        // Fallback: KI hat den Text direkt als Markdown formatiert ausgegeben (ohne XML-Tags)
        const hasFullDatenschutz =
            (text.includes('# Datenschutzerklärung') || text.includes('**Datenschutzerklärung**') || text.includes('## 1. Verantwortlicher') || text.includes('Verantwortlicher im Sinne')) &&
            (text.includes('Rechte der betroffenen') || text.includes('Ihre Rechte') || text.includes('DSGVO')) &&
            text.length > 500;

        const hasFullImpressum =
            (text.includes('# Impressum') || text.includes('**Impressum**') || text.includes('Angaben gemäß § 5 DDG') || text.includes('Angaben gemäß § 5 TMG')) &&
            (text.includes('Kontakt') || text.includes('E-Mail:')) &&
            text.length > 250;

        if (this.documentMode === 'datenschutz' && hasFullDatenschutz) return true;
        if (this.documentMode === 'impressum' && hasFullImpressum) return true;
        if (this.documentMode === 'both' && (hasFullDatenschutz || hasFullImpressum)) return true;

        return false;
    }

    public extractDocuments(text: string): { impressum: string; datenschutzerklaerung: string } {
        const impressumMatch = text.match(/<IMPRESSUM_FINAL>([\s\S]*?)<\/IMPRESSUM_FINAL>/);
        const datenschutzMatch = text.match(/<DATENSCHUTZ_FINAL>([\s\S]*?)<\/DATENSCHUTZ_FINAL>/);

        let rawImpressum = impressumMatch ? impressumMatch[1].trim() : '';
        let rawDatenschutz = datenschutzMatch ? datenschutzMatch[1].trim() : '';

        // Falls die XML-Tags weggelassen wurden, aber der Text einen vollständigen Entwurf darstellt
        if (!rawImpressum && !rawDatenschutz) {
            if (this.documentMode === 'impressum') {
                rawImpressum = text.trim();
            } else if (this.documentMode === 'datenschutz') {
                rawDatenschutz = text.trim();
            } else {
                if (text.includes('Datenschutzerklärung') && text.includes('Impressum')) {
                    const dsIdx = text.search(/(?:#+|\*\*)\s*Datenschutzerklärung/i);
                    if (dsIdx > 0) {
                        rawImpressum = text.slice(0, dsIdx).trim();
                        rawDatenschutz = text.slice(dsIdx).trim();
                    } else {
                        rawDatenschutz = text.trim();
                    }
                } else if (text.includes('Datenschutzerklärung')) {
                    rawDatenschutz = text.trim();
                } else if (text.includes('Impressum')) {
                    rawImpressum = text.trim();
                }
            }
        }

        return {
            impressum: rawImpressum || 'KEEP_EXISTING',
            datenschutzerklaerung: rawDatenschutz || 'KEEP_EXISTING'
        };
    }

    private async executeWithFallback(action: () => Promise<any>): Promise<any> {
        try {
            return await action();
        } catch (err: any) {
            const raw = err?.message || String(err || '');
            const isUnavailableOrQuota =
                raw.includes('429') ||
                raw.includes('RESOURCE_EXHAUSTED') ||
                raw.includes('quota') ||
                raw.includes('no longer available') ||
                raw.includes('not found') ||
                raw.includes('limit: 20');

            if (isUnavailableOrQuota && this.currentModel !== 'gemini-3.5-flash-lite') {
                const oldModel = this.currentModel;
                console.warn(`Modell ${oldModel} nicht verfügbar oder Quota erreicht, wechsle automatisch auf Standard gemini-3.5-flash-lite...`);
                this.currentModel = 'gemini-3.5-flash-lite';
                this.onModelFallback?.('gemini-3.5-flash-lite', `Modell ${oldModel} ist nicht verfügbar oder Limit erreicht.`);
                this.chat = this.ai.chats.create({
                    model: 'gemini-3.5-flash-lite',
                    config: {
                        systemInstruction: this.systemInstruction,
                    },
                });
                return await action();
            }
            throw err;
        }
    }

    private getThinkingConfig() {
        if (this.currentModel.includes('flash-lite')) {
            return undefined;
        }
        const isGemini3 = this.currentModel.includes('3.') || this.currentModel.includes('3-') || this.currentModel.includes('gemini-3');
        return isGemini3
            ? { thinkingLevel: ThinkingLevel.LOW }
            : { thinkingBudget: 0 };
    }

    async startConversation(): Promise<string> {
        return await this.executeWithFallback(async () => {
            const response = await this.chat.sendMessage({
                message: "Bitte begrüßen Sie den Benutzer kurz, fassen Sie die erkannten Projektdaten prägnant zusammen und stellen Sie die erste Frage (mit klickbaren <OPTIONS> am Ende).",
                config: {
                    thinkingConfig: this.getThinkingConfig()
                }
            });
            return response.text || '';
        });
    }

    async sendMessage(message: string): Promise<string> {
        return await this.executeWithFallback(async () => {
            const response = await this.chat.sendMessage({
                message,
                config: {
                    thinkingConfig: this.getThinkingConfig()
                }
            });
            return response.text || '';
        });
    }
}