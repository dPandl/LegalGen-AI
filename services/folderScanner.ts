// @legalgen-ignore-scan
export interface ScanResult {
    folderPath: string;
    name: string;
    detectedServices: string[];
    codeAnalysisSummary: string;
    iconDataUrl?: string;
    homepageUrl?: string;
    inferredProjectTypes?: string[];
    inferredIsCommercial?: boolean;
    detectedImpressum?: string;
    detectedDatenschutz?: string;
}

const IGNORED_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', 'dist-electron', '.next', '.nuxt', 'out',
    'target', 'bin', 'obj', 'venv', 'env', '.env', 'tmp', 'cache'
]);

const ALLOWED_EXTENSIONS = new Set([
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.cjs', '.mjs', '.vue', '.svelte', '.py', '.dart', '.md', '.txt'
]);

const DEP_CHECKERS: Record<string, string> = {
    'firebase': 'Firebase (Google)',
    'supabase': 'Supabase',
    'aws-sdk': 'AWS (Amazon Web Services)',
    '@aws-sdk': 'AWS (Amazon Web Services)',
    'stripe': 'Stripe (Zahlungsabwicklung)',
    'paypal': 'PayPal (Zahlungsabwicklung)',
    'klarna': 'Klarna (Zahlungsabwicklung)',
    'revenuecat': 'RevenueCat (In-App-Käufe)',
    'mixpanel': 'Mixpanel Analytics',
    'posthog': 'PostHog Analytics',
    'hotjar': 'Hotjar Analytics',
    'plausible': 'Plausible Analytics',
    'umami': 'Umami Analytics',
    'matomo': 'Matomo Analytics',
    'sentry': 'Sentry (Fehleranalyse)',
    'logrocket': 'LogRocket Tracker',
    'datadog': 'Datadog Tracker',
    'auth0': 'Auth0 Authentication',
    'clerk': 'Clerk Authentication',
    'next-auth': 'NextAuth / Auth.js',
    'mailchimp': 'Mailchimp (Newsletter)',
    'sendgrid': 'SendGrid (E-Mail)',
    'resend': 'Resend (E-Mail-Versand)',
    'nodemailer': 'E-Mail-Versand (SMTP / Nodemailer)',
    'hubspot': 'HubSpot Integration',
    'intercom': 'Intercom (Kunden-Chat)',
    'crisp': 'Crisp (Kunden-Chat)',
    'google-analytics': 'Google Analytics',
    'react-ga': 'Google Analytics',
    '@google/genai': 'Google Gemini KI-API',
    '@google/generative-ai': 'Google Gemini KI-API',
    'openai': 'OpenAI KI-API',
    '@anthropic-ai': 'Anthropic Claude KI-API',
    'mapbox': 'Mapbox (Kartendienst)',
    'leaflet': 'Leaflet / OpenStreetMap (Kartendienst)',
    'recaptcha': 'Google reCAPTCHA',
    'hcaptcha': 'hCaptcha',
    'turnstile': 'Cloudflare Turnstile (Captcha)',
    '@vercel/analytics': 'Vercel Analytics',
    '@vercel/speed-insights': 'Vercel Speed Insights',
    'appwrite': 'Appwrite Backend',
    'pocketbase': 'PocketBase Backend',
    'onesignal': 'OneSignal (Push-Benachrichtigungen)',
    'keytar': 'Lokaler System-Schlüsselspeicher (keytar)',
    'better-sqlite3': 'Lokale SQLite-Datenbank',
    'sqlite3': 'Lokale SQLite-Datenbank',
    'prisma': 'Prisma Datenbank-ORM',
    'mongoose': 'MongoDB Datenbank',
    'react-cookie-consent': 'Cookie-Banner (react-cookie-consent)',
    'vanilla-cookieconsent': 'Cookie-Banner (vanilla-cookieconsent)',
    'cookieconsent': 'Cookie-Banner (CookieConsent)',
    'klaro': 'Cookie-Banner (Klaro! Consent Manager)',
    'tarteaucitron': 'Cookie-Banner (tarteaucitron.js)',
    'usercentrics': 'Cookie-Banner (Usercentrics CMP)',
    'cookiebot': 'Cookie-Banner (Cookiebot CMP)',
    'onetrust': 'Cookie-Banner (OneTrust CMP)',
    'borlabs': 'Cookie-Banner (Borlabs Cookie)',
    'complianz': 'Cookie-Banner (Complianz CMP)',
    'iubenda': 'Cookie-Banner (iubenda CMP)',
    'cookieyes': 'Cookie-Banner (CookieYes CMP)'
};

const CONSENT_REQUIRING_KEYWORDS = [
    'Google Analytics',
    'Facebook Pixel',
    'Meta Pixel',
    'Mixpanel',
    'PostHog',
    'Hotjar',
    'Matomo',
    'LogRocket',
    'Datadog',
    'Google Maps',
    'Mapbox',
    'YouTube Video Embeds',
    'Vimeo Video Embeds',
    'Google AdMob',
    'HubSpot',
    'Intercom',
    'Crisp',
    'OneSignal'
];

export interface CookieBannerEvaluation {
    status: 'implemented' | 'missing_warning' | 'not_required' | 'unknown';
    detectedTools: string[];
    consentRequiringServices: string[];
    shortLabel: string;
    detailText: string;
}

export function evaluateCookieBannerStatus(
    projectPath?: string,
    detectedServices: string[] = [],
    codeAnalysisSummary?: string
): CookieBannerEvaluation {
    if (!projectPath && (!detectedServices || detectedServices.length === 0) && !codeAnalysisSummary) {
        return {
            status: 'unknown',
            detectedTools: [],
            consentRequiringServices: [],
            shortLabel: 'Nicht geprüft',
            detailText: 'Verknüpfen Sie einen lokalen Projekt-Ordner, um automatisch auf ein Cookie-Banner zu prüfen.'
        };
    }

    const detectedTools = detectedServices.filter(s =>
        /cookie-banner|consent|cookiebot|usercentrics|onetrust|borlabs|complianz|iubenda|cookieyes|klaro|tarteaucitron/i.test(s)
    );
    const hasCustomBannerInSummary = Boolean(
        codeAnalysisSummary && /Cookie-Banner\s*\/\s*Consent-Dialog\s*im\s*Code\s*erkannt/i.test(codeAnalysisSummary)
    );
    if (hasCustomBannerInSummary && detectedTools.length === 0) {
        detectedTools.push('Eigenes Cookie-Banner / Consent-Dialog');
    }

    const consentRequiringServices = detectedServices.filter(s =>
        CONSENT_REQUIRING_KEYWORDS.some(kw => s.toLowerCase().includes(kw.toLowerCase()))
    );
    const setsDocumentCookie = Boolean(
        codeAnalysisSummary && codeAnalysisSummary.includes('document.cookie')
    );

    if (detectedTools.length > 0) {
        const isOptionalBanner = consentRequiringServices.length === 0 && !setsDocumentCookie;
        return {
            status: 'implemented',
            detectedTools,
            consentRequiringServices,
            shortLabel: isOptionalBanner ? 'Cookie-Banner verbaut (rechtlich optional)' : 'Cookie-Banner erkannt',
            detailText: isOptionalBanner
                ? `Erkannt: ${detectedTools.join(', ')}. Hinweis: Da in diesem Projekt keine Tracking- oder Marketing-Dienste erkannt wurden, sondern nur lokaler App-Speicher (localStorage / IndexedDB / Service Worker), wäre nach § 25 Abs. 2 Nr. 2 TDDDG rechtlich gar kein Cookie-Banner nötig (Erwähnung in der Datenschutzerklärung reicht aus).`
                : `Erkannt: ${detectedTools.join(', ')}. Die Einwilligungsabfrage nach § 25 TDDDG / Art. 6 Abs. 1 lit. a DSGVO wird in der Datenschutzerklärung berücksichtigt.`
        };
    }

    if (consentRequiringServices.length > 0 || setsDocumentCookie) {
        const reasonList = consentRequiringServices.length > 0
            ? consentRequiringServices.join(', ')
            : 'document.cookie (JavaScript-Cookies)';
        return {
            status: 'missing_warning',
            detectedTools: [],
            consentRequiringServices,
            shortLabel: 'Cookie-Banner fehlt!',
            detailText: `Im Code wurden einwilligungspflichtige Dienste/Cookies erkannt (${reasonList}), aber kein Cookie-Banner (§ 25 Abs. 1 TDDDG) gefunden.`
        };
    }

    return {
        status: 'not_required',
        detectedTools: [],
        consentRequiringServices: [],
        shortLabel: 'Kein Cookie-Banner nötig',
        detailText: 'Kein Cookie-Banner im Code gefunden – da keine Tracking- oder Marketing-Dienste erkannt wurden, ist nach § 25 Abs. 2 TDDDG i.d.R. auch keines erforderlich.'
    };
}

