import React from 'react';
import { 
    HiOutlineArrowLeft,
    HiOutlineGlobeAlt,
    HiOutlineCog6Tooth,
    HiOutlineFolder,
    HiOutlineUser,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineDocumentText,
    HiOutlineShieldCheck,
    HiOutlineCheckCircle,
    HiOutlinePencilSquare,
    HiOutlineSparkles,
    HiOutlineClipboard,
    HiOutlineArrowPath,
    HiOutlinePaperAirplane,
    HiOutlineArrowDownTray,
    HiOutlineArrowUpTray,
    HiOutlineMagnifyingGlass,
    HiOutlineXMark
} from 'react-icons/hi2';

const renderIcon = (Icon: any, className: string) => React.createElement(Icon, { className });

export const ArrowLeftIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineArrowLeft, className || "w-5 h-5")
);

export const GlobeIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineGlobeAlt, className || "w-5 h-5")
);

export const CogIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineCog6Tooth, className || "w-6 h-6")
);

export const FolderIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineFolder, className || "w-5 h-5")
);

export const UserIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineUser, className || "w-5 h-5")
);

export const PlusIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlinePlus, className || "w-5 h-5")
);

export const TrashIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineTrash, className || "w-4 h-4")
);

export const DocumentTextIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineDocumentText, className || "w-8 h-8")
);

export const ShieldCheckIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineShieldCheck, className || "w-8 h-8")
);

export const CheckCircleIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineCheckCircle, className || "w-5 h-5")
);

export const PencilSquareIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlinePencilSquare, className || "w-5 h-5")
);

export const SparklesIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineSparkles, className || "w-5 h-5")
);

export const ClipboardIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineClipboard, className || "w-5 h-5 mr-2")
);

export const ArrowPathIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineArrowPath, className || "w-5 h-5 mr-2")
);

export const PaperAirplaneIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlinePaperAirplane, className || "w-5 h-5")
);

export const DownloadIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineArrowDownTray, className || "w-4 h-4")
);

export const UploadIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineArrowUpTray, className || "w-4 h-4")
);

export const ScaleJusticeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}>
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
);

export const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineMagnifyingGlass, className || "w-4 h-4")
);

export const XMarkIcon = ({ className }: { className?: string }) => (
    renderIcon(HiOutlineXMark, className || "w-4 h-4")
);


export const DDG_PARAGRAPH_5_TEXT = `Digitale-Dienste-Gesetz * (DDG)
§ 5 Allgemeine Informationspflichten
(1) Diensteanbieter haben für geschäftsmäßige, in der Regel gegen Entgelt angebotene digitale Dienste folgende Informationen, die leicht erkennbar und unmittelbar erreichbar sein müssen, ständig verfügbar zu halten:1.
den Namen und die Anschrift, unter der sie niedergelassen sind, bei juristischen Personen zusätzlich die Rechtsform, den Vertretungsberechtigten und, sofern Angaben über das Kapital der Gesellschaft gemacht werden, das Stamm- oder Grundkapital sowie, wenn nicht alle in Geld zu leistenden Einlagen eingezahlt sind, der Gesamtbetrag der ausstehenden Einlagen,
2.
Angaben, die eine schnelle elektronische Kontaktaufnahme und eine unmittelbare Kommunikation mit ihnen ermöglichen, einschließlich der Adresse für die elektronische Post,
3.
soweit der Dienst im Rahmen einer Tätigkeit angeboten oder erbracht wird, die der behördlichen Zulassung bedarf, Angaben zur zuständigen Aufsichtsbehörde,
4.
die Angabe des Handelsregisters oder ähnlicher Register, in das sie eingetragen sind, und die entsprechende Registernummer,
5.
soweit der Dienst angeboten oder erbracht wird in Ausübung eines Berufs im Sinne von Artikel 1 Buchstabe d der Richtlinie 89/48/EWG des Rates vom 21. Dezember 1988 über eine allgemeine Regelung zur Anerkennung der Hochschuldiplome, die eine mindestens dreijährige Berufsausbildung abschließen (ABl. L 19 vom 24.1.1989, S. 16), oder im Sinne von Artikel 1 Buchstabe f der Richtlinie 92/51/EWG des Rates vom 18. Juni 1992 über eine zweite allgemeine Regelung zur Anerkennung beruflicher Befähigungsnachweise in Ergänzung zur Richtlinie 89/48/EWG (ABl. L 209 vom 24.7.1992, S. 25; L 17 vom 25.1.1995, S. 20), die zuletzt durch die Richtlinie 2006/100/EG (ABl. L 363 vom 20.12.2006, S. 141) geändert worden ist, Angaben übera)
die Kammer, der die Diensteanbieter angehören,
b)
die gesetzliche Berufsbezeichnung und den Staat, in dem die Berufsbezeichnung verliehen worden ist,
c)
die Bezeichnung der berufsrechtlichen Regelungen und die Angabe, wie diese Regelungen zugänglich sind,
6.
in Fällen, in denen sie eine Umsatzsteueridentifikationsnummer nach § 27a Absatz 1 Satz 1, 2 oder 3 des Umsatzsteuergesetzes oder eine Wirtschafts-Identifikationsnummer nach § 139c Absatz 1 der Abgabenordnung besitzen, die Angabe dieser Nummer,
7.
bei Aktiengesellschaften, Kommanditgesellschaften auf Aktien und Gesellschaften mit beschränkter Haftung, die sich in Abwicklung oder Liquidation befinden, die Angabe hierüber,
8.
bei Anbietern von audiovisuellen Mediendiensten die Angabea)
des Mitgliedstaats, der für sie Sitzland ist oder als Sitzland gilt sowie
b)
der zuständigen Regulierungs- und Aufsichtsbehörden.
(2) Weitergehende Informationspflichten nach anderen Rechtsvorschriften bleiben unberührt.
`;

