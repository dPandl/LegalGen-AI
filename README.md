<div align="center">

# ⚖️ LegalGen AI

### Der lokale KI-Assistent für rechtssichere Impressen & Datenschutzerklärungen

[![Live Web-App](https://img.shields.io/badge/Live%20App-by--dp.de%2FLegalGen--AI-0284c7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://by-dp.de/LegalGen-AI/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-10b981?style=for-the-badge&logo=shield&logoColor=white)](#-datenschutz--privatsphäre)

<br />

**LegalGen AI** scannt deine lokalen Web-, Mobile- und Desktop-Projekte, erkennt automatisch genutzte Drittanbieter-Dienste, Cookie-Banner und bestehende Dokumente und generiert mit KI maßgeschneiderte, abmahnsichere Texte nach **§ 5 DDG** (Digitale-Dienste-Gesetz) und **Art. 13 DSGVO**.

[🚀 **Jetzt direkt im Browser starten**](https://by-dp.de/LegalGen-AI/)

</div>

---

## ✨ Highlights & Features

### 🔍 Intelligenter Projekt- & Ordner-Scan
- **Automatischer Code-Check**: Analysiert `package.json`, Quelldateien und Konfigurationen blitzschnell über die moderne Browser File System Access API.
- **Dienste-Erkennung**: Erkennt Tracking, Hosting, Datenbanken, Payment und Auth-Dienste (z. B. Supabase, Firebase, Stripe, PayPal, Google Fonts, PostHog, Vercel, Sentry u. v. m.).
- **Cookie-Banner-Audit (§ 25 TDDDG)**: Bewertet rechtssicher, ob aufgrund der erkannten Dienste überhaupt ein Cookie-Banner erforderlich ist oder ob lokaler Speicher (§ 25 Abs. 2 TDDDG) ausreicht.
- **Kommerziell vs. Privat**: Intelligente Klassifizierung mit 1-Klick-Umschaltung für Portfolio- und Hobbyprojekte.

### 📑 Universelle Rechtstexterkennung
- Findet und extrahiert bestehende Dokumente projektweit:
  - Markdown- & Textdateien (`impressum.md`, `datenschutz.md`, `privacy-policy.md`)
  - HTML-Dateien mit automatischer Markdown-Formatierung (`public/impressum.html`)
  - Quellcode-Konstanten und React/Vue-Komponenten (`pages/impressum.tsx`, `components/Privacy.vue`)
  - Dokumentations-Abschnitte und `i18n`-Übersetzungen (`locales/de.json`)

### 🤖 KI-Generator mit Gemini 3.8 Flash
- Erstellt passgenaue, vollständige Impressen (§ 5 DDG) und DSGVO-Datenschutzerklärungen.
- Berücksichtigt das individuelle Entwickler- oder Unternehmensprofil sowie alle technischen Gegebenheiten des Projekts.
- Interaktiver Chat-Assistent für Nachfragen, Korrekturen und Anpassungen in Echtzeit.

### ⚖️ Live-Gesetzes-Monitor & Diff-Viewer
- Gleicht gesetzliche Vorgaben automatisch mit offiziellen Quellen (**gesetze-im-internet.de** und **IHK**) ab.
- Visuelle **Diff-Vorschau** bei Gesetzesänderungen: Zeigt dir rot/grün markiert, welche Gesetzespassagen neu sind und aktualisiert deine Vorlagen auf Knopfdruck.

### 🔒 100 % Datenschutz & Privatsphäre
- **Kein Backend, kein Tracking**: Die Web-App läuft zu 100 % clientseitig in deinem Browser.
- Dein Quellcode und deine Projekte verlassen niemals deinen Computer.
- Eigener API-Key: Volle Kontrolle über deinen Gemini API-Key (sicher im lokalen `localStorage` gespeichert).

### 📱 PWA & Offline-Support
- Installierbar als Progressive Web App (PWA) auf macOS, Windows, Linux, Android und iOS.
- Schnelle Ladezeiten durch Service-Worker-Caching.

---

## 🚀 Live-Nutzung & Demo

Die App ist öffentlich und kostenfrei gehostet auf GitHub Pages:

👉 **[https://by-dp.de/LegalGen-AI/](https://by-dp.de/LegalGen-AI/)**

> **Hinweis:** Zur Textgenerierung wird ein kostenloser [Google Gemini API Key](https://aistudio.google.com/app/apikey) benötigt, der direkt in der App hinterlegt werden kann.

---

## 🛠️ Lokale Entwicklung

Voraussetzung: [Node.js](https://nodejs.org/) (Version 18 oder höher).

```bash
# 1. Repository klonen
git clone https://github.com/dPandl/LegalGen-AI.git
cd LegalGen-AI

# 2. Abhängigkeiten installieren
npm install

# 3. Lokalen Entwicklungsserver starten
npm run dev
```

Die App ist anschließend unter `http://localhost:3010` im Browser erreichbar.

### Production Build erstellen

```bash
npm run build
```

---

## 🏗️ Tech-Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS, Heroicons / React-Icons
- **Bundler:** Vite 6
- **KI:** Google Gemini API SDK (`@google/genai`)
- **PWA:** Web App Manifest, Service Worker
- **Deployment:** GitHub Pages via GitHub Actions

---

## ⚖️ Rechtlicher Hinweis

**LegalGen AI** ist ein technisches Software-Werkzeug und ein KI-gestützter Entwurfsassistent. Die Nutzung der Anwendung stellt **keine Rechtsberatung** im Sinne des Rechtsdienstleistungsgesetzes (RDG) dar und kann eine individuelle juristische Prüfung durch einen zugelassenen Rechtsanwalt nicht ersetzen.

---

## 👤 Autor

Entwickelt von **Pascal Pander**  
Website: [by-dp.de](https://by-dp.de)  
GitHub: [@dPandl](https://github.com/dPandl)
