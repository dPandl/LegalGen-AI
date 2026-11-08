import { GoogleGenAI, Chat, ThinkingLevel } from "@google/genai";
import type { UserProfile } from '../types';
import { DDG_PARAGRAPH_5_TEXT, DSGVO_ART_13_TEXT } from '../constants';

export function formatGeminiError(err: any, currentModel?: string): string {
    const raw = err?.message || String(err || '');
    if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')) {
        const isDaily = raw.includes('limit: 20') || raw.includes('limit: 1500') || raw.includes('per day');
        
        if (currentModel === 'gemini-2.5-flash') {
            return 'Das Tageskontingent für „gemini-2.5-flash“ (nur 20 Anfragen pro Tag im Free-Tier) ist für heute aufgebraucht. Bitte stellen Sie in den App-Einstellungen auf „gemini-3.6-flash“ um oder nutzen Sie einen Key mit Abrechnung.';
        }
        
        if (isDaily || raw.includes('quota')) {
            return 'Das Tageskontingent für diesen Google AI Studio API-Key im kostenlosen Free-Tier ist für heute aufgebraucht (wird täglich um 09:00 Uhr MEZ zurückgesetzt). Tipp: In Google AI Studio (aistudio.google.com) können Sie unter „Get API key“ mit 1 Klick ein neues Projekt mit neuem kostenlosen API-Key erstellen (sofort wieder 1.500 freie Anfragen) oder Abrechnung (Pay-as-you-go) aktivieren.';
        }
        
        return 'Kurze Pause: Die Minutengrenze von Google AI Studio (maximal 15 Anfragen pro Minute im kostenlosen Free-Tier) wurde kurz erreicht. Bitte warten Sie 20–30 Sekunden und klicken Sie dann einfach noch einmal auf Senden.';
    }
    if (raw.includes('API_KEY_INVALID') || raw.includes('API key not valid')) {
        return 'Ungültiger Google Gemini API-Key. Bitte prüfen Sie den Key in den Einstellungen.';
    }
    if (raw.includes('no longer available') || raw.includes('not found')) {
        return 'Das gewählte Modell ist nicht mehr verfügbar. Die App wurde automatisch auf das aktuelle „gemini-3.6-flash“ umgestellt.';
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

function renderDetectedServicesLegalGuidance(detectedServices: string[]): string {
    if (!detectedServices || detectedServices.length === 0) {
        return `Auf unserer Web-App werden keine externen Drittanbieter-Tools, Schriftenserver (wie Google Fonts) oder APIs eingebunden. Alle Schriftarten und Programm-Dateien werden lokal ausgeliefert.`;
    }

    const lines: string[] = [];
    lines.push(`Wir binden in unserer Web-App folgende externe Dienste und Bibliotheken ein, um die technische Funktionalität, Sicherheit und eine einheitliche optische Gestaltung zu gewährleisten:`);

    for (const service of detectedServices) {
        const lower = service.toLowerCase();
        if (lower.includes('google fonts')) {
            lines.push(`
* **Google Web Fonts (via Google CDN):**
  - **Dienstanbieter:** Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland (Muttergesellschaft: Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA).
  - **Zweck und Funktionsweise:** Zur optisch ansprechenden, einheitlichen und performanten Darstellung von Schriftarten lädt der Webbrowser beim Aufruf dieser Web-App die benötigten Web-Fonts direkt von den Servern von Google (fonts.googleapis.com / fonts.gstatic.com). Hierbei erlangt Google Kenntnis über die IP-Adresse des anfragenden Geräts sowie technische Browserdaten.
  - **Rechtsgrundlage:** Berechtigtes Interesse gem. Art. 6 Abs. 1 lit. f DSGVO (ansprechende und einheitliche typografische Darstellung der Lern- bzw. Anwendungsinhalte).
  - **Datenübermittlung in die USA:** Google LLC ist unter dem **EU-U.S. Data Privacy Framework (DPF)** zertifiziert. Der Datentransfer stützt sich auf den Angemessenheitsbeschluss der Europäischen Kommission gem. Art. 45 DSGVO.
  - **Datenschutzerklärung von Google:** https://policies.google.com/privacy`);
        } else if (lower.includes('github pages')) {
            lines.push(`
* **GitHub Pages (Hosting & Server-Logfiles):**
  - **Dienstanbieter:** GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA (Mutterkonzern: Microsoft Corporation).
  - **Zweck:** Technische Bereitstellung der Webanwendung und Absicherung der Serverinfrastruktur.
  - **Erhobene Daten:** Server-Logfiles (IP-Adresse, Datum, Uhrzeit, abgerufene Seite, Browsertyp/-version).
  - **Rechtsgrundlage:** Berechtigtes Interesse gem. Art. 6 Abs. 1 lit. f DSGVO (technisch fehlerfreie und stabile Bereitstellung).
  - **Drittstaatentransfer:** GitHub, Inc. bzw. Microsoft Corporation ist nach dem EU-U.S. Data Privacy Framework (DPF) zertifiziert.`);
        } else if (lower.includes('tailwind')) {
            lines.push(`
* **Tailwind CSS CDN:**
  - **Dienstanbieter:** Tailwind Labs Inc. / Cloudflare Inc.
  - **Zweck:** Auslieferung des CSS-Frameworks über Content Delivery Network.
  - **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO.`);
        } else if (lower.includes('stripe')) {
            lines.push(`
* **Stripe (Zahlungsabwicklung):**
  - **Dienstanbieter:** Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland.
  - **Zweck & Rechtsgrundlage:** Abwicklung von Zahlungen gem. Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).`);
        } else if (lower.includes('paypal')) {
            lines.push(`
* **PayPal (Zahlungsabwicklung):**
  - **Dienstanbieter:** PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxemburg.
  - **Zweck & Rechtsgrundlage:** Zahlungsabwicklung gem. Art. 6 Abs. 1 lit. b DSGVO.`);
        } else if (lower.includes('sentry')) {
            lines.push(`
* **Sentry (Fehleranalyse):**
  - **Dienstanbieter:** Functional Software, Inc. dba Sentry, 45 Fremont Street, 8th Floor, San Francisco, CA 94105, USA.
  - **Zweck:** Technische Fehlerprotokollierung zur Stabilitätsverbesserung.
  - **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO, DPF-zertifiziert.`);
        } else if (lower.includes('youtube')) {
            lines.push(`
* **YouTube Video Embeds:**
  - **Dienstanbieter:** Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
  - **Zweck:** Einbettung und Abspielen von Videoinhalten im erweiterten Datenschutzmodus.
  - **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f bzw. lit. a DSGVO, DPF-zertifiziert.`);
        } else {
            lines.push(`
* **${service}:**
  - Darzustellen mit Dienstanbieter, Zweck der Einbindung, verarbeiteten Daten (z. B. IP-Adresse) und Rechtsgrundlage (Art. 6 Abs. 1 lit. f DSGVO) sowie Drittstaaten-Transfer (EU-U.S. Data Privacy Framework, falls US-Dienst).`);
        }
    }

    return lines.join('\n');
}

export class LegalGenChatService {
    private chat: Chat;
    private ai: GoogleGenAI;
    private systemInstruction: string;
    private currentModel: string;
    private projectName: string;
    private userProfile: UserProfile;
    private detectedServices: string[];
    private isCommercial?: boolean;
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
        this.projectName = projectName;
        this.userProfile = profile;
        this.detectedServices = detectedServices || [];
        this.isCommercial = isCommercial;
        this.onModelFallback = onModelFallback;
        this.ai = new GoogleGenAI({ apiKey: apiKey });
        // Nur gemini-3.6-flash und gemini-2.5-flash sind erlaubt
        const normalizedModel = (model === 'gemini-2.5-flash' || model === 'gemini-3.6-flash')
            ? model
            : 'gemini-3.6-flash';
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
            STRENGSTE SYSTEMREGEL – ROLLE & AUFGABE:
            Sie sind AUSSCHLIESSLICH ein deutscher KI-Rechtstexte-Generator zur Erstellung von IMPRESSUM (§ 5 DDG) und DATENSCHUTZERKLÄRUNG (Art. 13 DSGVO & TDDDG).
            Sie sind KEIN allgemeiner Assistent, KEIN Projektplaner, KEIN IT-Entwickler und KEIN Unternehmensberater!
            Fragen Sie NIEMALS nach Design, UX, Programmierung, Zeitplan, Budget, Prioritäten oder allgemeinen Projektzielen! Das ist absolut verboten!
            Jede einzelne Frage MUSS sich direkt und ausschließlich auf rechtliche Pflichtangaben für Impressum oder Datenschutzerklärung beziehen (z. B. Hosting-Provider, Kontaktformulare, Cookies/Tracking, Analysetools, Newsletter).

            VERBOTENE FORMATE & STRUKTUREN (STRENGSTENS UNTERSAGT):
            - Verwenden Sie NIEMALS die Überschrift oder den Abschnitt „Datenschutz auf einen Blick“!
            - Verwenden Sie NIEMALS die Überschrift „Allgemeine Hinweise und Pflichtinformationen“!
            - Verwenden Sie NIEMALS den Frage-Antwort-Block „Datenerfassung auf dieser Website“ („Wer ist verantwortlich?“, „Wie erfassen wir Ihre Daten?“, „Wofür nutzen wir Ihre Daten?“)!
            - Die Datenschutzerklärung MUSS ZWINGEND und AUSNAHMSLOS direkt mit „**1. Verantwortlicher im Sinne der Datenschutzgesetze**“ beginnen und exakt den 12 nummerierten Punkten folgen!

            STRIKTE QUALITÄTS- & STRUKTUR-VORGABEN FÜR DIE RECHTSTEXTE (EXAKTER 12-PUNKTE-GOLDSTANDARD):

            AUFBAU-BLUEPRINT FÜR DIE DATENSCHUTZERKLÄRUNG (Art. 13 DSGVO & TDDDG):
            Sie MÜSSEN die Datenschutzerklärung exakt nach folgendem bewährten 12-Punkte-Aufbau strukturieren:

            # Datenschutzerklärung

            **1. Verantwortlicher im Sinne der Datenschutzgesetze**
            ${profile.name || 'Pascal Pander'}
            ${profile.street || ''}
            ${profile.zipCode || ''} ${profile.city || ''}
            E-Mail: ${profile.email || ''}

            **2. Allgemeines zur Datenverarbeitung**
            Wir legen größten Wert auf den Schutz Ihrer Daten und die Wahrung Ihrer Privatsphäre. Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen Daten bei der Nutzung unseres Projekts bzw. unserer Web-App „${projectName}“ erhoben, verarbeitet und genutzt werden. Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen.
            Ihre Daten werden im Rahmen der gesetzlichen Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO), des Telekommunikation-Digitale-Dienste-Datenschutz-Gesetzes (TDDDG) und des Bundesdatenschutzgesetzes (BDSG), verarbeitet.

            **3. Hosting und Bereitstellung der Web-App**
            Unsere Web-App wird über GitHub Pages gehostet. Beim Aufruf unserer Web-App werden Daten (z. B. IP-Adresse, Zugriffszeit, aufgerufene URL, Browserinformationen) an den Hosting-Anbieter übermittelt und dort gespeichert, um die technische Bereitstellung der Web-App zu ermöglichen.
            * **Dienstanbieter:** GitHub, Inc. (eine Tochtergesellschaft der Microsoft Corporation), 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA (bzw. für Nutzer im EWR: GitHub B.V., Amsterdam, Niederlande).
            * **Zweck:** Bereitstellung der Web-App, Sicherstellung der technischen Funktionalität und Sicherheit.
            * **Rechtsgrundlage:** Unser berechtigtes Interesse an einer sicheren und effizienten Bereitstellung unserer Web-App (Art. 6 Abs. 1 lit. f DSGVO).
            * **Datenübermittlung in die USA:** GitHub Inc. bzw. Microsoft Corporation ist nach dem **EU-U.S. Data Privacy Framework (DPF)** zertifiziert, wofür ein Angemessenheitsbeschluss der EU-Kommission gem. Art. 45 DSGVO vorliegt. (Schreiben Sie niemals die veraltete Behauptung, die USA seien kein sicherer Drittstaat!).

            **4. SSL-/TLS-Verschlüsselung**
            Aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, die Sie an uns senden, nutzt unsere Web-App eine SSL- bzw. TLS-Verschlüsselung. Dies erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und an dem Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.

            **5. Erfassung allgemeiner Daten und Informationen (Server-Logfiles)**
            Bei jedem Aufruf unserer Web-App erfasst das System automatisiert Daten und Informationen vom Computersystem des aufrufenden Rechners (IP-Adresse des Nutzers, Datum und Uhrzeit des Zugriffs, Name und URL der abgerufenen Datei, Informationen über den Browsertyp und die verwendete Version, das Betriebssystem des Nutzers, Referrer URL).
            * **Zweck:** Die Speicherung in Logfiles dient der Sicherstellung der Funktionsfähigkeit der Web-App und zur Gewährleistung der Sicherheit unserer informationstechnischen Systeme. Eine Auswertung der Daten zu Marketingzwecken findet nicht statt.
            * **Rechtsgrundlage:** Berechtigtes Interesse gem. Art. 6 Abs. 1 lit. f DSGVO.
            * **Speicherdauer:** Die Daten verbleiben auf den Webservern des Hosters und werden gelöscht bzw. anonymisiert, sobald sie für den Zweck nicht mehr erforderlich sind.

            **6. Einsatz von Cookies und vergleichbaren Technologien (LocalStorage)**
            * **Art der Cookies:** Wir setzen keine Marketing-, Tracking- oder Profiling-Cookies ein.
            * **Einwilligungsfreiheit (§ 25 Abs. 2 TDDDG):** Soweit rein technisch notwendige Werte lokal im Speicher abgelegt werden (z. B. Einstellungen oder Lern-/Spielfortschritte im localStorage), ist dies gemäß § 25 Abs. 2 Nr. 2 TDDDG einwilligungsfrei zulässig, da es technisch unbedingt erforderlich ist, um den vom Nutzer ausdrücklich gewünschten Dienst bereitzustellen. Ein Cookie-Banner ist daher nicht implementiert.
            * **Rechtsgrundlage:** Berechtigtes Interesse gem. Art. 6 Abs. 1 lit. f DSGVO i.V.m. § 25 Abs. 2 TDDDG.

            **7. Externe Dienste, Bibliotheken und Inhalte**
            ${renderDetectedServicesLegalGuidance(detectedServices)}

            **8. Ihre Rechte als betroffene Person**
            Sie haben als betroffene Person nach der DSGVO folgende Rechte:
            * **Recht auf Auskunft (Art. 15 DSGVO)**
            * **Recht auf Berichtigung (Art. 16 DSGVO)**
            * **Recht auf Löschung („Recht auf Vergessenwerden“) (Art. 17 DSGVO)**
            * **Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)**
            * **Recht auf Datenübertragbarkeit (Art. 20 DSGVO)**
            * **Recht auf Widerspruch (Art. 21 DSGVO)**
            * **Recht auf Widerruf einer datenschutzrechtlichen Einwilligung (Art. 7 Abs. 3 DSGVO)**
            * **Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)**

            **9. Keine Verwendung von Kontaktformularen, Newsletter-Diensten oder Social Media Plugins**
            Auf unserer Web-App sind keine Kontaktformulare, Newsletter-Dienste oder Social Media Plugins (wie Facebook Like-Buttons) integriert. Dementsprechend werden über solche Funktionen keine personenbezogenen Daten erhoben oder verarbeitet.

            **10. Keine Verwendung von Tracking- oder Analyse-Software**
            Wir verwenden auf unserer Web-App keine Tracking- oder Analyse-Software wie Google Analytics oder Matomo. Es werden keine Daten zu Ihrem Nutzerverhalten erfasst.

            **11. Keine Verwendung von eingebetteten Videos (YouTube/Vimeo)**
            Es sind keine Videos von Plattformen wie YouTube oder Vimeo in unsere Web-App eingebettet.

            **12. Änderungen dieser Datenschutzerklärung**
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht.

            **Stand:** ${currentMonthYear}

            AUFBAU-BLUEPRINT FÜR DAS IMPRESSUM (§ 5 DDG):
            # Impressum

            ## Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)
            ${profile.name || 'Pascal Pander'}
            ${profile.street || ''}
            ${profile.zipCode || ''} ${profile.city || ''}

            ## Kontakt
            E-Mail: ${profile.email || ''}
            ${profile.phone ? `Telefon: ${profile.phone}` : ''}

            ${profile.entityType === 'company' && profile.representative ? `## Vertreten durch:\n${profile.representative}\n` : ''}
            ${profile.ustId ? `## Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:\n${profile.ustId}\n` : ''}
            ${isCommercial !== false ? `## Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:\n${profile.name || ''}\n${profile.street || ''}\n${profile.zipCode || ''} ${profile.city || ''}\n` : ''}

            STRIKTE REGEL FÜR DATENSPARSAME TOOLS & STATISCHE SEITEN (KEIN BACKEND / KEIN TRACKING):
            Wenn die Web-App rein clientseitig ohne eigenes Backend, ohne Nutzerkonten und ohne Marketing-Tracking betrieben wird:
            - VERBOTEN: Schreiben Sie NIEMALS falsche Standard-Floskeln wie:
              ❌ „Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben“
              ❌ „Speicherdauer: Ihre personenbezogenen Daten verbleiben bei uns, bis der Zweck entfällt“
              ❌ „Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich“
              Das ist bei datensparsamen Tools sachlich falsch, irreführend und unprofessionell!
            - SCHREIBEN SIE DIE ECHTE REALITÄT:
              1. Der Betreiber selbst erhebt, speichert und verarbeitet KEINERLEI personenbezogene Daten von Nutzern (weder Namen, noch Nutzungsdaten oder Telemetrie). Es gibt keine Benutzerkonten, keine Registrierung und keine Cookies.
              2. Technische Bereitstellung / Hosting: Beim technischen Abruf der Seite verarbeitet ausschließlich der Webserver des Hosters (z. B. GitHub Pages) automatisch Server-Logfiles (IP-Adresse, Datum, Uhrzeit, Browser), um die Seite technisch fehlerfrei auszuliefern (Art. 6 Abs. 1 lit. f DSGVO). Der Betreiber dieser Seite speichert diese Daten nicht selbst.
              3. ZWINGENDE PFLICHT FÜR IM QUELLCODE ERFASSTE DIENSTE (WICHTIG):
                 WURDEN IM QUELLCODE EXTERNE RESSOURCEN ERKANNT (wie z. B. „Google Fonts (via CDN)“, APIs oder externe CDNs), DÜRFEN DIESE NIEMALS VERSCHWIEGEN ODER WEGGELASSEN WERDEN!
                 Sie MÜSSEN zwingend unter Punkt 7 („Externe Dienste, Bibliotheken und Inhalte“) mit Anbieter, Zweck, Datenübertragung (IP-Adresse) und Rechtsgrundlage (Art. 6 Abs. 1 lit. f DSGVO) sowie DPF-Zertifizierung vollständig aufgeführt werden!
              4. Lokale Speicherung: Soweit Spielfortschritte oder Einstellungen im localStorage abgelegt werden, erfolgt dies rein lokal auf dem Endgerät auf Grundlage von § 25 Abs. 2 Nr. 2 TDDDG (technisch erforderlich für die vom Nutzer gewünschte Funktion) und erfordert kein Cookie-Banner.

            VERBOT VON PLATZHALTER- & DOPPEL-ABFRAGEN (STAMMDATEN & NUTZUNGSTYP FEST VORGEGEBEN):
            - Der Nutzungstyp des Projekts steht bereits unumstößlich fest: ${isCommercial !== false ? 'Kommerziell / Gewerblich' : 'Rein privat / hobbymäßig (komplett gratis)'}!
            - Fragen Sie den Benutzer NIEMALS: "Wird das Projekt rein privat betrieben oder hat es einen geschäftlichen/gewerblichen Hintergrund?" oder ähnliches! Das ist bereits fest im Projekt hinterlegt und absolut tabu als Frage!
            - Wenn der Benutzer Name, Anschrift, E-Mail etc. im Profil hinterlegt hat, MÜSSEN Sie diese echten Daten DIREKT und automatisch für Impressum und Datenschutzerklärung einsetzen!
            - Fragen Sie den Benutzer NIEMALS: "Wie möchten Sie die persönlichen Angaben einfügen?" oder "Sollen Standard-Platzhalter verwendet werden?".
            - Bieten Sie NIEMALS Optionen an wie "Standard-Platzhalter verwenden (z. B. [Max Mustermann])"!
            - Verwenden Sie in den finalen Rechtstexten NIEMALS Platzhalter in eckigen Klammern wie [Name], [Adresse] oder [Max Mustermann], wenn diese Daten im Profil vorhanden sind!

            Fokus dieses Gesprächs: ${modeInstruction}

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

            3. WICHTIG – QUELLCODE-ANALYSE & STAMMDATEN DIREKT NUTZEN (FRAGEN MINIMIEREN!):
               - Alle Angaben, die im Benutzerprofil stehen (Name: ${profile.name || 'Nicht angegeben'}, Anschrift: ${profile.street || ''} ${profile.zipCode || ''} ${profile.city || ''}, E-Mail: ${profile.email || ''}), sowie der Nutzungstyp (${isCommercial !== false ? 'Kommerziell / Gewerblich' : 'Rein privat / hobbymäßig (gratis)'}) sind bereits vollständig bekannt und MÜSSEN direkt in die Rechtstexte übernommen werden!
               - Fragen Sie NIEMALS nach diesen Daten, NIEMALS nach privat vs. gewerblich und fragen Sie NIEMALS nach Platzhaltern!
               - Sobald der Hosting-Anbieter geklärt ist (oder wenn es rein lokal läuft), liegen ALLE notwendigen Fakten vor! Stellen Sie dann GAR KEINE weiteren Rückfragen mehr, sondern fassen Sie die Daten kurz zusammen und fragen Sie direkt: "Ich habe alle notwendigen Angaben. Soll ich die Rechtstexte jetzt erstellen?" (<OPTIONS>Ja, Rechtstexte jetzt erstellen|Ich möchte noch etwas ändern</OPTIONS>)!
            
            4. Berücksichtigen Sie den Projekttyp (${projectTypes.length > 0 ? projectTypes.join(', ') : 'Webseite'}): 
               - Wenn es sich um eine Mobile App, Desktop-Software oder ein SaaS handelt, passen Sie Ihre Entwürfe automatisch an die aus dem Code erkannten Merkmale an (z. B. lokale Speicherung via localStorage/keytar, direkte API-Aufrufe vom Client, App-Store-/Download-Bereitstellung).
            
            5. DIALOG-REGEL (EFFIZIENT, HILFSBEREIT & KEINE KÜNSTLICHEN FRAGEN):
               - Stellen Sie NIEMALS Fragen zu Angaben, die bereits feststehen (Name, Anschrift, E-Mail, privat vs. gewerblich, aus dem Quellcode erkannte Dienste).
               - Wenn tatsächlich noch eine technische Pflichtangabe fehlt (z. B. Hosting-Provider, falls im Code nicht auffindbar), stellen Sie HÖCHSTENS EINE einzige, kurze Frage.
               - Sobald alle Angaben vorliegen, stellen Sie KEINE weiteren Fragen mehr, sondern fassen Sie kurz zusammen und bieten Sie direkt die Erstellung an (<OPTIONS>Ja, Rechtstexte jetzt erstellen|Ich möchte noch etwas ändern</OPTIONS>)!
               - Wenn der Benutzer selbst eine Rückfrage hat oder Änderungen wünscht (z. B. „Erkläre mir das“, „Ich speichere keine Daten“, „Pass das Hosting an“): Antworten Sie sofort fachlich präzise, passen Sie die Entwürfe exakt an und bleiben Sie flexibel!

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

        this.chat = this.ai.chats.create({
            model: this.currentModel,
            config: this.getChatConfig(),
        });
    }

    public isFinalDocument(text: string): boolean {
        if (!text || text.trim().length === 0) return false;

        if (/<IMPRESSUM_FINAL>/i.test(text) || /<DATENSCHUTZ_FINAL>/i.test(text)) {
            return true;
        }

        // Fallback: KI hat den Text direkt als Markdown formatiert ausgegeben (ohne XML-Tags)
        const hasFullDatenschutz =
            (text.includes('Datenschutzerklärung') || text.includes('Verantwortlicher im Sinne') || text.includes('verantwortliche Stelle')) &&
            (text.includes('DSGVO') || text.includes('Datenschutz')) &&
            (text.includes('Auskunft') || text.includes('Löschung') || text.includes('Rechte') || text.includes('Hosting') || text.includes('Server')) &&
            text.length > 350;

        const hasFullImpressum =
            (text.includes('Impressum') || text.includes('Angaben gemäß § 5') || text.includes('§ 5 DDG') || text.includes('§ 5 TMG')) &&
            (text.includes('Kontakt') || text.includes('E-Mail') || text.includes('Verantwortlich')) &&
            text.length > 200;

        if (this.documentMode === 'datenschutz' && hasFullDatenschutz) return true;
        if (this.documentMode === 'impressum' && hasFullImpressum) return true;
        if (this.documentMode === 'both' && (hasFullDatenschutz || hasFullImpressum)) return true;

        return false;
    }

    public extractDocuments(text: string): { impressum: string; datenschutzerklaerung: string } {
        const impressumMatch = text.match(/<IMPRESSUM_FINAL>([\s\S]*?)<\/IMPRESSUM_FINAL>/i);
        const datenschutzMatch = text.match(/<DATENSCHUTZ_FINAL>([\s\S]*?)<\/DATENSCHUTZ_FINAL>/i);

        let rawImpressum = impressumMatch ? impressumMatch[1].trim() : '';
        let rawDatenschutz = datenschutzMatch ? datenschutzMatch[1].trim() : '';

        // Falls die XML-Tags weggelassen wurden, aber der Text einen vollständigen Entwurf darstellt
        if (!rawImpressum && !rawDatenschutz) {
            // Bereinige eventuelle <OPTIONS>-Tags am Ende
            const cleanText = text.replace(/<OPTIONS>[\s\S]*?<\/OPTIONS>/gi, '').trim();

            if (this.documentMode === 'impressum') {
                rawImpressum = cleanText;
            } else if (this.documentMode === 'datenschutz') {
                rawDatenschutz = cleanText;
            } else {
                if (cleanText.includes('Datenschutzerklärung') && cleanText.includes('Impressum')) {
                    const dsIdx = cleanText.search(/(?:#+|\*\*)\s*Datenschutzerklärung/i);
                    if (dsIdx > 0) {
                        rawImpressum = cleanText.slice(0, dsIdx).trim();
                        rawDatenschutz = cleanText.slice(dsIdx).trim();
                    } else {
                        rawDatenschutz = cleanText;
                    }
                } else if (cleanText.includes('Datenschutzerklärung')) {
                    rawDatenschutz = cleanText;
                } else if (cleanText.includes('Impressum')) {
                    rawImpressum = cleanText;
                }
            }
        }

        return {
            impressum: rawImpressum || 'KEEP_EXISTING',
            datenschutzerklaerung: rawDatenschutz || 'KEEP_EXISTING'
        };
    }

    public getCurrentModel(): string {
        return this.currentModel;
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

            if (isUnavailableOrQuota && this.currentModel !== 'gemini-3.6-flash') {
                const oldModel = this.currentModel;
                console.warn(`Modell ${oldModel} nicht verfügbar oder Quota erreicht, wechsle automatisch auf Standard gemini-3.6-flash...`);
                this.currentModel = 'gemini-3.6-flash';
                this.onModelFallback?.('gemini-3.6-flash', `Tageslimit für ${oldModel} erreicht. Automatisch auf gemini-3.6-flash umgestellt.`);
                this.chat = this.ai.chats.create({
                    model: 'gemini-3.6-flash',
                    config: this.getChatConfig(),
                });
                return await action();
            }

            // Automatischer Backoff & Retry bei kurzzeitigem 15-RPM-Minutenlimit auf gemini-3.6-flash:
            if (isUnavailableOrQuota) {
                const isDaily = raw.includes('limit: 20') || raw.includes('limit: 1500') || raw.includes('per day');
                if (!isDaily) {
                    console.warn('Kurzzeitiges Minuten-Limit (15 RPM) von Google AI Studio erreicht. Warte 3,5 Sekunden und versuche es automatisch erneut...');
                    await new Promise(resolve => setTimeout(resolve, 3500));
                    try {
                        return await action();
                    } catch (retryErr: any) {
                        console.error('Wiederholungsversuch nach Pause ebenfalls fehlgeschlagen:', retryErr);
                        throw retryErr;
                    }
                }
            }

            throw err;
        }
    }

    private getThinkingConfig() {
        if (this.currentModel === 'gemini-2.5-flash') {
            return { thinkingBudget: 0 };
        }
        return { thinkingLevel: ThinkingLevel.MINIMAL, includeThoughts: false };
    }

    private getChatConfig(): any {
        const config: any = {
            systemInstruction: this.systemInstruction,
            maxOutputTokens: 8192,
        };
        const thinkingConfig = this.getThinkingConfig();
        if (thinkingConfig) {
            config.thinkingConfig = thinkingConfig;
        }
        return config;
    }

    private extractResponseText(response: any): string {
        let text = response?.text || '';
        if (!text && response?.candidates?.[0]?.content?.parts) {
            const parts = response.candidates[0].content.parts;
            // 1. Zuerst reguläre Text-Parts (ohne Gedankenprozess) filtern
            const cleanParts = parts
                .filter((p: any) => !p.thought && typeof p.text === 'string')
                .map((p: any) => p.text)
                .join('');
            if (cleanParts.trim()) {
                text = cleanParts;
            } else {
                // 2. Fallback: Alle Textteile sammeln
                const allParts = parts
                    .filter((p: any) => typeof p.text === 'string')
                    .map((p: any) => p.text)
                    .join('');
                if (allParts.trim()) {
                    text = allParts;
                }
            }
        }

        const trimmed = (text || '').trim();
        if (!trimmed) {
            const candidate = response?.candidates?.[0];
            const finishReason = candidate?.finishReason || 'UNBEKANNT';
            console.error('Gemini lieferte leere Textantwort. Response-Objekt:', response);
            if (finishReason === 'SAFETY') {
                throw new Error('Die Generierung wurde durch Googles Sicherheitsfilter blockiert. Bitte prüfen Sie die Eingaben.');
            } else if (finishReason === 'MAX_TOKENS') {
                throw new Error('Das maximale Ausgabe-Limit (Token-Limit) wurde erreicht. Bitte versuchen Sie es erneut.');
            }
            throw new Error(`Die KI hat keine Textantwort zurückgegeben (Finish-Reason: ${finishReason}). Bitte versuchen Sie es erneut.`);
        }

        return trimmed;
    }

    async startConversation(): Promise<string> {
        return await this.executeWithFallback(async () => {
            const hasProfileData = Boolean(this.userProfile?.name && this.userProfile?.email);
            const detectedServicesInfo = this.detectedServices.length > 0
                ? `- Im Quellcode erkannte genutzte Dienste: ${this.detectedServices.join(', ')}. Diese stehen bereits fest und fließen zwingend in die Rechtstexte ein!`
                : '- Keine externen Drittanbieter-Tools im Quellcode erkannt.';

            const prompt = `Starten Sie jetzt die Rechtstexte-Erstellung (Impressum und/oder Datenschutzerklärung) für das Projekt „${this.projectName}“.
1. Begrüßen Sie den Benutzer in 1-2 kurzen Sätzen und fassen Sie stichpunktartig zusammen, welche technischen Fakten (Projekttyp, erkannte Dienste: ${this.detectedServices.join(', ') || 'Keine'}, Profilangaben) Sie für die Rechtstexte bereits vorliegen haben.
${hasProfileData ? `- Nennen Sie die Stammdaten des Benutzers (${this.userProfile.name}, ${this.userProfile.city || ''}, ${this.userProfile.email}) als bereits bekannt!` : ''}
${detectedServicesInfo}
2. Stellen Sie genau EINE einzige, konkrete juristische Frage zu noch fehlenden Angaben (z. B. Hosting-Provider wie GitHub Pages oder Vercel, falls noch unbekannt). Falls bereits alle Angaben für die Rechtstexte vorliegen, fragen Sie direkt, ob Sie das Dokument jetzt generieren sollen.
3. Fügen Sie am Ende IMMER 3 bis 4 klickbare Optionen im Format <OPTIONS>Option 1|Option 2|Option 3</OPTIONS> an (zwingend mit Pipe-Symbol | getrennt!).
4. STRENGES VERBOT: Fragen Sie NIEMALS nach Name, Adresse, E-Mail, privat vs. gewerblich oder Platzhaltern!`;

            const response = await this.chat.sendMessage({
                message: prompt,
                config: this.getChatConfig()
            });
            return this.extractResponseText(response);
        });
    }

    async sendMessage(message: string): Promise<string> {
        return await this.executeWithFallback(async () => {
            const detectedServicesSummary = this.detectedServices.length > 0
                ? `Im Quellcode erkannte Dienste: [${this.detectedServices.join(', ')}]. DIESE DIENSTE MÜSSEN ZWINGEND VOLLSTÄNDIG in der Datenschutzerklärung unter Punkt 7 mit Anbieter, Zweck, Rechtsgrundlage (Art. 6 Abs. 1 lit. f DSGVO) und DPF-Status aufgeführt werden! Verschweigen Sie NIEMALS Google Fonts oder andere im Quellcode erkannte Dienste!`
                : `Keine externen Drittanbieter-Tools im Quellcode erkannt. Schriften und Assets werden lokal ausgeliefert.`;

            const isConfirmation = /ja|erstellen|generieren|jetzt|fertig/i.test(message);
            let finalDirective = '';
            if (isConfirmation) {
                if (this.documentMode === 'impressum') {
                    finalDirective = `\n\n[WICHTIGE ANWEISUNG: Der Benutzer hat die finale Erstellung bestätigt. Geben Sie JETZT DIREKT und AUSSCHLIESSLICH das vollständige Impressum im XML-Tag <IMPRESSUM_FINAL>...</IMPRESSUM_FINAL> aus und setzen Sie <DATENSCHUTZ_FINAL>KEEP_EXISTING</DATENSCHUTZ_FINAL>. Keine weiteren Fragen oder Optionen!]`;
                } else if (this.documentMode === 'datenschutz') {
                    finalDirective = `\n\n[WICHTIGE ANWEISUNG: Der Benutzer hat die finale Erstellung bestätigt. Geben Sie JETZT DIREKT und AUSSCHLIESSLICH die vollständige Datenschutzerklärung im XML-Tag <DATENSCHUTZ_FINAL>...</DATENSCHUTZ_FINAL> aus und setzen Sie <IMPRESSUM_FINAL>KEEP_EXISTING</IMPRESSUM_FINAL>. Keine weiteren Fragen oder Optionen!]`;
                } else {
                    finalDirective = `\n\n[WICHTIGE ANWEISUNG: Der Benutzer hat die finale Erstellung bestätigt. Geben Sie JETZT DIREKT und AUSSCHLIESSLICH BEIDE vollständigen finalen Rechtstexte in den XML-Tags <IMPRESSUM_FINAL>...</IMPRESSUM_FINAL> und <DATENSCHUTZ_FINAL>...</DATENSCHUTZ_FINAL> aus. Keine weiteren Fragen oder Optionen!]`;
                }
            }

            const profileReminder = `\n\n[SYSTEM-REMINDER AN DAS MODELL:
1. Profil-Stammdaten: Name="${this.userProfile?.name || 'Pascal Pander'}", Anschrift="${this.userProfile?.street || ''}, ${this.userProfile?.zipCode || ''} ${this.userProfile?.city || ''}", E-Mail="${this.userProfile?.email || ''}". Nutzungstyp=${this.isCommercial !== false ? 'Kommerziell' : 'Gratis/Privat'}.
2. PFLICHT-VORGABEN FÜR DIE DATENSCHUTZERKLÄRUNG:
- ${detectedServicesSummary}
- Soweit rein technisch notwendige Werte lokal im Speicher abgelegt werden (z. B. Einstellungen im localStorage), erfolgt dies auf Grundlage von § 25 Abs. 2 Nr. 2 TDDDG (kein Cookie-Banner nötig).
- Behaupten Sie NIEMALS: „USA ist kein sicherer Drittstaat“ (das EU-U.S. Data Privacy Framework gilt für zertifizierte US-Dienste wie Google oder GitHub!).
- Verwenden Sie NIEMALS die verbotenen Überschriften „Datenschutz auf einen Blick“ oder „Allgemeine Hinweise und Pflichtinformationen“! Beginnen Sie die Datenschutzerklärung DIREKT mit „**1. Verantwortlicher im Sinne der Datenschutzgesetze**“ und folgen Sie exakt dem 12-Punkte-Aufbau!
3. Wenn der Entwurf fertig ist oder der Benutzer die Erstellung wünscht, geben Sie die finalen Dokumente in den XML-Tags aus:
<IMPRESSUM_FINAL>
[Vollständiges Impressum nach § 5 DDG]
</IMPRESSUM_FINAL>

<DATENSCHUTZ_FINAL>
[Vollständige Datenschutzerklärung mit allen Pflichtklauseln inklusive der erkannten Dienste]
</DATENSCHUTZ_FINAL>]`;

            const promptMessage = `${message}${finalDirective}${profileReminder}`;

            const response = await this.chat.sendMessage({
                message: promptMessage,
                config: this.getChatConfig()
            });
            return this.extractResponseText(response);
        });
    }
}