const CONFIG_CHECKERS = [
    { file: 'vercel.json', label: 'Vercel Hosting' },
    { file: 'netlify.toml', label: 'Netlify Hosting' },
    { file: 'firebase.json', label: 'Firebase Hosting / Services' },
    { file: 'wrangler.toml', label: 'Cloudflare Pages / Workers' },
    { file: 'fly.toml', label: 'Fly.io Hosting' },
    { file: 'railway.json', label: 'Railway Hosting' },
    { file: 'Dockerfile', label: 'Docker Container Deployment' },
    { file: 'capacitor.config.json', label: 'Capacitor Mobile App' },
    { file: 'capacitor.config.ts', label: 'Capacitor Mobile App' },
    { file: 'app.json', label: 'React Native / Expo Konfiguration' }
];

interface VirtualFile {
    relativePath: string; // e.g. "package.json" or "src/App.tsx" (normalized with '/')
    name: string;
    size: number;
    getText: () => Promise<string>;
    getDataUrl?: () => Promise<string>;
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
        if (file.type === 'image/svg+xml' || file.name.endsWith('.svg') || file.size < 15 * 1024) {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const rawUrl = String(reader.result || '');
            if (!rawUrl || typeof window === 'undefined') {
                resolve(rawUrl);
                return;
            }
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const maxDim = 80;
                    let width = img.width || maxDim;
                    let height = img.height || maxDim;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/png', 0.85));
                        return;
                    }
                } catch {}
                resolve(rawUrl.length > 50000 ? '' : rawUrl);
            };
            img.onerror = () => resolve('');
            img.src = rawUrl;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
    });
}

const ICON_CANDIDATE_PATHS = [
    'public/icon.png',
    'public/icon.svg',
    'public/logo.png',
    'public/logo.svg',
    'public/apple-touch-icon.png',
    'public/favicon.png',
    'public/favicon.svg',
    'public/favicon.ico',
    'icon.png',
    'icon.svg',
    'logo.png',
    'logo.svg',
    'apple-touch-icon.png',
    'favicon.png',
    'favicon.svg',
    'favicon.ico',
    'src/assets/icon.png',
    'src/assets/icon.svg',
    'src/assets/logo.png',
    'src/assets/logo.svg',
    'assets/icon.png',
    'assets/icon.svg',
    'assets/logo.png',
    'assets/logo.svg',
    'app/icon.png',
    'app/favicon.ico',
    'resources/icon.png',
    'electron/icon.png'
];