export const DSGVO_ART_13_TEXT = `
Für einen datenschutzkonformen Internetauftritt gibt es einiges zu beachten. Zum Beispiel ist eine rechtskonforme Datenschutzerklärung verpflichtend, die die Angaben beinhalten muss, die die DSGVO vorschreibt.
1. Webseiten unterliegen Anforderungen der DSGVO und des TDDDG
2. Tipps für gängige Website-Techniken und Tools
3. Website-Hosting und Hoster
4. SSL-Verschlüsselung (https)
5. Log-Dateien auf dem eigenen Server
6. Kontaktformulare in der Website
7. Tracking- und Analyse-Software
8. Social Media Plugins wie Facebook & Twitter
9. Eingebundene Videos von Youtube & Vimeo
10. Cookies und Cookie-Hinweise
11. Externe Schriften und Dateien wie z. B. Google Fonts
12. Datenschutzerklärung
13. Datenweitergabe an externe Dienstleister
13. Datenverarbeitungsverträge mit Auftragsverarbeitern
Zusammenfassung
Stand: Mai 2024
Die folgenden Tipps sollen Unternehmen und Webseiten-Betreibern bei der Anpassung ihres Webauftritts an die Vorgaben der DSGVO helfen.
1. Webseiten unterliegen Anforderungen der DSGVO und des TDDDG
Die Regeln der DSGVO (Datenschutzgrundverordnung) gelten seit dem 25. Mai 2018 einheitlich für alle im EU-Raum aktiven Unternehmen. Dies bedeutet: Soweit nicht Spezialregelungen greifen, sind die erhöhten Anforderungen der DSGVO zu beachten. Bei Missachtung der Datenschutzbestimmungen drohen empfindliche Geldstrafen von bis zu 20 Millionen Euro. Internetseiten unterliegen den datenschutzrechtlichen Bestimmungen, da dort stets personenbezogene Daten (z. B. eine IP-Adresse) verarbeitet werden. Dabei ist wichtig: Nach dem Datenschutzrecht ist eine Verarbeitung von Daten natürlicher Personen zunächst generell verboten, es sei denn ein Gesetz erlaubt dies ausdrücklich.
Neu: Das Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG)
Seit Mitte Mai 2024 ist das Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG) zu beachten, das das seit Dezember 2021 geltende TTDSG ablöst. Inhaltlich hat sich dadurch aber nichts geändert. Damit sollen die Privatsphäre und Vertraulichkeit von Endeinrichtungen geschützt werden, welche Endnutzer verwenden. Dabei ist wichtig: Der Schutzbereich umfasst alle Informationen (personenbezogene wie nicht-personenbezogene) und findet Anwendung bei allen Personen (natürlichen wie juristischen).
Den Vorgaben des TDDDG unterliegen digitale Dienste wie z. B. Websites, Online-Angebote, über die direkt Waren bzw. Dienstleistungen bestellt werden können, Internetsuchmaschinen und sog. Over-the-top-Dienste (OTT-Dienste) wie z. B. VoIP-Telefonie, Messenger-Dienste, Chat-Funktionen eines Online-Angebots, Videokonferenzsysteme und webbasierte E-Mail-Dienste.
„Anbieter von digitalen Diensten“ ist jede natürliche oder juristische Person, die Dienstleistungen der Informationsgesellschaft erbringt, d. h. jede in der Regel gegen Entgelt elektronisch im Fernabsatz und auf individuellen Abruf eines Empfängers erbrachte Dienstleistung.
Keine „digitalen Dienste“ in diesem Sinne sind Dienste, die der Kunde vor Ort an einem Gerät in Anspruch nimmt (z. B. elektronischer Katalog im Geschäft oder am Flugticketautomaten), nicht „elektronisch“ erbrachte Dienste (z. B. Bankomat, Fahrkartenautomat, Mautstellen, Offlinedienste) und nicht „auf individuellen Abruf eines Empfängers“ erbrachte Dienste (z. B. Fernseh-, Hörfunkdienste).
Stellen Anbieter digitale Dienste zur Verfügung, so haben sie für diese Online-Angebote zudem das TDDDG (früher: TTDSG) zu beachten.
Bei Missachtung des TDDDG drohen Geldbußen von bis zu 300.000 Euro. Die Bußgeldsanktionen nach DSGVO und TDDDG stehen gleichberechtigt nebeneinander, können damit gleichzeitig von einer Datenschutzaufsichtsbehörde angewendet werden.
Für einen datenschutzkonformen Internetauftritt gibt es einiges zu beachten. Zum Beispiel ist eine rechtskonforme Datenschutzerklärung verpflichtend, welche die nach DSGVO erweiterten Angaben beinhalten muss.
Nach dem TDDDG haben Anbieter für ihre digitalen Dienste (z. B. Website-Anbieter) Folgendes zu beachten:
Technische und organisatorische Vorkehrungen (§ 19 TDDDG) Diese umfassen:
den Schutz der Nutzer gegen Kenntnisnahme Dritter
die Möglichkeit, einen genutzten Dienst jederzeit beenden zu können
die Möglichkeit einer anonymisierten oder pseudonymisierten Dienstenutzung, soweit dies technisch möglich und zumutbar ist
Anzeigepflicht, bevor eine Verantwortliche Stelle (z. B. ein Websitebetreiber) Nutzer zu einem anderen Anbieter digitaler Dienste weiterleitet
Grundsätzlich besteht eine Einwilligungspflicht bei einem Zugriff auf ein Endgerät, sofern
Informationen in einer Endeinrichtung eines Nutzers gespeichert oder auf die dort gespeicherten Informationen zugegriffen wird und
keine der beiden Ausnahmen des § 25 Abs. 2 TDDDG greift, d. h. alleiniger Zweck des Zugriffs auf oder der Speicherung der Informationen in Endeinrichtungen betrifft die Übertragung der Nachricht über ein öffentliches Telekommunikationsnetzwerk oder Informationen (via Cookies und vergleichbaren Technologien eingeholt) sind unbedingt erforderlich, damit ein Anbieter eines digitalen Dienstes einen vom Nutzer ausdrücklich gewünschten digitalen Dienst zur Verfügung stellen kann.
Praxistipp: 2-Stufen-Prüfung
Stufe 1: Prüfung nach TDDDG – Speichern von und Zugriff auf Informationen (personenbezogene wie nicht-personenbezogene) in Endeinrichtungen:
Besteht Einwilligungspflicht oder Einwilligungsfreiheit nach TDDDG?
Stufe 2: Prüfung nach DSGVO
Entspricht die Verarbeitung der so gewonnenen personenbezogenen Daten der DSGVO (u. a. auf welche Rechtsgrundlage wird die Datenverarbeitung gestützt?).
Digitale Dienste - Prüfschritte und Vorgehensweise
Verschaffen Sie sich einen Überblick über Zugriffe auf Endeinrichtungen.
Bewerten Sie die Dienste neu gem. TDDDG (1. Stufe):
Grundsatz der Einwilligungspflicht (§ 25 Abs. 1 TDDDG)
Prüfen Sie, ob Ausnahmen von der Einwilligungspflicht einschlägig sind (§ 25 Abs. 2 TDDDG): nur bei technisch notwendigen Cookies und vergleichbaren Technologien
Sicht des Nutzers maßgeblich bei „technisch notwendig“: Dieser Maßstab gilt auch für Sicherheits-Cookies/vergleichbare Technologie
Alleiniger Zweck? Vorsicht bei Mehrzweckcookies
Unbedingt erforderlich? – Ausnahme greift nur für diese Zugriffe
Kein Abgleich mit anderen Verarbeitungen
Gültigkeitsdauer begrenzen
Datenschutzerklärung, ggf. Consent-Banner anpassen
Beispiele für notwendige Cookies
klassische Session-Cookies (Warenkorb, User-Input), Authentifizierung, Anpassung der Benutzeroberfläche, Sicherheit
Beispiele für nicht notwendige Cookies
Tracking-Cookies (Verfolgung des Nutzerverhaltens für Marketingzwecke im Internet), Cookies zur Reichweitenmessung und Websiteoptimierung; Cookies zur Einbindung von Drittinhalten oder Drittdiensten
2. Tipps für gängige Website-Techniken und Tools
Die datenschutzrechtlichen Vorgaben der DSGVO gelten, sobald es sich bei den verarbeiteten, insbesondere erhobenen, Daten um personenbezogene Daten handelt. Nach Art. 4 Nr. 1 DSGVO sind alle Informationen personenbezogen, die sich auf eine identifizierbare oder identifizierte natürliche Person beziehen. Zu diesen Daten gehören:
Name und Anschrift
Angaben wie Alter, Geschlecht und Einkommen
Daten über das Surfverhalten wie Suchanfragen und Browserverlauf
IP-Adressen und sonstige User-Daten
E-Mails, Videos und Fotos
Daten, die mithilfe von Tracking-Software entstehen
Bestellverlauf in einem Onlineshop
Im Rahmen der DSGVO müssen Betreiber von Webseiten aller Art ihren Internetauftritt auf Konformität prüfen und gegebenenfalls auch das Newsletter-System, sofern dies in den Internetauftritt integriert ist.
Die datenschutzrechtlichen Vorgaben des TDDDG gelten für Anbieter digitaler Dienste und schützen die Privatsphäre und Vertraulichkeit von Endeinrichtungen. Eine “Endeinrichtung” ist jede direkt oder indirekt an die Schnittstelle eines öffentlichen Telekommunikationsnetzes angeschlossene Einrichtung zum Aussenden, Verarbeiten oder Empfangen von Nachrichten; sowohl bei direkten als auch bei indirekten Anschlüssen kann die Verbindung über Draht, optische Faser oder elektromagnetisch hergestellt werden; bei einem indirekten Anschluss ist zwischen der Endeinrichtung und der Schnittstelle des öffentlichen Netzes ein Gerät geschaltet.
Beispiele:
Zu Endeinrichtungen nach TDDDG gehören u. a. die Kommunikation über das Telefon, die Internetkommunikation über Laptops und sonstige mobile Endgeräte, Smart TV und smarte Anwendungen (IoT).
3. Website-Hosting und Hoster
Unternehmen mit Internetauftritt speichern die dort anfallenden Daten meist nicht auf einem eigenen Server, sondern nutzen den Service eines externen Dienstleisters (IT-Hoster). Der Content auf der Website ist über die Server des Providers öffentlich abrufbar. Alternativ hosten Unternehmen mit eigener IT-Abteilung und Hardware ihren Internetauftritt auf einem eigenen Server.
Im Rahmen des Hostings bei einem Provider speichert dieser unter anderem die Inhalte der Website und im Falle eines Onlineshops zudem Kunden- und Zahlungsdaten auf seinen Servern ab. Zum Teil logt dieser auch Tracking-Daten über das Besucherverhalten auf der Website. Daher findet eine Verarbeitung, insbesondere Erhebung und Übermittlung von personenbezogenen Daten statt.
Ist ein Auftragsverarbeitungsvertrag notwendig?
Ja, bei einer Auftragsverarbeitung lässt ein Unternehmen (Verantwortlicher) personenbezogene Daten durch eine andere externe Stelle verarbeiten. Das Unternehmen bestimmt allein über die Zwecke und Mittel der Verarbeitung. Ein IT-Hoster, der im Auftrag eines Unternehmens dessen Daten verarbeitet, insbesondere speichert, zählt zu Auftragsverarbeitern (weisungsgebundene Verarbeitung kundenbezogener Daten). Somit ist ein Vertrag über die Auftragsverarbeitung (AV-Vertrag) zu schließen.
Hinweis: Ebenso gelten Tätigkeiten wie Webdesign, Datenkonvertierung und das Erstellen von Back-ups im Sinne der DSGVO als Auftragsverarbeitung. Nur falls gar keine personenbezogenen Daten verarbeitet (z. B. erhoben) werden, handelt es sich nicht um einen Fall der Auftragsverarbeitung und es ist kein AV-Vertrag erforderlich.
Sie betreiben selbst einen Server?
Ein AV-Vertrag ist ebenfalls mit einem Dienstleister zu schließen, den Sie mit der Wartung Ihres Servers beauftragt haben, wenn dieser im Rahmen der Wartung auf personenbezogene Daten zugreifen kann. Die Möglichkeit des Zugriffs reicht bereits aus. Kann hingegen der Zugriff auf die personenbezogenen Daten vollumfänglich ausgeschlossen werden, liegt keine Auftragsverarbeitung vor.
4. SSL-Verschlüsselung (https)
§ 19 Abs. 4 TDDDG regelt, dass Sicherheits-Vorkehrungen für digitale Dienste zu treffen sind: „Eine Vorkehrung nach Satz 1 ist insbesondere die Anwendung eines als sicher anerkannten Verschlüsselungsverfahrens.”
Die SSL-Verschlüsselung ermöglicht die sichere Datenübertragung zwischen Client und Server, zum Beispiel sollten die Registrierung und der Einkauf bei einem Onlineshop über eine sichere Verbindung erfolgen.
Zur sicheren Ende-zu-Ende-Datenübertragung zwischen Client und Server eignet sich daher die Möglichkeit zur Verschlüsselung. Empfohlen ist die Verschlüsselung mindestens mittels TLS 1.2 (Verfahren der Verschlüsselung) per https (SSL-verschlüsselte Transportverbindungen). Für die Verschlüsselung muss der Webseitenbetreiber ein SSL-Zertifikat erwerben. In der Regel ist ein solches Zertifikat kostenpflichtig oder im Angebot des Hosting-Providers enthalten.
Alternativ existieren zeitlich befristete Angebote von Dienstleistern, die Sie manuell verlängern müssen. Ein kostenloses und zeitlich limitiertes Zertifikat ist für Betreiber kleiner Websites mit begrenztem Budget interessant. Auf die Vertrauenswürdigkeit des Dienstleisters ist zu achten.
5. Log-Dateien auf dem eigenen Server
Mit Log-Dateien überwachen und protokollieren Webseitenbetreiber die Aktivitäten der Seitenbesucher. Es findet die Speicherung aller Anfragen und Zugriffe auf Unterseiten mit Statusmeldungen statt. Die gesammelten Daten haben für Administratoren großen Wert, denn mithilfe der Log-Dateien lässt sich jeder erfolgreiche und erfolglose Zugriff nachvollziehen. Die Protokollierung ist ein bewährtes Mittel, um Fehler aufzuspüren und zum Beispiel 404-Fehler zu beseitigen (wenn Besucher eine nicht existierende Unterseite öffnen möchten).
Eine Log-Datei dient der Speicherung personenbezogener Daten, genauer werden folgende Daten protokolliert:
Uhrzeit zum Zeitpunkt des Seitenzugriffs
URL der besuchten Website
Menge der übertragenen Daten in Byte
Information über die Quelle, über die Besucher auf die Seite gelangen
Angabe des Browsers
Information zum Betriebssystem
Speicherung der IP-Adresse des Besuchers (in anonymisierter Form)
Die Verarbeitung dieser Daten darf wie auch sonst nur erfolgen, sofern es hierfür eine Rechtsgrundlage gibt.
In der Datenschutzerklärung ist der Besucher der Website über die jeweilige Rechtsgrundlage zu informieren. Dabei gilt: Daten dürfen verarbeitet (insbesondere erhoben und ausgewertet) werden, wenn diese für die Sicherheit und Funktionsfähigkeit einer Website erforderlich sind. Derartige Daten dürfen nicht zur Auswertung der Verhaltensweisen der Besucher oder zur Profilbildung zum Einsatz kommen.
Über die Nutzung der Log-Dateien müssen Sie in der Datenschutzerklärung informieren. Die Erklärung unterrichtet über die Verwendungszwecke der Server-Logfiles und der dort protokollierten Daten.
6. Kontaktformulare in der Website
Das Kontaktformular ist ein verbreiteter Service und vereinfacht Seitenbesuchern die Kontaktaufnahme mit dem Kundenservice des Unternehmens bzw. Betreibers der Website. Da Daten wie Name und Kontaktdaten abgefragt werden, erheben Sie mit einem Kontaktformular persönliche Daten und müssen Seitenbesucher deshalb zu Beginn der Nutzung über Art, Umfang und Zweck der Datenerfassung informieren. Dabei gilt:
Nur notwendige Angaben abfragen (Grundsatz der Datenminimierung)
Bei der Abfrage optionaler Angaben diese als freiwillig kennzeichnen
Übermittlung der Daten möglichst über eine verschlüsselte Datenleitung („https“)
Hinweis zu Kontaktformular in der Datenschutzerklärung
Die Datenverarbeitung, welche über Kontaktformulare auf Websites abgewickelt wird, ist personenbezogenen und damit in der Datenschutzerklärung zu beschreiben. Auf die richtige technische (eine verschlüsselte Datenverbindung) und inhaltliche Umsetzung ist zu achten.
Ferner ist diese einzelne Funktion „Kontaktformular“, welche nicht zum Kernbereich des Online-Angebots zählt, dahin zu prüfen, ob es sich hierbei um einen digitalen Dienst handelt, der ausdrücklich vom Nutzer gewünscht ist und damit einwilligungsfrei (s. o.) zur Verfügung gestellt werden kann.
Lösungsansätze
Die Verarbeitung personenbezogener Daten ist erlaubt, wenn es hierfür eine Rechtsgrundlage (z. B. Vertrag bzw. Vorvertrag oder Einwilligung) gibt (Art. 6 Abs. 1 DSGVO). Wie bisher sollte das Versenden der personenbezogenen Daten angemessen verschlüsselt per https erfolgen. Die Verschlüsselung über das SSL-Protokoll sollte dem aktuellen Stand der Technik entsprechen und mindestens per TLS 1.2 erfolgen.
7. Tracking- und Analyse-Software
Mithilfe von Tracking- und Analyse-Software wie Google Analytics und Matomo (ehemals Piwik) lernen Websitebetreiber viel über die Besucher ihrer Website und können ihren Internetauftritt zielgruppenspezifisch optimieren.
Ist Software wie Google Analytics oder Matomo auf Ihrer Website aktiv, werden personenbezogene Daten (IP-Adressen) an Dritte übertragen. Damit sind die Datenschutzbestimmungen zu beachten. Um die Dienste rechtskonform zu gestalten, müssen Sie Folgendes beachten:
Die Aufsichtsbehörden haben sich bundesweit dahin verständigt, dass Dienste zur statistischen Analyse nicht unbedingt erforderlich und damit nach TDDDG einwilligungspflichtig sind. Für eine Weiterverarbeitung dieser Daten benötigen verantwortliche Stellen ebenfalls eine Rechtsgrundlage (z. B. Einwilligung, Vertrag).
Die Tracking-Tools zur reinen Reichweitenmessung (Auswertung: ausschließlich das Nutzerverhalten auf der Website für den Websitebetreiber) werden nunmehr einwilligungspflichtig. Die Orientierungshilfe der Konferenz der unabhängigen Datenschutzaufsichtsbehörden des Bundes und der Länder (DSK) vom 20.12.2021 führt hierfür eine Vielzahl von Begründungen auf, ohne konkrete Beispielsfälle für eine noch einwilligungsfreie reine Reichweitenmessung nach TDDDG (vormals TTDSG) zu nennen. Rechtsgrundlage hierfür ist § 25 Abs. 1 TDDDG.
Die Tracking-Tools, die nicht nur das reine Nutzerverhalten auf der Website tracken, sondern zudem ein umfassendes "Internetprofil" eines Websitenutzers erstellen, dürfen wie bereits bisher nur mit einer Einwilligung der Nutzer eingesetzt werden. Rechtsgrundlage hierfür ist § 25 Abs. 1 TDDDG.
Praxistipps
Einholung einer Einwilligung über ein Consent-Banner (ggf. auch für die auf eine Einwilligung gestützte Weiterverarbeitung dieser Daten)
Information über die Rechtsgrundlagen in der Datenschutzerklärung
Dokumentation der Rechtsgrundlagen in der Verarbeitungsbeschreibung im Verzeichnis von Verarbeitungstätigkeiten
Eine wirksame Einwilligung setzt voraus, dass die Nutzer vorab über die geplante Verarbeitungstätigkeit vollständig informiert werden und aktiv zustimmen. Vielfach dürfte eine Einwilligung nicht wirksam eingeholt werden können, weil Websitenbetreiber nicht wissen und damit Websitenbesucher auch nicht darüber informieren können, welche Daten genau ein Tracking-Tool-Dienstleister zu welchen Zwecken verarbeitet ("freiwillige informierte Einwilligung").
Google Analytics
Die Konferenz der unabhängigen Datenschutzaufsichtsbehörden des Bundes und der Länder (DSK) hat mit Beschluss vom 12.05.2020 den Einsatz von Google Analytics neu bewertet. Die DSK hat klargestellt, dass Google Analytics so weiterentwickelt wurde, dass Google hierüber für eigene Zwecke Daten (z. B. Nutzerdaten oder personenbeziehbare Gerätedaten) erhebt und verarbeitet. Damit agiert Google nicht mehr wie ein Auftragsverarbeiter. Die DSK sieht Google und den Anwender von Google-Analytics als zwei gemeinsam für die Verarbeitung Verantwortliche an. Die DSK fordert, dass Google hierfür einen Joint Controllership-Vertrag nach Art. 26 DSGVO anbietet, der die Verantwortlichkeit beider Parteien regelt. Google sieht sich bei Google Analytics partiell als Auftragsverarbeiter und bietet Anwendern einen Vertrag über Auftragsverarbeitung an.
Weitere Informationen finden Sie in der Pressemitteilung des Bayerischen Landesamts für Datenschutzaufsicht vom 15. November 2019.
8. Social Media Plugins wie Facebook & Twitter
Social Media Plugins wie der Like- und Share-Button von Facebook kommen auf Webseiten aller Art zum Einsatz. Die Betreiber erhoffen sich dadurch eine Vergrößerung der Reichweite und mehr Traffic, da Seitenbesucher die Inhalte „liken“ und mit ihrem sozialen Netzwerk teilen.
Datenschützer stören sich schon seit einiger Zeit an dem Datenhunger der Plugins. Die Plugins verarbeiten personenbezogene Daten und erstellen Persönlichkeitsprofile. Nutzer werden darüber nicht informiert. Bei jedem Aufruf der Website mit direkt eingebundenem Social Media Plugin verschickt dieses automatisch Daten an den Social-Media-Anbieter. Das geschieht unabhängig davon, ob ein Webseiten-Besucher auf diesem Social-Media-Kanal registriert ist oder nicht. Das Problem ist, dass Daten über Seitenbesucher bereits beim Laden der Website erfasst und übertragen werden.
Lösungen
Für die rechtssichere Einbindung der Social Media Plugins sind drei Varianten empfohlen.
Die Shariff-Lösung
Diese Lösung ist eine Weiterentwicklung der 2-Klick-Lösung. Ein Skript ruft ab, wie häufig eine Seite getwittert oder „geliked“ wurde. Dabei erfolgt eine Übertragung der IP-Adresse des Webseiten-Servers und nicht der IP-Adresse des Rechners des Besuchers. Eine Verbindung zwischen den Social-Media-Anbietern und Seitenbesuchern findet erst statt, wenn diese aktiv werden und die Plugins aktiv nutzen (z. B. durch Anklicken). Die Social-Media-Buttons von Shariff schützen die Privatsphäre der Besucher so gut wie das 2-Klick-Verfahren, bei diesen ist jedoch kein zweiter Klick nötig. Bei den Schaltflächen handelt es sich um HTML-Links, die Sie mit CSS individuell gestalten können.
Die 2-Klick-Lösung
Bei dieser Variante muss der Seitenbesucher erst ein Symbol anklicken, um dieses Social Media Plugin zu aktivieren. Um das Social Media Plugin zu nutzen, muss der Webseiten-Besucher ein weiteres Mal darauf klicken. Erst dann werden seine Nutzerdaten an den Social Media-Anbieter übertragen.
Vollständiger Verzicht
Ein Verzicht auf die Social Media Plugins ist die einfache Lösung, für Webseitenbetreiber aufgrund der verminderten Marketing-Möglichkeiten jedoch nicht attraktiv.
9. Eingebundene Videos von Youtube & Vimeo
Neben Bildern eignen sich Videos besonders gut für die Gestaltung von Internetseiten und die Bereitstellung von Informationen. Die Einbindung von Videos in Webseiten sollte datenschutzkonform erfolgen.
Wie bei den Social Media Plugins speichert eine Internetseite mit eingebundenem Video die IP-Adresse des Nutzers bereits beim Laden der Seite. Die Speicherung erfolgt unabhängig davon, ob der Besucher das Video anklickt oder nicht. Da IP-Adressen zu den personenbezogenen Daten gehören, sind die Datenschutzvorgaben zu beachten. Allerdings ist in diesen Fällen die Datenschutzkonformität nur schwer herstellbar.
Die Einbettung von Videos auf Drittseiten im Wege des „Framing“ ermächtigt Youtube, dort im großen Stil Nutzerdaten zu erheben und auszuwerten. Bei Verwendung der Standard-HTML-Codes werden im jeweiligen Nutzersystem bereits bei Aufruf der Website, die das eingebettete Video beinhaltet, diverse einwilligungspflichtige Cookies gesetzt sowie eine Verbindung zum Google-Werbenetzwerk aufgenommen.
Weil Youtube die Datenverarbeitungsprozesse hinsichtlich Umfang und Zielsetzung allerdings weitgehend verschleiert, ergeben sich nicht nur Probleme bei der rechtskonformen Umsetzung der Informationspflichten nach der DSGVO. Auch die Einwilligungspflicht für technisch nicht notwendige Cookies und die notwendige Widerrufsmöglichkeit müssen rechtskonform sein, was schwierig in der Umsetzung ist.
Die von Youtube bereitgestellte Funktion der Einbettung im sogenannten „erweiterten Datenschutzmodus“ löst nur teilweise die rechtlichen Probleme. Sie reduziert den Aufklärungsumfang und kann zumindest für Youtube-Cookies eine Einwilligungslösung bieten. Dennoch ist für den Einwilligungswiderruf und für DoubleClick-Cookies ein wirksames Cookie-Einwilligungsmanagement notwendig.
Weitere Informationen dazu finden Sie im Artikel “Einbettung von Youtube-Videos im Webshop (Update)” der IT-Recht Kanzlei München.
10. Cookies und Cookie-Hinweise
Heute nutzen fast alle Webseiten Cookies. Cookies sind kleine Textdateien, die Informationen auf dem Rechner eines Webseitenbesuchers ablegen. Mithilfe von Cookies lassen sich Besucher identifizieren und wiedererkennen. So müssen Besucher zum Beispiel nicht bei jedem Seitenbesuch die Anmeldedaten erneut eingeben, wenn in deren Browser ein entsprechendes Cookie gesetzt ist. Nicht jede Website benötigt ein Cookie-Banner. Dies ist nur dann der Fall, wenn Cookies und sonstige Technologien (z. B. Fingerprinting) verwendet werden, für deren Einsatz vorab eine Einwilligung des Websitebesuchers eingeholt werden muss.
Mithilfe der Cookies werden personenbezogene Daten erhoben, deren Verarbeitung meist ohne Zustimmung der Seitenbesucher nicht erlaubt ist. § 25 TDDDG ist immer zu prüfen, wenn Technologien eingesetzt werden, die Informationen aus Endeinrichtungen auslesen oder auf diesen speichern.
Zunächst ist nach der Art des Cookies zu unterscheiden. Hierbei gilt:
Cookies sind einwilligungsfrei zulässig, soweit diese aus Nutzersicht unbedingt, d. h. technisch (nicht: wirtschaftlich) erforderlich sind.
Beispiele für notwendige Cookies: Seitennavigation, Warenkorbfunktion im Online-Shop.
Der Einsatz von nicht notwendigen Cookies ist nach TDDDG einwilligungspflichtig.
Beispiel hierfür sind Tracking-Cookies, über die webseiten- oder geräteübergreifende Nutzungsprofile erstellt oder Daten an Dritte übermittelt werden. Seitenbetreiber haben für nicht notwendige Cookies stets vorab (z. B. über ein Cookie-Banner) die Einwilligung der Nutzer einzuholen.
11. Externe Schriften und Dateien wie z. B. Google Fonts
Die Einbindung derartiger externer Schriften und Dateien ist nach § 25 Abs. 1 TDDDG einwilligungspflichtig. Neben den Standardschriften gibt es tausende weiterer Schriften, die online kostenlos oder kostenpflichtig angeboten werden. Ein Anbieter solcher Schriften ist Google mit den Google Fonts.
Wenn auf einer Website externe Schriften wie Google Fonts zum Einsatz kommen, werden diese üblicherweise beim Laden der Seite vom Google Server nachgeladen und es findet ein Datenaustausch zwischen der Website und Google statt. Die Datenübermittlung ist aus Datenschutzsicht bedenklich. Die Lösung: Externe Schriften müssen nicht von einem Server nachgeladen werden, sie können alternativ lokal auf dem eigenen Server gespeichert sein. Webseitenbetreiber müssen zunächst die benötigten Schriften identifizieren, können diese anschließend herunterladen und auf den eigenen Server hochladen. Im Anschluss passen Sie den CSS-Code entsprechend an und tragen die neue Quelle der Fonts ein.
Werden Webfonts nicht rechtskonform eingebunden, können Betroffene Schadenersatz wegen Verletzung des Datenschutzrechts fordern. Dies hat das Landgericht München I mit Urteil vom 20.01.2022 (Az. 3 O 17493/20) so entschieden. Bekommen Sie als Unternehmer Schadenersatzforderungen, welche sich auf dieses Urteil stützen, sollten Sie prüfen, ob Sie der Zahlungsaufforderung Folge leisten und/oder ggf. anwaltliche Hilfe zu Rate ziehen.
Prüfkriterien, ob die Schadenersatzforderung berechtigt ist:
Stimmen die Angaben in der Zahlungsaufforderung? D. h. setzen Sie Webfonts (z. B. Google Fonts) auf Ihrer Website nicht rechtskonform ein?
Dann sollten Sie die Website umgehend anpassen (Bitte auch die Datenschutzerklärung). Prüfen Sie, ob es rechtskonforme Alternativen gibt, welche ggf. eingesetzt werden könnten.
Leistet man der Zahlung Folge?
Dann sollten Sie vorab, die Höhe des Schadenersatzes klären und eine umfassende Anspruchsabgeltung vereinbaren.
Besteht ausnahmsweise Verdacht auf Rechtsmissbrauch? Dann können Sie sich an Ihre örtlich zuständige IHK oder auch den Deutschen Schutzverband gegen Wirtschaftskriminalität e.V. (DSW) wenden. Indiz für einen Rechtsmissbrauch kann z. B. eine als Serienbrief erscheinende Zahlungsaufforderung in Höhe von 100 Euro mit kurzer Fristsetzung sein.
Bitte beachten Sie: Sollten Sie eine Abmahnung wegen des Datenschutzverstoßes erhalten, die eine Unterlassungserklärung fordert, müssen Sie den Datenschutzverstoß erst beseitigen, bevor Sie eine Unterlassungserklärung mit Vertragsstrafe-Versprechen unterzeichnen. Ansonsten riskieren Sie neben dem Schadenersatz auch noch die Zahlung der Vertragsstrafe.
Von der Datenschutzverletzung Betroffenen steht es zudem frei, den Sachverhalt unabhängig von einer Zahlung der zuständigen Datenschutzaufsicht zu melden, also sich über den Rechtsverstoß zu beschweren, oder das Unternehmen zu verklagen.
12. Datenschutzerklärung
Jede Website muss über ein Impressum und eine Datenschutzerklärung verfügen, sobald diese personenbezogene Daten verarbeitet. Die Erklärung informiert Besucher der Website ausführlich über die Art und Weise der Verarbeitung (z. B. Erheben, Auswerten) der personenbezogenen Daten sowie über die Verarbeitungszwecke.
Bereits sehr einfache Webseiten verarbeiten personenbezogene Daten, weshalb die Datenschutzregelungen für fast alle Internetauftritte gelten. Ohne korrekte Umsetzung der Bestimmungen droht dem Betreiber der Website ggf. eine Abmahnung und/oder eine Geldbuße. Spätestens seit dem 25. Mai 2018 muss die obligatorische Datenschutzerklärung an die neuen Anforderungen der DSGVO angepasst sein.
Die DSGVO-konforme Datenschutzerklärung muss die nach Artikel 13 DSGVO bestehenden Informationspflichten beachten. Damit ist sie deutlich umfangreicher. Folgende Pflichten müssen umgesetzt sein:
Die Rechtsgrundlage für die Datenverarbeitung muss genannt sein. Es gilt nach wie vor der Grundsatz des Verbots mit Erlaubnisvorbehalt. Personenbezogene Daten dürfen nicht erhoben werden, außer der Nutzer stimmt explizit zu oder das Gesetz gestattet dies.
Gesetzlich zulässige Verarbeitungen (Rechtsgrundlagen) sind in Artikel 6 DSGVO definiert: Die Datenverarbeitung ist zum Beispiel erlaubt, wenn die Daten zur Vertragserfüllung benötigt werden. Zu den Ausnahmen gehört zudem die „Wahrung berechtigter Interessen“.
Auf die Rechtsgrundlage „Wahrung berechtigter Interessen“ lässt sich die Verarbeitung solcher personenbezogener Daten stützen, die für die Gewährleistung der Website-Sicherheit erforderlich sind. Hierzu zählt unter anderem die temporäre Speicherung von IP-Adressen, beispielsweise zum Schutz einer Website vor Angriffen. Die IP-Speicherung sollte in der Regel 7 Tage nicht überschreiten.
Neu sind die Informationspflichten bezüglich der Rechte der Seitenbesucher. Die Datenschutzerklärung muss über alle Rechte Betroffener (z. B. auf Auskunft, auf Berichtigung, Recht auf Beschwerde bei einer Aufsichtsbehörde sowie ein Recht auf Löschung und Einschränkung und ggf. auf Datenübertragbarkeit) geben.
Gibt es in einem Unternehmen einen Datenschutzbeauftragten, muss dieser in der Erklärung genannt und eine Kontaktmöglichkeit gegeben sein. Hierbei reicht eine Funktionsangabe aus, eine namentliche Nennung ist nicht erforderlich.
Im Netz gibt es Datenschutz-Generatoren, mit denen Sie kostenlos eine einfache Datenschutzerklärung für Ihre Website erstellen können.
13. Datenweitergabe an externe Dienstleister
Die Weitergabe von Daten an Dritte ist schnell erfolgt und gilt zum Beispiel schon dann, wenn die Bearbeitung von Rechnungen in der Cloud eines externen Anbieters stattfindet. Typisch ist die Datenweitergabe auch bei Onlineshops, die in der Regel auf dem Server eines Webseiten-Hosters betrieben werden.
Werden personenbezogene Daten weitergeleitet oder ist eine bloße Möglichkeit der Kenntnisnahme durch Dritte gegeben, handelt es sich um Datenverarbeitungen mit Erlaubnispflicht. Die Weitergabe ist erlaubt, sofern die Weitergabe auf eine Rechtsgrundlage gestützt werden kann.
Das TDDDG sieht eine Anzeigepflicht vor, bevor ein Nutzer zu einem anderen Diensteanbieter weitergeleitet wird.
Im Unternehmensalltag spielen v. a. folgende Rechtsgrundlagen eine Rolle:
Einwilligung
Eine Möglichkeit ist es, die Einwilligung zur Datenweitergabe von den Betroffenen einzuholen. Diese können der Weitergabe nach Art. 6 Abs. 1 Satz 1 lit. a DSGVO zustimmen. Für die Einwilligung gelten jedoch hohe Anforderungen. Diese kann jederzeit widerrufen (damit nicht belastbar) werden.
Vertragserfüllung
Zulässig ist die Weitergabe, falls diese zur Vertragserfüllung erforderlich ist und den Interessen der betroffenen Person entspricht.
Bei berechtigten Interessen an der Weitergabe
Auch ohne Einwilligung und Vertrag kann die Datenweitergabe erlaubt sein. Diese Forderung ist zum Beispiel erfüllt, wenn ein Onlineshop die Kontaktdaten eines Kunden an einen Paketzustelldienst übermittelt, der Kunde vorab hierüber informiert worden ist und nicht widersprochen hat.
Interessen an der Kostensenkung, Gewinnmaximierung, Steigerung der Nutzerfreundlichkeit und Optimierung der Dienste zählen ebenfalls zu den berechtigten Interessen. Bei der Abwägung dieser kommt es auf die Art der Daten, den Zweck der Weitergabe und die möglichen Risiken für Betroffene an. Der Verkauf von Adressen von einem Onlineshop an einen Adressen-Händler ist damit nicht erlaubt.
13. Datenverarbeitungsverträge mit Auftragsverarbeitern
Betreiber von Webseiten nutzen diverse Dienste und Tools, die im Auftrag personenbezogene Daten verarbeiten. Zu den Dienstleistern zählen unter anderem Hosting-Anbieter, Newsletter-Provider und Cloud-Dienste. Viele Anbieter stellen noch keine Verträge zur Auftragsverarbeitung zum Download bereit. Hier finden Sie eine Liste mit AV-Verträgen. Notwendig ist solch ein Vertrag immer, wenn Unternehmen im Auftrag des Webseitenbetreibers Daten verarbeiten und als „Auftragsverarbeiter“ agieren.
Zusammenfassung
Sofern nicht spezialgesetzliche Regelungen greifen, müssen Betreiber von Webseiten bei der Verarbeitung aller personenbezogenen Daten die Bestimmungen der DSGVO und des TDDDG (vormals TTDSG) beachten, bei Nichtbeachtung ist eine Geldbuße eine mögliche Folge. Die Regeln betreffen die Zusammenarbeit mit einem Hosting-Anbieter, die Notwendigkeit der verschlüsselten Datenübertragung, den richtigen Umgang unter anderem mit Log-Dateien, Kontaktformularen, Tracking-Software, und Cookies sowie vergleichbare Technologien (z. B. Fingerprinting). Wichtig ist zudem die Anpassung der obligatorischen Datenschutzerklärung sowie im Falle einer Einwilligungspflicht nach TDDDG der rechtskonformen Implementierung eines sog. Cookie-Banners. Die Datenschutzaufsichtsbehörden bieten Handreichungen sowie Checklisten und Beispielsfälle. Mit Hilfe von sog. Datenschutz-Generatoren können Unternehmen meist kostenlos Datenschutzerklärungen für ihre Website erstellen.
Prüfen Sie, ob Ihre Datenschutzerklärung alle erforderlichen Punkte umfasst. Unsere Checkliste dazu finden Sie als Download auf dieser Seite unter „Weitere Informationen“.
`;