function htmlToMarkdown(html: string): string {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let str = bodyMatch ? bodyMatch[1] : html;

    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    str = str.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    str = str.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
    str = str.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
    str = str.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
    str = str.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');

    str = str.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
    str = str.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

    str = str.replace(/<br\s*\/?>/gi, '\n');
    str = str.replace(/<\/p>/gi, '\n\n');
    str = str.replace(/<p[^>]*>/gi, '');
    str = str.replace(/<\/li>/gi, '\n');
    str = str.replace(/<li[^>]*>/gi, '- ');

    str = str.replace(/<[^>]+>/g, '');

    str = str
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&sect;/g, '§');

    return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function cleanJsxToMarkdown(jsx: string): string {
    let str = jsx.replace(/<[A-Za-z0-9_]+(?:\s+[^>]*?)?>/g, (tag) => {
        const tagNameMatch = tag.match(/<([A-Za-z0-9_]+)/);
        const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
        if (tagName === 'h1') return '\n# ';
        if (tagName === 'h2') return '\n## ';
        if (tagName === 'h3') return '\n### ';
        if (tagName === 'h4') return '\n#### ';
        if (tagName === 'p') return '\n\n';
        if (tagName === 'br') return '\n';
        if (tagName === 'li') return '\n- ';
        if (tagName === 'strong' || tagName === 'b') return '**';
        return '';
    });
    str = str.replace(/<\/[A-Za-z0-9_]+>/g, (tag) => {
        const tagNameMatch = tag.match(/<\/([A-Za-z0-9_]+)>/);
        const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4') return '\n';
        if (tagName === 'p') return '\n';
        if (tagName === 'strong' || tagName === 'b') return '**';
        return '';
    });
    str = str.replace(/\{\s*['"]\s*['"]\s*\}/g, ' ');
    str = str.replace(/\{\s*['"](.*?)['"]\s*\}/g, '$1');
    str = str.replace(/\/\*[\s\S]*?\*\//g, '');
    str = str.replace(/\/\/.*/g, '');
    return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function extractSectionFromMarkdown(md: string, type: 'impressum' | 'datenschutz'): string | null {
    const headingPattern = type === 'impressum'
        ? /(?:^|\n)(#{1,3}\s*(?:Impressum|Imprint|Rechtliche\s+Hinweise|Legal\s+Notice)[\s\S]+?)(?=\n#{1,2}\s+[^\n]+|$)/i
        : /(?:^|\n)(#{1,3}\s*(?:Datenschutzerklärung|Datenschutz|Privacy\s+Policy|Privacy)[\s\S]+?)(?=\n#{1,2}\s+[^\n]+|$)/i;
    const match = md.match(headingPattern);
    if (match && match[1].trim().length > 30) {
        return match[1].trim();
    }
    return null;
}

function cleanLegalDocumentText(raw: string, isHtml = false): string {
    if (isHtml) {
        return htmlToMarkdown(raw);
    }
    const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return text.trim();
}

/**
 * Wandelt strukturierte JavaScript-Objekte (wie IMPRESSUM_DATA oder PRIVACY_DATA) sauber in Markdown um.
 */
export function formatStructuredLegalObjectToMarkdown(data: any): string {
    if (!data || typeof data !== 'object') return '';
    const parts: string[] = [];

    if (data.title && typeof data.title === 'string') {
        parts.push(`# ${data.title.trim()}\n`);
    }
    if (data.subtitle && typeof data.subtitle === 'string') {
        parts.push(`*${data.subtitle.trim()}*\n`);
    }
    if (data.intro && typeof data.intro === 'string') {
        parts.push(`${data.intro.trim()}\n`);
    }

    if (Array.isArray(data.sections)) {
        for (const sec of data.sections) {
            if (!sec || typeof sec !== 'object') continue;
            if (sec.title) {
                parts.push(`## ${sec.title}\n`);
            }
            if (Array.isArray(sec.paragraphs)) {
                for (const p of sec.paragraphs) {
                    if (p) parts.push(`${p}\n`);
                }
            }
            if (sec.text) {
                parts.push(`${sec.text}\n`);
            }
            if (Array.isArray(sec.lines)) {
                parts.push(sec.lines.filter(Boolean).join('\n') + '\n');
            }
            if (sec.email) {
                parts.push(`E-Mail: ${sec.email}\n`);
            }
            if (sec.contact && typeof sec.contact === 'object') {
                const c = sec.contact;
                const contactLines: string[] = [];
                if (c.name) contactLines.push(c.name);
                if (c.street) contactLines.push(c.street);
                if (c.city) contactLines.push(c.city);
                if (c.email) contactLines.push(`E-Mail: ${c.email}`);
                if (c.phone) contactLines.push(`Telefon: ${c.phone}`);
                if (contactLines.length > 0) {
                    parts.push(contactLines.join('\n') + '\n');
                }
            }
            if (Array.isArray(sec.subsections)) {
                for (const sub of sec.subsections) {
                    if (!sub || typeof sub !== 'object') continue;
                    if (sub.title) {
                        parts.push(`### ${sub.title}\n`);
                    }
                    if (sub.text) {
                        parts.push(`${sub.text}\n`);
                    }
                    if (sub.extraText) {
                        parts.push(`${sub.extraText}\n`);
                    }
                    if (Array.isArray(sub.listItems)) {
                        for (const item of sub.listItems) {
                            parts.push(`- ${item}`);
                        }
                        parts.push('');
                    }
                    if (sub.footerText) {
                        parts.push(`${sub.footerText}\n`);
                    }
                }
            }
            if (sec.extraText) {
                parts.push(`${sec.extraText}\n`);
            }
            if (Array.isArray(sec.listItems)) {
                for (const item of sec.listItems) {
                    parts.push(`- ${item}`);
                }
                parts.push('');
            }
            if (sec.footerText) {
                parts.push(`${sec.footerText}\n`);
            }
            if (sec.footer) {
                parts.push(`*${sec.footer}*\n`);
            }
        }
    }

    if (data.footer && typeof data.footer === 'string') {
        parts.push(`*${data.footer.trim()}*\n`);
    }

    return parts.join('\n').trim();
}

/**
 * Extrahiert ein JavaScript-Objektliteral aus dem Code anhand von balancierten geschweiften Klammern.
 */
function extractObjectByKeyword(code: string, pattern: string): any {
    const regex = new RegExp('(?:export\\s+)?(?:const|let|var)\\s+([A-Za-z0-9_]*' + pattern + '[A-Za-z0-9_]*)\\s*(?::\\s*[^=]+)?\\s*=\\s*\\{', 'i');
    const match = regex.exec(code);
    if (!match) return null;
    const startIndex = match.index + match[0].length - 1; // Position des öffnenden '{'
    let braceCount = 0;
    let endIndex = -1;
    let inString = false;
    let stringChar = '';
    let isEscaped = false;

    for (let i = startIndex; i < code.length; i++) {
        const char = code[i];
        if (inString) {
            if (isEscaped) {
                isEscaped = false;
            } else if (char === '\\') {
                isEscaped = true;
            } else if (char === stringChar) {
                inString = false;
            }
        } else {
            if (char === '"' || char === "'" || char === '`') {
                inString = true;
                stringChar = char;
            } else if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }
    }

    if (endIndex === -1) return null;
    const objectStr = code.slice(startIndex, endIndex);
    try {
        return new Function('return ' + objectStr)();
    } catch {
        return null;
    }
}

function extractLegalTextFromCode(code: string, type: 'impressum' | 'datenschutz'): string | null {
    if (type === 'impressum') {
        // 0. Suche nach exportierten Objekten (z.B. IMPRESSUM_DATA = { ... })
        const obj = extractObjectByKeyword(code, '(?:IMPRESSUM|IMPRINT)');
        if (obj && typeof obj === 'object') {
            const md = formatStructuredLegalObjectToMarkdown(obj);
            if (md && md.length > 30) {
                return md;
            }
        }

        // 1. Suche nach Backtick-Konstante mit IMPRESSUM oder IMPRINT im Namen
        const backtickMatch = code.match(
            /(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]*(?:IMPRESSUM|IMPRINT)[A-Za-z0-9_]*)\s*(?::\s*string)?\s*=\s*`([\s\S]+?)`;/i
        );
        if (backtickMatch && backtickMatch[2] && backtickMatch[2].trim().length > 30) {
            return backtickMatch[2].trim();
        }

        // 2. Suche nach Single/Double-Quote-Konstante
        const quoteMatch = code.match(
            /(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]*(?:IMPRESSUM|IMPRINT)[A-Za-z0-9_]*)\s*(?::\s*string)?\s*=\s*(["'])([\s\S]+?)\2;/i
        );
        if (quoteMatch && quoteMatch[3] && quoteMatch[3].trim().length > 30) {
            return quoteMatch[3].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
        }

        // 3. Suche nach beliebigem Backtick-String, der mit **Impressum** oder Angaben gemäß § 5 anfängt
        const contentMatch = code.match(/`(\s*(?:\*{1,2}|#+)?\s*Impressum[\s\S]+?)`/i);
        if (contentMatch && contentMatch[1] && contentMatch[1].trim().length > 40) {
            return contentMatch[1].trim();
        }

        const ddgMatch = code.match(/`([\s\S]*?Angaben\s+gemäß\s+§\s*5[\s\S]+?)`/i);
        if (ddgMatch && ddgMatch[1] && ddgMatch[1].trim().length > 40) {
            return ddgMatch[1].trim();
        }

        // 4. JSX / Template-Markup in React/Vue/Svelte-Komponenten
        if (/return\s*\(|<template>/i.test(code)) {
            const parsedJsx = cleanJsxToMarkdown(code);
            // Strikte Prüfung: Es muss sich tatsächlich um ein Impressum handeln (niemals auf generisches 'kontakt' matchen!)
            const isActualImpressum =
                /(?:#+|\*\*)\s*(?:Impressum|Imprint)/i.test(parsedJsx) ||
                /\b(?:Angaben\s+gemäß\s+§\s*5|§\s*5\s*DDG|§\s*5\s*TMG)\b/i.test(parsedJsx) ||
                (/\b(?:Impressum|Imprint)\b/i.test(parsedJsx) && /\b(?:Vertreten\s+durch|Umsatzsteuer-Identifikationsnummer|Haftungsausschluss|Verantwortlich\s+für\s+den\s+Inhalt)\b/i.test(parsedJsx));

            if (parsedJsx.length > 80 && isActualImpressum) {
                return parsedJsx;
            }
        }
    } else {
        // DATENSCHUTZ
        // 0. Suche nach exportierten Objekten (z.B. PRIVACY_DATA = { ... } oder DATENSCHUTZ_DATA)
        const obj = extractObjectByKeyword(code, '(?:DATENSCHUTZ|PRIVACY)');
        if (obj && typeof obj === 'object') {
            const md = formatStructuredLegalObjectToMarkdown(obj);
            if (md && md.length > 50) {
                return md;
            }
        }

        // 1. Suche nach Backtick-Konstante mit DATENSCHUTZ oder PRIVACY im Namen
        const backtickMatch = code.match(
            /(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]*(?:DATENSCHUTZ|PRIVACY)[A-Za-z0-9_]*)\s*(?::\s*string)?\s*=\s*`([\s\S]+?)`;/i
        );
        if (backtickMatch && backtickMatch[2] && backtickMatch[2].trim().length > 50) {
            return backtickMatch[2].trim();
        }

        // 2. Single/Double Quote
        const quoteMatch = code.match(
            /(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]*(?:DATENSCHUTZ|PRIVACY)[A-Za-z0-9_]*)\s*(?::\s*string)?\s*=\s*(["'])([\s\S]+?)\2;/i
        );
        if (quoteMatch && quoteMatch[3] && quoteMatch[3].trim().length > 50) {
            return quoteMatch[3].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
        }

        // 3. Beliebiger Backtick-String, der mit **Datenschutzerklärung** oder 1. Verantwortlicher anfängt
        const contentMatch = code.match(/`(\s*(?:\*{1,2}|#+)?\s*(?:Datenschutzerklärung|Datenschutzhinweise|Privacy\s+Policy)[\s\S]+?)`/i);
        if (contentMatch && contentMatch[1] && contentMatch[1].trim().length > 60) {
            return contentMatch[1].trim();
        }

        const gdprMatch = code.match(/`([\s\S]*?(?:Verantwortlicher\s+im\s+Sinne|Art\.\s*6\s+Abs\.\s*1|DSGVO)[\s\S]+?)`/i);
        if (gdprMatch && gdprMatch[1] && gdprMatch[1].trim().length > 100) {
            return gdprMatch[1].trim();
        }

        // 4. JSX / Template-Markup in React/Vue/Svelte-Komponenten
        if (/return\s*\(|<template>/i.test(code)) {
            const parsedJsx = cleanJsxToMarkdown(code);
            // Strikte Prüfung: Es muss sich tatsächlich um eine Datenschutzerklärung handeln!
            const isActualDatenschutz =
                /(?:#+|\*\*)\s*(?:Datenschutzerklärung|Datenschutzhinweise|Privacy\s+Policy)/i.test(parsedJsx) ||
                (/\b(?:Datenschutzerklärung|Privacy\s+Policy)\b/i.test(parsedJsx) && /\b(?:Verantwortlicher|Betroffenenrechte|Widerruf|Art\.\s*6|DSGVO)\b/i.test(parsedJsx)) ||
                (/\b(?:DSGVO|Datenschutz-Grundverordnung|TDDDG)\b/i.test(parsedJsx) && /\b(?:Verantwortlicher\s+im\s+Sinne|Rechte\s+der\s+betroffenen\s+Personen|Auskunftsrecht)\b/i.test(parsedJsx));

            if (parsedJsx.length > 100 && isActualDatenschutz) {
                return parsedJsx;
            }
        }
    }

    return null;
}

export async function detectExistingLegalDocs(
    files: VirtualFile[],
    fileMap: Map<string, VirtualFile>
): Promise<{
    impressum?: string;
    impressumSource?: string;
    datenschutz?: string;
    datenschutzSource?: string;
}> {
    const result: {
        impressum?: string;
        impressumSource?: string;
        datenschutz?: string;
        datenschutzSource?: string;
    } = {};

    // 1. Suche nach bekannten Dateipfaden (Markdown, Text, HTML oder JS/TS)
    const IMPRESSUM_CANDIDATE_PATHS = [
        'impressum.md',
        'imprint.md',
        'impressum.txt',
        'imprint.txt',
        'src/impressum.js',
        'src/impressum.ts',
        'src/impressum.jsx',
        'src/impressum.tsx',
        'src/imprint.js',
        'src/imprint.ts',
        'src/legal/impressum.js',
        'src/legal/impressum.ts',
        'impressum.js',
        'impressum.ts',
        'docs/impressum.md',
        'docs/imprint.md',
        'legal/impressum.md',
        'legal/imprint.md',
        'public/impressum.html',
        'public/imprint.html',
        'impressum.html',
        'imprint.html'
    ];

    const DATENSCHUTZ_CANDIDATE_PATHS = [
        'datenschutz.md',
        'datenschutzerklaerung.md',
        'datenschutz.txt',
        'datenschutzerklaerung.txt',
        'privacy.md',
        'privacy-policy.md',
        'privacypolicy.md',
        'privacy.txt',
        'src/privacy.js',
        'src/privacy.ts',
        'src/privacy.jsx',
        'src/privacy.tsx',
        'src/datenschutz.js',
        'src/datenschutz.ts',
        'src/datenschutz.jsx',
        'src/datenschutz.tsx',
        'src/legal/privacy.js',
        'src/legal/datenschutz.js',
        'privacy.js',
        'datenschutz.js',
        'docs/datenschutz.md',
        'docs/datenschutzerklaerung.md',
        'docs/privacy.md',
        'docs/privacy-policy.md',
        'legal/datenschutz.md',
        'legal/privacy.md',
        'public/datenschutz.html',
        'public/privacy.html',
        'public/privacy-policy.html',
        'datenschutz.html',
        'datenschutzerklaerung.html',
        'privacy.html',
        'privacy-policy.html'
    ];

    for (const path of IMPRESSUM_CANDIDATE_PATHS) {
        if (result.impressum) break;
        const vf = fileMap.get(path);
        if (vf && vf.size > 20 && vf.size < 300 * 1024) {
            try {
                const text = await vf.getText();
                if (text && text.trim().length > 30) {
                    if (/\.(js|jsx|ts|tsx|vue)$/i.test(path)) {
                        const extracted = extractLegalTextFromCode(text, 'impressum');
                        if (extracted) {
                            result.impressum = extracted;
                            result.impressumSource = vf.relativePath;
                        }
                    } else {
                        const isHtml = path.endsWith('.html') || path.endsWith('.htm');
                        result.impressum = cleanLegalDocumentText(text, isHtml);
                        result.impressumSource = vf.relativePath;
                    }
                }
            } catch (e) {}
        }
    }

    for (const path of DATENSCHUTZ_CANDIDATE_PATHS) {
        if (result.datenschutz) break;
        const vf = fileMap.get(path);
        if (vf && vf.size > 20 && vf.size < 500 * 1024) {
            try {
                const text = await vf.getText();
                if (text && text.trim().length > 50) {
                    if (/\.(js|jsx|ts|tsx|vue)$/i.test(path)) {
                        const extracted = extractLegalTextFromCode(text, 'datenschutz');
                        if (extracted) {
                            result.datenschutz = extracted;
                            result.datenschutzSource = vf.relativePath;
                        }
                    } else {
                        const isHtml = path.endsWith('.html') || path.endsWith('.htm');
                        result.datenschutz = cleanLegalDocumentText(text, isHtml);
                        result.datenschutzSource = vf.relativePath;
                    }
                }
            } catch (e) {}
        }
    }

    // 2. Dateinamen-Pattern-Suche über alle Dateien
    if (!result.impressum || !result.datenschutz) {
        for (const vf of files) {
            if (result.impressum && result.datenschutz) break;
            const lowerName = vf.name.toLowerCase();

            // Impressum
            if (!result.impressum && (lowerName.includes('impressum') || lowerName.includes('imprint'))) {
                if (!/\.(png|jpe?g|svg|ico|webp|gif|json|lock)$/i.test(lowerName) && vf.size > 20 && vf.size < 300 * 1024) {
                    try {
                        const content = await vf.getText();
                        if (/\.(md|txt|html|htm)$/i.test(lowerName)) {
                            result.impressum = cleanLegalDocumentText(content, /\.(html|htm)$/i.test(lowerName));
                            result.impressumSource = vf.relativePath;
                        } else if (/\.(ts|tsx|js|jsx|vue)$/i.test(lowerName)) {
                            const extracted = extractLegalTextFromCode(content, 'impressum');
                            if (extracted) {
                                result.impressum = extracted;
                                result.impressumSource = vf.relativePath;
                            }
                        }
                    } catch (e) {}
                }
            }

            // Datenschutz
            if (!result.datenschutz && (lowerName.includes('datenschutz') || lowerName.includes('privacy'))) {
                if (!/\.(png|jpe?g|svg|ico|webp|gif|json|lock)$/i.test(lowerName) && vf.size > 20 && vf.size < 500 * 1024) {
                    try {
                        const content = await vf.getText();
                        if (/\.(md|txt|html|htm)$/i.test(lowerName)) {
                            result.datenschutz = cleanLegalDocumentText(content, /\.(html|htm)$/i.test(lowerName));
                            result.datenschutzSource = vf.relativePath;
                        } else if (/\.(ts|tsx|js|jsx|vue)$/i.test(lowerName)) {
                            const extracted = extractLegalTextFromCode(content, 'datenschutz');
                            if (extracted) {
                                result.datenschutz = extracted;
                                result.datenschutzSource = vf.relativePath;
                            }
                        }
                    } catch (e) {}
                }
            }
        }
    }

    // 3. Konstanten in relevanten Code-Dateien (constants.tsx, constants.ts, legal.ts, etc.)
    if (!result.impressum || !result.datenschutz) {
        const legalCodeFiles = files.filter(f => {
            const low = f.name.toLowerCase();
            return (
                (low.includes('constant') || low.includes('legal') || low.includes('impressum') || low.includes('imprint') || low.includes('datenschutz') || low.includes('privacy') || low.includes('footer')) &&
                /\.(ts|tsx|js|jsx|json)$/i.test(low) &&
                f.size > 50 && f.size < 250 * 1024
            );
        });

        for (const vf of legalCodeFiles) {
            if (result.impressum && result.datenschutz) break;
            try {
                const content = await vf.getText();

                if (!result.impressum) {
                    const extracted = extractLegalTextFromCode(content, 'impressum');
                    if (extracted) {
                        result.impressum = extracted;
                        result.impressumSource = `${vf.relativePath} (Quellcode/Komponente)`;
                    }
                }

                if (!result.datenschutz) {
                    const extracted = extractLegalTextFromCode(content, 'datenschutz');
                    if (extracted) {
                        result.datenschutz = extracted;
                        result.datenschutzSource = `${vf.relativePath} (Quellcode/Komponente)`;
                    }
                }
            } catch (e) {}
        }
    }

    // 4. Abschnitte in README.md oder Dokumentationen
    if (!result.impressum || !result.datenschutz) {
        const docFiles = files.filter(f => /^(readme|doku|docs|legal)\.(md|markdown|txt)$/i.test(f.name));
        for (const df of docFiles) {
            if (result.impressum && result.datenschutz) break;
            try {
                const text = await df.getText();
                if (!result.impressum) {
                    const sec = extractSectionFromMarkdown(text, 'impressum');
                    if (sec) {
                        result.impressum = sec;
                        result.impressumSource = `${df.relativePath} (Abschnitt)`;
                    }
                }
                if (!result.datenschutz) {
                    const sec = extractSectionFromMarkdown(text, 'datenschutz');
                    if (sec) {
                        result.datenschutz = sec;
                        result.datenschutzSource = `${df.relativePath} (Abschnitt)`;
                    }
                }
            } catch (e) {}
        }
    }

    // 5. Lokalisierungs- / i18n-Dateien (locales/de.json, i18n/de.json etc.)
    if (!result.impressum || !result.datenschutz) {
        const i18nFiles = files.filter(f =>
            f.size > 20 && f.size < 200 * 1024 &&
            /\.json$/i.test(f.name) &&
            /(?:locale|i18n|lang|translation|message|de)/i.test(f.relativePath)
        );
        for (const jf of i18nFiles) {
            if (result.impressum && result.datenschutz) break;
            try {
                const parsed = JSON.parse(await jf.getText());
                const findKey = (obj: any, keyRegex: RegExp): string | null => {
                    if (!obj || typeof obj !== 'object') return null;
                    for (const k of Object.keys(obj)) {
                        if (keyRegex.test(k) && typeof obj[k] === 'string' && obj[k].trim().length > 30) {
                            return obj[k].trim();
                        }
                        if (typeof obj[k] === 'object') {
                            const sub = findKey(obj[k], keyRegex);
                            if (sub) return sub;
                        }
                    }
                    return null;
                };

                if (!result.impressum) {
                    const val = findKey(parsed, /^(impressum|imprint|legalNotice|rechtliches)$/i);
                    if (val) {
                        result.impressum = cleanLegalDocumentText(val);
                        result.impressumSource = `${jf.relativePath} (i18n Key)`;
                    }
                }
                if (!result.datenschutz) {
                    const val = findKey(parsed, /^(datenschutz|privacy|privacyPolicy|datenschutzerklaerung)$/i);
                    if (val) {
                        result.datenschutz = cleanLegalDocumentText(val);
                        result.datenschutzSource = `${jf.relativePath} (i18n Key)`;
                    }
                }
            } catch (e) {}
        }
    }

    return result;
}

async function analyzeVirtualFiles(folderName: string, files: VirtualFile[]): Promise<ScanResult> {
    const results: ScanResult = {
        folderPath: folderName,
        name: '',
        detectedServices: [],
        codeAnalysisSummary: ''
    };

    const detectedSet = new Set<string>();
    const analysisLines: string[] = [];
    const externalUrls = new Set<string>();
    const envVarNames = new Set<string>();
    const detectedFeatures = new Set<string>();
    const allPackagesList: string[] = [];
    const inferredTypes = new Set<string>();

    const fileMap = new Map<string, VirtualFile>();
    for (const f of files) {
        fileMap.set(f.relativePath, f);
    }

    const GENERIC_PKG_NAMES = new Set([
        'app', 'my-app', 'vite-project', 'react-app', 'client', 'web', 'frontend', 'project', 'starter', 'template'
    ]);

    // 1. package.json analysieren
    const pkgFile = fileMap.get('package.json');
    if (pkgFile) {
        try {
            const pkgContent = JSON.parse(await pkgFile.getText());
            const rawPkgName = pkgContent.name ? String(pkgContent.name).trim() : '';
            if (rawPkgName && !GENERIC_PKG_NAMES.has(rawPkgName.toLowerCase())) {
                results.name = rawPkgName
                    .split(/[-_]/)
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
            if (pkgContent.description) {
                analysisLines.push(`Projektbeschreibung (package.json): ${pkgContent.description}`);
            }
            if (pkgContent.homepage && typeof pkgContent.homepage === 'string') {
                analysisLines.push(`Homepage (package.json): ${pkgContent.homepage}`);
                if (pkgContent.homepage.startsWith('http')) {
                    results.homepageUrl = pkgContent.homepage;
                }
            }

            const deps = Object.keys(pkgContent.dependencies || {});
            const devDeps = Object.keys(pkgContent.devDependencies || {});
            const allDeps = {
                ...(pkgContent.dependencies || {}),
                ...(pkgContent.devDependencies || {})
            };
            allPackagesList.push(...deps);

            if (deps.includes('electron') || devDeps.includes('electron') || deps.includes('@tauri-apps/api') || devDeps.includes('@tauri-apps/cli')) {
                detectedFeatures.add('Desktop-App (Electron / Tauri – läuft lokal auf dem Nutzergerät)');
                inferredTypes.add('Desktop-Software');
            }
            if (deps.some(d => d.includes('capacitor') || d.includes('react-native') || d.includes('expo'))) {
                inferredTypes.add('Mobile App');
            }
            if (deps.includes('react') || deps.includes('vue') || deps.includes('svelte') || deps.includes('next') || deps.includes('nuxt') || devDeps.includes('vite')) {
                inferredTypes.add('SaaS / Web-App');
                inferredTypes.add('Webseite');
            }
            if (deps.includes('next')) {
                detectedFeatures.add('Next.js Web-Framework');
            }
            if (deps.includes('express') || deps.includes('fastify') || deps.includes('@nestjs/core')) {
                detectedFeatures.add('Eigener Node.js Backend-Server');
            }
            if (deps.includes('gh-pages') || devDeps.includes('gh-pages') || (pkgContent.homepage && String(pkgContent.homepage).includes('github.io'))) {
                detectedSet.add('GitHub Pages Hosting');
                inferredTypes.add('Webseite');
            }

            for (const [dep, label] of Object.entries(DEP_CHECKERS)) {
                for (const actualDep of Object.keys(allDeps)) {
                    if (actualDep.toLowerCase().includes(dep)) {
                        detectedSet.add(label);
                    }
                }
            }
        } catch (e) {
            console.error('Fehler beim Lesen der package.json:', e);
        }
    }

    // Fallback für Projektname aus Ordnername (oder wenn der Ordnername sprechender ist)
    if (folderName) {
        const baseName = folderName.split(/[\\/]/).pop()?.trim() || folderName;
        if (!results.name) {
            results.name = baseName
                .split(/[-_]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
    }

    // 1a. Projekt-Icon automatisch aus dem Ordner suchen
    const iconPathsToTry: string[] = [];
    const indexHtmlFile = fileMap.get('index.html') || fileMap.get('public/index.html');
    if (indexHtmlFile) {
        try {
            const idxHtml = await indexHtmlFile.getText();
            const iconHrefMatches = [...idxHtml.matchAll(/<link[^>]*rel=["'](?:shortcut\s+icon|icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/gi)];
            for (const m of iconHrefMatches) {
                const rawHref = m[1].replace(/^\.?\/+/, '').split('?')[0];
                if (rawHref && !rawHref.startsWith('http') && !rawHref.startsWith('data:')) {
                    iconPathsToTry.push(rawHref);
                    iconPathsToTry.push(`public/${rawHref}`);
                }
            }
        } catch (e) {}
    }
    iconPathsToTry.push(...ICON_CANDIDATE_PATHS);

    let chosenIconFile: VirtualFile | undefined;
    for (const candidatePath of iconPathsToTry) {
        const f = fileMap.get(candidatePath);
        if (f && f.size > 0 && f.size <= 800 * 1024 && f.getDataUrl) {
            chosenIconFile = f;
            break;
        }
    }

    if (!chosenIconFile) {
        chosenIconFile = files.find(f =>
            f.getDataUrl &&
            f.size > 0 &&
            f.size <= 800 * 1024 &&
            f.relativePath.split('/').length <= 3 &&
            /^(icon|logo|app-icon|favicon)\.(png|svg|ico|webp)$/i.test(f.name)
        );
    }

    if (chosenIconFile && chosenIconFile.getDataUrl) {
        try {
            const dataUrl = await chosenIconFile.getDataUrl();
            if (dataUrl && dataUrl.startsWith('data:')) {
                results.iconDataUrl = dataUrl;
            }
        } catch (e) {}
    }

    // 1b. README.md analysieren
    const readmeCandidates = ['README.md', 'readme.md', 'README.txt'];
    for (const rFile of readmeCandidates) {
        const found = fileMap.get(rFile);
        if (found) {
            try {
                const readmeText = (await found.getText()).slice(0, 1500).trim();
                if (readmeText) {
                    analysisLines.push(`Auszug aus ${rFile}:\n${readmeText}`);
                }
                break;
            } catch (e) {}
        }
    }

    // 1c. .env / .env.example Variablennamen prüfen (OHNE geheime Werte auszulesen!)
    const envCandidates = ['.env', '.env.local', '.env.example', '.env.template'];
    for (const envFile of envCandidates) {
        const found = fileMap.get(envFile);
        if (found) {
            try {
                const envLines = (await found.getText()).split(/\r?\n/);
                for (const line of envLines) {
                    const match = line.match(/^\s*([A-Z0-9_]+)\s*=/);
                    if (match && match[1]) {
                        envVarNames.add(match[1]);
                    }
                }
            } catch (e) {}
        }
    }

    // 1d. Bekannte Hosting- und Ökosystem-Dateien prüfen
    for (const cfg of CONFIG_CHECKERS) {
        if (fileMap.has(cfg.file)) {
            detectedSet.add(cfg.label);
        }
    }

    const cnameFile = fileMap.get('CNAME') || fileMap.get('public/CNAME');
    if (cnameFile) {
        detectedSet.add('GitHub Pages Hosting');
        try {
            const cnameDomain = (await cnameFile.getText()).split(/\r?\n/)[0]?.trim();
            if (cnameDomain && !results.homepageUrl) {
                results.homepageUrl = cnameDomain.startsWith('http') ? cnameDomain : `https://${cnameDomain}`;
            }
        } catch {}
    }

    for (const f of files) {
        if (f.relativePath.startsWith('.github/workflows/') && (f.name.endsWith('.yml') || f.name.endsWith('.yaml'))) {
            try {
                const wfContent = (await f.getText()).toLowerCase();
                if (wfContent.includes('deploy-pages') || wfContent.includes('gh-pages') || wfContent.includes('github-pages')) {
                    detectedSet.add('GitHub Pages Hosting');
                }
            } catch (e) {}
        }
    }

    // 1e. AndroidManifest.xml Berechtigungen prüfen
    const androidManifestPaths = [
        'android/app/src/main/AndroidManifest.xml',
        'app/src/main/AndroidManifest.xml'
    ];
    for (const manifestPath of androidManifestPaths) {
        const found = fileMap.get(manifestPath);
        if (found) {
            try {
                const manifestContent = await found.getText();
                const perms = [...manifestContent.matchAll(/android\.permission\.([A-Z_]+)/g)].map(m => m[1]);
                if (perms.length > 0) {
                    detectedFeatures.add(`Android-Berechtigungen: ${Array.from(new Set(perms)).join(', ')}`);
                }
            } catch (e) {}
        }
    }

    // 1f. Flutter (pubspec.yaml) oder Python (requirements.txt) prüfen
    const pubspecFile = fileMap.get('pubspec.yaml');
    if (pubspecFile) {
        try {
            const pubContent = (await pubspecFile.getText()).toLowerCase();
            if (!results.name) {
                const nameMatch = pubContent.match(/^name:\s*([a-z0-9_-]+)/m);
                if (nameMatch) results.name = nameMatch[1];
            }
            if (pubContent.includes('firebase_')) detectedSet.add('Firebase (Google)');
            if (pubContent.includes('supabase_flutter')) detectedSet.add('Supabase');
            if (pubContent.includes('google_fonts')) detectedSet.add('Google Fonts');
            if (pubContent.includes('sentry_flutter')) detectedSet.add('Sentry (Fehleranalyse)');
            if (pubContent.includes('purchases_flutter')) detectedSet.add('RevenueCat (In-App-Käufe)');
            if (pubContent.includes('google_mobile_ads')) detectedSet.add('Google AdMob (Werbung)');
            if (pubContent.includes('onesignal_flutter')) detectedSet.add('OneSignal (Push-Benachrichtigungen)');
        } catch (e) {}
    }

    const reqTxtFile = fileMap.get('requirements.txt');
    if (reqTxtFile) {
        try {
            const reqContent = (await reqTxtFile.getText()).toLowerCase();
            if (reqContent.includes('openai')) detectedSet.add('OpenAI KI-API');
            if (reqContent.includes('google-genai') || reqContent.includes('google-generativeai')) detectedSet.add('Google Gemini KI-API');
            if (reqContent.includes('anthropic')) detectedSet.add('Anthropic Claude KI-API');
            if (reqContent.includes('stripe')) detectedSet.add('Stripe (Zahlungsabwicklung)');
            if (reqContent.includes('sentry-sdk')) detectedSet.add('Sentry (Fehleranalyse)');
            if (reqContent.includes('boto3')) detectedSet.add('AWS (Amazon Web Services)');
        } catch (e) {}
    }

    // 2. Quelldateien scannen
    let fileCount = 0;
    const MAX_FILES = 250;

    for (const f of files) {
        if (fileCount >= MAX_FILES) break;
        const dotIdx = f.name.lastIndexOf('.');
        const ext = dotIdx !== -1 ? f.name.slice(dotIdx).toLowerCase() : '';
        if (!ALLOWED_EXTENSIONS.has(ext) || f.size >= 120 * 1024) continue;

        fileCount++;
        try {
            const content = await f.getText();
            if (content.includes('@legalgen-ignore-scan')) {
                continue;
            }

            if (/https?:\/\/fonts\.googleapis\.com|https?:\/\/fonts\.gstatic\.com/i.test(content)) {
                detectedSet.add('Google Fonts (via CDN)');
            }
            if (/https?:\/\/use\.typekit\.net/i.test(content)) {
                detectedSet.add('Adobe Fonts');
            }
            if (/https?:\/\/(www\.)?(google-analytics\.com|googletagmanager\.com)|window\.gtag\s*\(/i.test(content)) {
                detectedSet.add('Google Analytics / Tag Manager');
            }
            if (/https?:\/\/connect\.facebook\.net|\bfbq\s*\(\s*['"]init['"]/i.test(content)) {
                detectedSet.add('Facebook Pixel / Meta Pixel');
            }
            if (/https?:\/\/maps\.googleapis\.com/i.test(content)) {
                detectedSet.add('Google Maps');
            }
            if (/https?:\/\/(www\.)?(youtube\.com\/embed|youtube-nocookie\.com\/embed|youtu\.be\/)/i.test(content)) {
                detectedSet.add('YouTube Video Embeds');
            }
            if (/https?:\/\/player\.vimeo\.com/i.test(content)) {
                detectedSet.add('Vimeo Video Embeds');
            }
            if (/https?:\/\/js\.stripe\.com/i.test(content)) {
                detectedSet.add('Stripe (Zahlungsabwicklung)');
            }
            if (/https?:\/\/(www\.)?paypal\.com\/sdk/i.test(content)) {
                detectedSet.add('PayPal (Zahlungsabwicklung)');
            }
            if (/https?:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)/i.test(content)) {
                detectedSet.add('Cloudflare / jsDelivr / unpkg CDNs');
            }
            if (/https?:\/\/cdn\.tailwindcss\.com/i.test(content)) {
                detectedSet.add('Tailwind CSS CDN');
            }
            if (/https?:\/\/challenges\.cloudflare\.com\/turnstile/i.test(content)) {
                detectedSet.add('Cloudflare Turnstile (Captcha)');
            }
            if (/https?:\/\/(www\.)?google\.com\/recaptcha/i.test(content)) {
                detectedSet.add('Google reCAPTCHA');
            }
            if (/https?:\/\/[a-z0-9.]*tile\.openstreetmap\.org/i.test(content)) {
                detectedSet.add('OpenStreetMap (Kartendienst)');
            }

            // Cookie-Banner / Consent Management Platforms (CMP) erkennen
            if (/consent\.cookiebot\.com|\bCookiebot\b/i.test(content)) {
                detectedSet.add('Cookie-Banner (Cookiebot CMP)');
            }
            if (/app\.usercentrics\.eu|usercentrics-cmp|\bUC_UI\b/i.test(content)) {
                detectedSet.add('Cookie-Banner (Usercentrics CMP)');
            }
            if (/cdn\.cookielaw\.org|\bOptanonWrapper\b/i.test(content)) {
                detectedSet.add('Cookie-Banner (OneTrust CMP)');
            }
            if (/cdn-cookieyes\.com|\bcookieyes\b/i.test(content)) {
                detectedSet.add('Cookie-Banner (CookieYes CMP)');
            }
            if (/cdn\.iubenda\.com|_iub\.csConfiguration/i.test(content)) {
                detectedSet.add('Cookie-Banner (iubenda CMP)');
            }
            if (/borlabs-cookie|\bBorlabsCookie\b/i.test(content)) {
                detectedSet.add('Cookie-Banner (Borlabs Cookie)');
            }
            if (/complianz|\bcmplz[_-]/i.test(content)) {
                detectedSet.add('Cookie-Banner (Complianz CMP)');
            }
            if (/klaroConfig|\bklaro\.show\b/i.test(content)) {
                detectedSet.add('Cookie-Banner (Klaro! Consent Manager)');
            }
            if (
                /cookie[-_]?banner|cookie[-_]?consent|consent[-_]?banner/i.test(f.name) ||
                /<CookieBanner\b|<CookieConsent\b|<ConsentBanner\b|id=["']cookie-(?:banner|consent)["']/i.test(content)
            ) {
                detectedSet.add('Eigenes Cookie-Banner / Consent-Dialog');
                detectedFeatures.add('Cookie-Banner / Consent-Dialog im Code erkannt');
            }

            if (content.includes('localStorage.') || content.includes('sessionStorage.')) {
                detectedFeatures.add('Nutzt lokalen Browser-Speicher (localStorage / sessionStorage)');
            }
            if (content.includes('indexedDB')) {
                detectedFeatures.add('Nutzt lokale IndexedDB-Datenbank im Browser');
            }
            if (content.includes('document.cookie')) {
                detectedFeatures.add('Setzt/liest Cookies aktiv per JavaScript (document.cookie)');
            }
            if (content.includes('navigator.geolocation')) {
                detectedFeatures.add('Fragt Standortdaten ab (navigator.geolocation)');
            }
            if (content.includes('navigator.mediaDevices.getUserMedia')) {
                detectedFeatures.add('Greift auf Kamera/Mikrofon zu (getUserMedia)');
            }
            if (content.includes('signInWith') || content.includes('createUserWithEmailAndPassword') || content.includes('useAuth')) {
                detectedFeatures.add('Besitzt Benutzer-Login / Authentifizierung');
            }
            if (/newsletter/i.test(content) && /<form|<input/i.test(content)) {
                detectedFeatures.add('Enthält Newsletter-Anmeldung im UI');
            }
            if ((/kontaktformular|contact\s*form/i.test(content)) && /<form/i.test(content)) {
                detectedFeatures.add('Enthält ein Kontaktformular');
            }

            const urlMatches = content.matchAll(/https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
            for (const m of urlMatches) {
                const domain = m[1].toLowerCase();
                if (
                    !domain.includes('localhost') &&
                    !domain.includes('127.0.0.1') &&
                    !domain.includes('w3.org') &&
                    !domain.includes('example.com') &&
                    !domain.includes('reactjs.org') &&
                    !domain.includes('mozilla.org')
                ) {
                    externalUrls.add(domain);
                }
            }
        } catch (err) {
            // Datei-Lesefehler ignorieren
        }
    }

    results.detectedServices = Array.from(detectedSet);
    const COMMERCIAL_SERVICES = new Set([
        'Stripe (Zahlungsabwicklung)',
        'PayPal (Zahlungsabwicklung)',
        'Klarna (Zahlungsabwicklung)',
        'RevenueCat (In-App-Käufe)',
        'Google AdMob (Werbung)'
    ]);
    const hasCommercialService = Array.from(detectedSet).some(s => COMMERCIAL_SERVICES.has(s));
    const hasCommercialFeature = Array.from(detectedFeatures).some(f => /zahlung|werbung|in-app|kostenpflichtig|abonnement|subscription/i.test(f));
    results.inferredIsCommercial = hasCommercialService || hasCommercialFeature;
    if (inferredTypes.size === 0) {
        if (fileMap.has('pubspec.yaml') || fileMap.has('android/app/src/main/AndroidManifest.xml') || fileMap.has('capacitor.config.json') || fileMap.has('capacitor.config.ts')) {
            inferredTypes.add('Mobile App');
        } else {
            inferredTypes.add('Webseite');
        }
    }
    results.inferredProjectTypes = Array.from(inferredTypes);

    const cookieEval = evaluateCookieBannerStatus(folderName, results.detectedServices, Array.from(detectedFeatures).join('\n'));
    if (cookieEval.status === 'implemented') {
        analysisLines.push(`Cookie-Banner / Consent-Status (§ 25 TDDDG): VORHANDEN (${cookieEval.detectedTools.join(', ')})`);
    } else if (cookieEval.status === 'missing_warning') {
        analysisLines.push(`Cookie-Banner / Consent-Status (§ 25 TDDDG): FEHLT TROTZ TRACKING/DRITTANBIETERN! (${cookieEval.detailText})`);
    } else if (cookieEval.status === 'not_required') {
        analysisLines.push(`Cookie-Banner / Consent-Status (§ 25 TDDDG): Kein Cookie-Banner im Code verbaut (da keine einwilligungspflichtigen Tracking-/Marketing-Dienste erkannt wurden, ist nach § 25 Abs. 2 TDDDG i.d.R. auch keines erforderlich).`);
    }

    if (allPackagesList.length > 0) {
        analysisLines.push(`Installierte Dependencies (package.json): ${allPackagesList.slice(0, 40).join(', ')}`);
    }
    if (detectedFeatures.size > 0) {
        analysisLines.push(`Im Code erkannte technische Merkmale & Funktionen:\n- ${Array.from(detectedFeatures).join('\n- ')}`);
    } else {
        analysisLines.push('Im Code wurden KEINE Login-Formulare, KEINE Kontaktformulare, KEINE Newsletter-Formulare und KEINE Tracking-Cookies gefunden.');
    }
    if (externalUrls.size > 0) {
        analysisLines.push(`Im Quellcode aufgerufene externe Domains/Server: ${Array.from(externalUrls).slice(0, 25).join(', ')}`);
    }
    if (envVarNames.size > 0) {
        analysisLines.push(`Konfigurierte Umgebungsvariablen-Namen (.env): ${Array.from(envVarNames).join(', ')}`);
    }
    analysisLines.push(`Gescannte Quelldateien insgesamt: ${fileCount}`);

    // Vorhandene Rechtstexte (Impressum & Datenschutzerklärung) im Projekt erkennen
    const legalDocs = await detectExistingLegalDocs(files, fileMap);
    if (legalDocs.impressum) {
        results.detectedImpressum = legalDocs.impressum;
        analysisLines.unshift(`Vorhandenes Impressum im Projekt erkannt (${legalDocs.impressumSource || 'Projektdatei'}).`);
    }
    if (legalDocs.datenschutz) {
        results.detectedDatenschutz = legalDocs.datenschutz;
        analysisLines.unshift(`Vorhandene Datenschutzerklärung im Projekt erkannt (${legalDocs.datenschutzSource || 'Projektdatei'}).`);
    }

    results.codeAnalysisSummary = analysisLines.join('\n\n');
    return results;
}

async function collectFromDirectoryHandle(
    dirHandle: any,
    prefix = '',
    depth = 0,
    collected: VirtualFile[] = []
): Promise<VirtualFile[]> {
    if (depth > 5 || collected.length >= 600) return collected;

    try {
        for await (const [entryName, handle] of dirHandle.entries()) {
            if (collected.length >= 600) break;
            const relPath = prefix ? `${prefix}/${entryName}` : entryName;

            if (handle.kind === 'directory') {
                if (!IGNORED_DIRS.has(entryName.toLowerCase())) {
                    await collectFromDirectoryHandle(handle, relPath, depth + 1, collected);
                }
            } else if (handle.kind === 'file') {
                try {
                    const file: File = await handle.getFile();
                    collected.push({
                        relativePath: relPath,
                        name: entryName,
                        size: file.size,
                        getText: () => file.text(),
                        getDataUrl: () => fileToDataUrl(file)
                    });
                } catch (e) {}
            }
        }
    } catch (e) {}

    return collected;
}

function selectFilesViaInput(): Promise<FileList | null> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.setAttribute('webkitdirectory', '');
        input.setAttribute('directory', '');
        input.multiple = true;
        input.style.display = 'none';
        document.body.appendChild(input);

        let settled = false;
        const finish = (files: FileList | null) => {
            if (settled) return;
            settled = true;
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
            resolve(files);
        };

        input.addEventListener('change', () => {
            finish(input.files && input.files.length > 0 ? input.files : null);
        });

        input.addEventListener('cancel', () => {
            finish(null);
        });

        input.click();
    });
}

const directoryHandleCache = new Map<string, any>();

// IndexedDB-Speicher für Verzeichnis-Handles & Projekte (bleibt über Browser-Neustarts hinweg erhalten)
const DB_NAME = 'LegalGenFileSystemDB';
const DB_VERSION = 2;
const STORE_NAME = 'directory_handles';
const PROJECTS_STORE = 'projects_store';

function openHandleDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !('indexedDB' in window)) {
            return reject(new Error('IndexedDB nicht verfügbar'));
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
            if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
                db.createObjectStore(PROJECTS_STORE);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveProjectsToIDB(projects: any[]): Promise<void> {
    try {
        const db = await openHandleDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(PROJECTS_STORE, 'readwrite');
            const store = tx.objectStore(PROJECTS_STORE);
            const req = store.put(projects, 'all_projects');
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch {
        // Nicht blockierend
    }
}

export async function loadProjectsFromIDB(): Promise<any[] | null> {
    try {
        const db = await openHandleDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(PROJECTS_STORE, 'readonly');
            const store = tx.objectStore(PROJECTS_STORE);
            const req = store.get('all_projects');
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch {
        return null;
    }
}

export async function storeHandleInIDB(key: string, handle: any): Promise<void> {
    try {
        const db = await openHandleDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(handle, key.trim().toLowerCase());
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch {
        // Nicht blockierend
    }
}

export async function getHandleFromIDB(key: string): Promise<any | null> {
    try {
        const db = await openHandleDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key.trim().toLowerCase());
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch {
        return null;
    }
}

async function resolveDirectoryHandleForProject(folderPath: string): Promise<any | null> {
    if (!folderPath) return null;
    const cleanPath = folderPath.trim();
    const lowerPath = cleanPath.toLowerCase();
    const baseName = cleanPath.split(/[\\/]/).pop()?.trim() || cleanPath;
    const lowerBase = baseName.toLowerCase();

    // 1. Im RAM-Cache prüfen
    if (directoryHandleCache.has(lowerPath)) {
        return directoryHandleCache.get(lowerPath);
    }
    if (directoryHandleCache.has(lowerBase)) {
        return directoryHandleCache.get(lowerBase);
    }

    // 2. Direkt in IndexedDB nachschlagen
    const directHandle = (await getHandleFromIDB(lowerPath)) || (await getHandleFromIDB(lowerBase));
    if (directHandle) {
        directoryHandleCache.set(lowerPath, directHandle);
        return directHandle;
    }

    // 3. Über den übergeordneten Entwicklungs-Ordner (Workspace Root) auflösen
    let rootHandle = directoryHandleCache.get('__workspace_root__');
    if (!rootHandle) {
        rootHandle = await getHandleFromIDB('__workspace_root__');
        if (rootHandle) {
            directoryHandleCache.set('__workspace_root__', rootHandle);
        }
    }

    if (rootHandle) {
        try {
            // Berechtigung für den Workspace-Root sicherstellen
            if ('queryPermission' in rootHandle) {
                let rootPerm = await rootHandle.queryPermission({ mode: 'read' });
                if (rootPerm !== 'granted' && 'requestPermission' in rootHandle) {
                    rootPerm = await rootHandle.requestPermission({ mode: 'read' });
                }
                if (rootPerm !== 'granted') {
                    return null;
                }
            }

            // A: Direkt über baseName aufrufen
            try {
                const subHandle = await rootHandle.getDirectoryHandle(baseName);
                if (subHandle) {
                    directoryHandleCache.set(lowerPath, subHandle);
                    directoryHandleCache.set(lowerBase, subHandle);
                    await storeHandleInIDB(cleanPath, subHandle);
                    await storeHandleInIDB(baseName, subHandle);
                    return subHandle;
                }
            } catch {}

            // B: Über Pfadsegmente gehen (z.B. "Kindergarten / MeineApp")
            const segments = cleanPath.split(/\s*[\/\\]\s*/).filter(Boolean);
            if (segments.length > 1) {
                try {
                    let curr = rootHandle;
                    for (const seg of segments) {
                        curr = await curr.getDirectoryHandle(seg);
                    }
                    if (curr) {
                        directoryHandleCache.set(lowerPath, curr);
                        directoryHandleCache.set(lowerBase, curr);
                        await storeHandleInIDB(cleanPath, curr);
                        await storeHandleInIDB(baseName, curr);
                        return curr;
                    }
                } catch {}
            }

            // C: Unterordner der ersten Ebene nach dem passenden Namen durchsuchen
            try {
                for await (const [entryName, entryHandle] of rootHandle.entries()) {
                    if (entryHandle.kind === 'directory') {
                        if (entryName.toLowerCase() === lowerBase) {
                            directoryHandleCache.set(lowerPath, entryHandle);
                            await storeHandleInIDB(cleanPath, entryHandle);
                            return entryHandle;
                        }
                        try {
                            for await (const [subName, subHandle] of entryHandle.entries()) {
                                if (subHandle.kind === 'directory' && subName.toLowerCase() === lowerBase) {
                                    directoryHandleCache.set(lowerPath, subHandle);
                                    await storeHandleInIDB(cleanPath, subHandle);
                                    return subHandle;
                                }
                            }
                        } catch {}
                    }
                }
            } catch {}
        } catch (e) {
            console.warn('Workspace-Root-Auflösung:', e);
        }
    }

    return null;
}

export async function selectAndScanProjectFolder(): Promise<ScanResult | null> {
    // 1. Moderne Browser: File System Access API (überspringt node_modules/.git sofort!)
    if ('showDirectoryPicker' in window) {
        try {
            const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
            if (!dirHandle) return null;
            directoryHandleCache.set(dirHandle.name.toLowerCase(), dirHandle);
            await storeHandleInIDB(dirHandle.name, dirHandle);
            const virtualFiles = await collectFromDirectoryHandle(dirHandle);
            return await analyzeVirtualFiles(dirHandle.name, virtualFiles);
        } catch (err: any) {
            // Wenn der Nutzer den Dialog abbricht (AbortError), nichts tun
            if (err && err.name === 'AbortError') {
                return null;
            }
            console.warn('showDirectoryPicker fehlgeschlagen, nutze Fallback:', err);
        }
    }

    // 2. Browser-Fallback: <input type="file" webkitdirectory>
    const fileList = await selectFilesViaInput();
    if (!fileList || fileList.length === 0) return null;

    const virtualFiles: VirtualFile[] = [];
    let rootFolderName = '';

    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const rawRel = (file as any).webkitRelativePath || file.name;
        const parts = rawRel.split('/');
        if (!rootFolderName && parts.length > 1) {
            rootFolderName = parts[0];
        }
        const relParts = parts.length > 1 ? parts.slice(1) : parts;
        if (relParts.length > 6) continue;

        // Ignorierte Ordner überspringen
        const hasIgnoredDir = relParts.slice(0, -1).some((part: string) => IGNORED_DIRS.has(part.toLowerCase()));
        if (hasIgnoredDir) continue;

        virtualFiles.push({
            relativePath: relParts.join('/'),
            name: file.name,
            size: file.size,
            getText: () => file.text(),
            getDataUrl: () => fileToDataUrl(file)
        });
    }

    return await analyzeVirtualFiles(rootFolderName || 'Projekt-Ordner', virtualFiles);
}

export async function tryAutoRescanProjectFolder(folderPath: string, onlyIfGranted = false): Promise<ScanResult | null> {
    try {
        const handle = await resolveDirectoryHandleForProject(folderPath);
        if (!handle) return null;

        if ('queryPermission' in handle) {
            let perm = await handle.queryPermission({ mode: 'read' });
            if (perm !== 'granted') {
                if (onlyIfGranted) return null;
                if ('requestPermission' in handle) {
                    try {
                        perm = await handle.requestPermission({ mode: 'read' });
                    } catch {
                        return null;
                    }
                }
            }
            if (perm !== 'granted') {
                return null;
            }
        }

        const virtualFiles = await collectFromDirectoryHandle(handle);
        return await analyzeVirtualFiles(folderPath, virtualFiles);
    } catch (e) {
        console.warn('Automatischer Rescan fehlgeschlagen:', e);
        return null;
    }
}

export async function rescanProjectFolder(folderPath: string): Promise<ScanResult | null> {
    const autoResult = await tryAutoRescanProjectFolder(folderPath);
    if (autoResult) return autoResult;
    return await selectAndScanProjectFolder();
}

const PROJECT_ROOT_MARKERS = new Set([
    'package.json',
    'index.html',
    'pubspec.yaml',
    'requirements.txt',
    'pyproject.toml',
    'cargo.toml',
    'composer.json',
    'go.mod',
    'cmakelists.txt',
    'capacitor.config.json',
    'capacitor.config.ts',
    'app.json',
    'build.gradle',
    'build.gradle.kts',
    'settings.gradle',
    'settings.gradle.kts',
    'gradlew',
    'pom.xml',
    'makefile',
    'dockerfile',
    'docker-compose.yml',
    'main.py',
    'app.py',
    'manage.py'
]);

const INTERNAL_SUBFOLDER_NAMES = new Set([
    'app',
    'src',
    'lib',
    'public',
    'client',
    'server',
    'frontend',
    'backend',
    'web',
    'mobile',
    'desktop',
    'packages',
    'core',
    'shared',
    'common',
    'api',
    'android',
    'ios',
    'electron',
    'docs',
    'test',
    'tests',
    'scripts',
    'assets',
    'res',
    'resources',
    'gradle'
]);

async function isProjectDirectoryHandle(dirHandle: any): Promise<boolean> {
    try {
        for await (const [entryName, handle] of dirHandle.entries()) {
            const lower = entryName.toLowerCase();
            if (handle.kind === 'file' && PROJECT_ROOT_MARKERS.has(lower)) {
                return true;
            }
            if (
                handle.kind === 'directory' &&
                (lower === '.git' ||
                    lower === 'src' ||
                    lower === 'public' ||
                    lower === 'app' ||
                    lower === 'lib' ||
                    lower === 'android' ||
                    lower === 'ios' ||
                    lower === 'frontend' ||
                    lower === 'backend' ||
                    lower === 'client' ||
                    lower === 'server')
            ) {
                return true;
            }
        }
    } catch {}
    return false;
}

export interface WorkspaceScanSummary {
    rootFolderName: string;
    projects: ScanResult[];
}

export async function selectAndScanWorkspaceRoot(
    onProgress?: (currentFolderName: string, currentIndex: number, totalCount: number) => void
): Promise<WorkspaceScanSummary | null> {
    if ('showDirectoryPicker' in window) {
        try {
            const rootHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
            if (!rootHandle) return null;

            directoryHandleCache.set('__workspace_root__', rootHandle);
            directoryHandleCache.set(rootHandle.name.toLowerCase(), rootHandle);
            await storeHandleInIDB('__workspace_root__', rootHandle);
            await storeHandleInIDB(rootHandle.name, rootHandle);

            const discoveredHandles: Array<{ folderLabel: string; handle: any }> = [];

            for await (const [entryName, handle] of rootHandle.entries()) {
                if (handle.kind !== 'directory') continue;
                if (entryName.startsWith('.') || IGNORED_DIRS.has(entryName.toLowerCase())) continue;

                if (await isProjectDirectoryHandle(handle)) {
                    discoveredHandles.push({ folderLabel: entryName, handle });
                } else {
                    // Prüfe eine Ebene tiefer (z.B. Kategorie-Ordner wie "Kindergarten/Entwicklungswerkzeuge")
                    try {
                        for await (const [subName, subHandle] of handle.entries()) {
                            if (subHandle.kind !== 'directory') continue;
                            const lowerSub = subName.toLowerCase();
                            if (subName.startsWith('.') || IGNORED_DIRS.has(lowerSub) || INTERNAL_SUBFOLDER_NAMES.has(lowerSub)) continue;
                            if (await isProjectDirectoryHandle(subHandle)) {
                                discoveredHandles.push({
                                    folderLabel: `${entryName} / ${subName}`,
                                    handle: subHandle
                                });
                            }
                        }
                    } catch {}
                }
            }

            // Falls der gewählte Ordner selbst direkt ein einzelnes Projekt ist
            if (discoveredHandles.length === 0 && (await isProjectDirectoryHandle(rootHandle))) {
                discoveredHandles.push({ folderLabel: rootHandle.name, handle: rootHandle });
            }

            const total = discoveredHandles.length;
            const scannedProjects: ScanResult[] = [];
            for (let i = 0; i < total; i++) {
                const item = discoveredHandles[i];
                if (onProgress) {
                    onProgress(item.folderLabel, i + 1, total);
                }
                directoryHandleCache.set(item.folderLabel.toLowerCase(), item.handle);
                directoryHandleCache.set(item.handle.name.toLowerCase(), item.handle);
                await storeHandleInIDB(item.folderLabel, item.handle);
                await storeHandleInIDB(item.handle.name, item.handle);
                const virtualFiles = await collectFromDirectoryHandle(item.handle);
                const result = await analyzeVirtualFiles(item.folderLabel, virtualFiles);
                scannedProjects.push(result);
            }

            scannedProjects.sort((a, b) => a.name.localeCompare(b.name, 'de'));
            return {
                rootFolderName: rootHandle.name,
                projects: scannedProjects
            };
        } catch (err: any) {
            if (err && err.name === 'AbortError') {
                return null;
            }
            console.warn('Workspace-Scan via showDirectoryPicker fehlgeschlagen, nutze Fallback:', err);
        }
    }

    // Fallback via <input type="file" webkitdirectory>
    const fileList = await selectFilesViaInput();
    if (!fileList || fileList.length === 0) return null;

    let rootFolderName = 'Entwicklungs-Ordner';
    const groupedBySubfolder = new Map<string, VirtualFile[]>();

    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const rawRel = (file as any).webkitRelativePath || file.name;
        const parts = rawRel.split('/');
        if (parts.length < 2) continue;

        rootFolderName = parts[0];
        const subFolder = parts[1];
        if (subFolder.startsWith('.') || IGNORED_DIRS.has(subFolder.toLowerCase())) continue;

        const relParts = parts.slice(2);
        if (relParts.length === 0 || relParts.length > 6) continue;
        const hasIgnoredDir = relParts.slice(0, -1).some((part: string) => IGNORED_DIRS.has(part.toLowerCase()));
        if (hasIgnoredDir) continue;

        if (!groupedBySubfolder.has(subFolder)) {
            groupedBySubfolder.set(subFolder, []);
        }
        groupedBySubfolder.get(subFolder)!.push({
            relativePath: relParts.join('/'),
            name: file.name,
            size: file.size,
            getText: () => file.text(),
            getDataUrl: () => fileToDataUrl(file)
        });
    }

    const validEntries = Array.from(groupedBySubfolder.entries()).filter(([, vFiles]) =>
        vFiles.some(f => PROJECT_ROOT_MARKERS.has(f.relativePath.toLowerCase()) || f.relativePath.startsWith('src/'))
    );
    const total = validEntries.length;
    const scannedProjects: ScanResult[] = [];
    for (let i = 0; i < total; i++) {
        const [subName, vFiles] = validEntries[i];
        if (onProgress) {
            onProgress(subName, i + 1, total);
        }
        const res = await analyzeVirtualFiles(subName, vFiles);
        scannedProjects.push(res);
    }

    scannedProjects.sort((a, b) => a.name.localeCompare(b.name, 'de'));
    return {
        rootFolderName,
        projects: scannedProjects
    };
}