export const APP_LEGAL_IMPRESSUM = `**Impressum**

**Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG):**

Pascal Pander
Bahnhofstraße 39
78532 Tuttlingen

**Kontakt:**

E-Mail: pascalpander@by-dp.de

**Online-Streitbeilegung:**

Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter https://ec.europa.eu/consumers/odr/ finden.
Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`;

export const APP_LEGAL_DATENSCHUTZ = `**Datenschutzerklärung**

**1. Verantwortlicher im Sinne der Datenschutzgesetze**

Pascal Pander
Bahnhofstraße 39
78532 Tuttlingen

E-Mail: pascalpander@by-dp.de

**2. Allgemeines zur Datenverarbeitung**

Wir legen größten Wert auf den Schutz Ihrer Daten und die Wahrung Ihrer Privatsphäre. Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen Daten bei der Nutzung unserer Web-App "Legalgen Ai By Dp" erhoben, verarbeitet und genutzt werden. Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen.

Ihre Daten werden im Rahmen der gesetzlichen Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO), des Telekommunikation-Digitale-Dienste-Datenschutz-Gesetzes (TDDDG) und des Bundesdatenschutzgesetzes (BDSG), verarbeitet.

**3. Hosting und Bereitstellung der Web-App**

Unsere Web-App wird über GitHub Pages gehostet. Beim Aufruf unserer Web-App werden Daten (z. B. IP-Adresse, Zugriffszeit, aufgerufene URL, Browserinformationen) an den Hosting-Anbieter übermittelt und dort gespeichert, um die technische Bereitstellung der Web-App zu ermöglichen.

*   **Dienstanbieter:** GitHub, Inc. (eine Tochtergesellschaft von Microsoft Corporation), 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA.
*   **Zweck:** Bereitstellung der Web-App, Sicherstellung der technischen Funktionalität und Sicherheit.
*   **Rechtsgrundlage:** Unser berechtigtes Interesse an einer sicheren und effizienten Bereitstellung unserer Web-App (Art. 6 Abs. 1 lit. f DSGVO).
*   **Auftragsverarbeitung:** Mit GitHub kann ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO erforderlich sein, sofern GitHub personenbezogene Daten in unserem Auftrag verarbeitet. Weitere Informationen zum Datenschutz bei GitHub finden Sie unter: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement.

**4. SSL-/TLS-Verschlüsselung**

Aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, die Sie an uns senden, nutzt unsere Web-App eine SSL- bzw. TLS-Verschlüsselung. Dies erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und an dem Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.

**5. Erfassung allgemeiner Daten und Informationen (Server-Logfiles)**

Bei jedem Aufruf unserer Web-App erfasst das System automatisiert Daten und Informationen vom Computersystem des aufrufenden Rechners.

Folgende Daten können hierbei erhoben werden:
*   IP-Adresse des Nutzers
*   Datum und Uhrzeit des Zugriffs
*   Name und URL der abgerufenen Datei
*   Informationen über den Browsertyp und die verwendete Version
*   Das Betriebssystem des Nutzers
*   Referrer URL (die zuvor besuchte Seite)
*   Statusmeldungen des Servers

Diese Daten werden in Logfiles des Servers gespeichert. Eine Speicherung dieser Daten zusammen mit anderen personenbezogenen Daten des Nutzers findet nicht statt.

*   **Zweck:** Die Speicherung in Logfiles dient der Sicherstellung der Funktionsfähigkeit der Web-App, der Optimierung unserer Web-App und zur Gewährleistung der Sicherheit unserer informationstechnischen Systeme (z. B. zur Abwehr von Angriffen). Eine Auswertung der Daten zu Marketingzwecken findet in diesem Zusammenhang nicht statt.
*   **Rechtsgrundlage:** Unser berechtigtes Interesse an der Gewährleistung der Sicherheit und Stabilität unserer Web-App (Art. 6 Abs. 1 lit. f DSGVO).
*   **Speicherdauer:** Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind. Im Falle der Speicherung der Daten in Logfiles ist dies in der Regel nach spätestens sieben Tagen der Fall. Eine darüberhinausgehende Speicherung ist möglich, in diesem Fall werden die IP-Adressen der Nutzer anonymisiert, sodass eine Zuordnung des aufrufenden Clients nicht mehr möglich ist.

**6. Einsatz von Cookies und vergleichbaren Technologien**

Wir verwenden auf unserer Web-App Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.

*   **Art der Cookies:** Wir setzen ausschließlich technisch notwendige Cookies ein. Diese sind erforderlich, um Ihnen eine funktionsfähige und sichere Nutzung unserer Web-App zu ermöglichen (z. B. für die Session-Verwaltung).
*   **Einwilligungsfreiheit:** Da es sich um technisch notwendige Cookies handelt, ist gemäß § 25 Abs. 2 TDDDG keine gesonderte Einwilligung erforderlich. Aus diesem Grund ist auf unserer Web-App auch kein Cookie-Banner implementiert.
*   **Zweck:** Sicherstellung der grundlegenden Funktionen unserer Web-App.
*   **Rechtsgrundlage:** Unser berechtigtes Interesse an der technischen Bereitstellung einer funktionierenden Web-App (Art. 6 Abs. 1 lit. f DSGVO) und § 25 Abs. 2 TDDDG.
*   **Widerspruchs-/Löschmöglichkeit:** Die meisten Browser sind so eingestellt, dass sie Cookies automatisch akzeptieren. Sie können die Speicherung von Cookies jedoch deaktivieren oder Ihren Browser so einstellen, dass er Sie benachrichtigt, sobald Cookies gesendet werden. Bitte beachten Sie, dass das Deaktivieren von Cookies die Funktionalität unserer Web-App einschränken kann.

**7. Externe Dienste und Inhalte**

Wir nutzen auf unserer Web-App externe Dienste, um bestimmte Funktionalitäten bereitzustellen oder die Darstellung zu optimieren. Dabei werden Daten an die jeweiligen Drittanbieter übermittelt.

**a) Google Gemini KI-API**
Unsere Web-App "Legalgen Ai By Dp" nutzt die Google Gemini KI-API für die Bereitstellung von KI-Funktionalitäten. Dies beinhaltet die Verarbeitung von Nutzereingaben durch die Google Gemini KI zur Generierung von Inhalten oder zur Beantwortung von Anfragen.

*   **Dienstanbieter:** Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Muttergesellschaft: Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.
*   **Zweck:** Bereitstellung von künstlicher Intelligenz zur Generierung von Texten und zur Interaktion innerhalb der Anwendung.
*   **Verarbeitete Daten:** Nutzereingaben in die KI, die zur Bearbeitung Ihrer Anfrage notwendig sind, sowie technische Daten, die bei der API-Nutzung anfallen (z. B. IP-Adresse, Zeitpunkt des Aufrufs).
*   **Rechtsgrundlage:** Die Verarbeitung erfolgt auf Basis Ihrer freiwilligen Eingabe und zur Erbringung des von Ihnen gewünschten Dienstes (Vertragserfüllung oder vorvertragliche Maßnahmen gemäß Art. 6 Abs. 1 lit. b DSGVO) oder unseres berechtigten Interesses an der Bereitstellung der KI-Funktionalität (Art. 6 Abs. 1 lit. f DSGVO).
*   **Datenübermittlung in Drittländer:** Bei der Nutzung der Google Gemini KI-API kann eine Datenübermittlung in die USA erfolgen. Für die USA besteht kein Angemessenheitsbeschluss der EU-Kommission. Google sichert ein angemessenes Datenschutzniveau durch die Einhaltung von Standardvertragsklauseln der EU-Kommission sowie die implementierten Sicherheitsmaßnahmen zu. Weitere Informationen zum Datenschutz bei Google finden Sie unter: https://policies.google.com/privacy.
*   **Auftragsverarbeitung:** Sofern Google in unserem Auftrag personenbezogene Daten verarbeitet, liegt ein entsprechender Auftragsverarbeitungsvertrag vor oder wird angestrebt.

**b) Tailwind CSS CDN**
Wir verwenden den Tailwind CSS Content Delivery Network (CDN) zur schnellen und effizienten Bereitstellung von Styling-Dateien für das Design unserer Web-App.

*   **Dienstanbieter:** Der CDN-Anbieter kann je nach Implementierung variieren. Häufig werden Dienste wie Cloudflare oder ähnliche genutzt. Beim Abruf werden Daten an Server des CDN-Anbieters übertragen.
*   **Zweck:** Optimierung der Ladegeschwindigkeit und Darstellung unserer Web-App.
*   **Verarbeitete Daten:** Beim Abruf der Styling-Dateien können technische Daten (wie Ihre IP-Adresse und Browserinformationen) an den CDN-Anbieter übermittelt werden.
*   **Rechtsgrundlage:** Unser berechtigtes Interesse an einer attraktiven und nutzerfreundlichen Darstellung unserer Online-Angebote sowie der Optimierung der Web-App-Geschwindigkeit (Art. 6 Abs. 1 lit. f DSGVO).
*   **Datenschutzinformationen des Anbieters:** Spezifische Datenschutzinformationen des zugrundeliegenden CDN-Anbieters können variieren. Es wird davon ausgegangen, dass die Datenverarbeitung primär der technischen Bereitstellung dient und keine umfangreiche Profilbildung stattfindet.

**8. Ihre Rechte als betroffene Person**

Sie haben als betroffene Person nach der DSGVO verschiedene Rechte hinsichtlich Ihrer personenbezogenen Daten:

*   **Recht auf Auskunft (Art. 15 DSGVO):** Sie können eine Bestätigung darüber verlangen, ob personenbezogene Daten, die Sie betreffen, verarbeitet werden; ist dies der Fall, so haben Sie ein Recht auf Auskunft über diese personenbezogenen Daten und auf weitere Informationen.
*   **Recht auf Berichtigung (Art. 16 DSGVO):** Sie haben das Recht, die unverzügliche Berichtigung unrichtiger personenbezogener Daten oder die Vervollständigung unvollständiger personenbezogener Daten zu verlangen.
*   **Recht auf Löschung („Recht auf Vergessenwerden“) (Art. 17 DSGVO):** Sie können die unverzügliche Löschung der Sie betreffenden personenbezogenen Daten verlangen, wenn bestimmte Gründe vorliegen (z.B. wenn die Daten für die Zwecke, für die sie erhoben oder auf sonstige Weise verarbeitet wurden, nicht mehr notwendig sind).
*   **Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO):** Sie können die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten verlangen, wenn bestimmte Voraussetzungen erfüllt sind (z.B. wenn die Richtigkeit der Daten bestritten wird).
*   **Recht auf Datenübertragbarkeit (Art. 20 DSGVO):** Sie haben das Recht, die Sie betreffenden personenbezogenen Daten, die Sie uns bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten und diese Daten einem anderen Verantwortlichen ohne Behinderung zu übermitteln.
*   **Recht auf Widerspruch (Art. 21 DSGVO):** Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten Widerspruch einzulegen, die aufgrund von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt; dies gilt auch für ein auf diese Bestimmungen gestütztes Profiling.
*   **Recht auf Widerruf einer datenschutzrechtlichen Einwilligung (Art. 7 Abs. 3 DSGVO):** Wenn Sie eine Einwilligung zur Verarbeitung Ihrer Daten erteilt haben, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.
*   **Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO):** Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs steht Ihnen das Recht auf Beschwerde bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes, zu, wenn Sie der Ansicht sind, dass die Verarbeitung der Sie betreffenden personenbezogenen Daten gegen die DSGVO verstößt.

**9. Keine Verwendung von Kontaktformularen, Newsletter-Diensten oder Social Media Plugins**

Auf unserer Web-App sind keine Kontaktformulare, Newsletter-Dienste oder Social Media Plugins (wie Facebook Like-Buttons oder Twitter-Schaltflächen) integriert. Dementsprechend werden über solche Funktionen keine personenbezogenen Daten erhoben oder verarbeitet.

**10. Keine Verwendung von Tracking- oder Analyse-Software**

Wir verwenden auf unserer Web-App keine Tracking- oder Analyse-Software wie Google Analytics oder Matomo. Daher werden über solche Dienste keine Daten zu Ihrem Nutzerverhalten erfasst oder an Dritte übermittelt.

**11. Keine Verwendung von eingebetteten Videos (YouTube/Vimeo)**

Es sind keine Videos von Plattformen wie YouTube oder Vimeo direkt in unsere Web-App eingebettet. Somit findet kein direkter Datenaustausch mit diesen Diensten beim Laden unserer Web-App statt.

**12. Änderungen dieser Datenschutzerklärung**

Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Dienste. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.

**Stand:** November 2026`;
