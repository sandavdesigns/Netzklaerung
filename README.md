# NetzKlärung

Internes Fallmanagement für Klärfälle zwischen Netzbetreiber, Messstellenbetreiber und Lieferant. NetzKlärung bündelt Vorgänge, Wiedervorlagen, Outlook-E-Mails, Anlagen und EDIFACT-Nachrichten in einer Oberfläche.

## Funktionen

- Vorgänge als zentraler Arbeitsplatz mit Übergabezusammenfassung, nächster Aktion, offenen Punkten, Journal, Dokumenten und vollständiger Bearbeitung
- persönliche Anmeldung, Benutzerverwaltung sowie Benutzerwechsel durch Abmelden/Neuanmelden
- dauerhafte SQLite-Datenbank und Anlagenablage in einem Docker-Volume
- Drag-and-drop-Ablage von Outlook-Nachrichten (`.msg` und `.eml`) einschließlich ihrer Anlagen
- Screenshots, Bilder, PDF-, Text-, CSV- und Excel-Dateien direkt am Vorgang; Screenshots können auch mit `Strg+V`/`Cmd+V` eingefügt werden
- Navision-CSV-Import für Marktpartner mit Dublettenabgleich und Kontaktzuordnung
- bearbeitbare Mailvorlagen pro Vorgang zum Kopieren oder Öffnen im lokalen E-Mail-Programm
- optionaler Abruf eines zentralen Funktionspostfachs über Microsoft Graph
- automatische Erkennung von EDIFACT-Anlagen
- menschenlesbare Übersicht für UTILMD, MSCONS, APERAK, CONTRL, INVOIC, REMADV, ORDERS, ORDRSP, ORDCHG, PARTIN, PRICAT, REQOTE, QUOTES, COMDIS, IFTSTA, INSRPT und UTILTS
- generische Segmentdarstellung für unbekannte oder zukünftige EDIFACT-Nachrichtentypen
- Syntaxprüfungen für UNB/UNZ, UNH/UNT und Segmentzähler

Die fachliche Ansicht ersetzt keine zertifizierte AHB-Prüfung. Sie übersetzt sämtliche korrekt strukturierten EDIFACT-Nachrichten in Segmente und Fachobjekte; formatversionsgenaue Mussfeld- und Prüfidentifikatorregeln sollten später als versionierte Regelpakete ergänzt werden.

## Vorgang als Arbeitsplatz

Beim Öffnen eines Vorgangs erscheint ein eigener Arbeitsbereich. Der Block **Was ist hier gerade los?** dient als kurze Übergabe für den nächsten Arbeitstag, Urlaub oder eine Vertretung. Daneben werden nächste Aktion, Wiedervorlage, Status, Priorität, Bearbeiter und Eskalationsstufe geführt.

Für die fachliche NB-Bearbeitung stehen unter anderem folgende Angaben zur Verfügung:

- Prozessbezug wie WiM-Werte, GPKE-Zuordnung, Gerätewechsel, Stammdaten, Bilanzierung oder Netznutzungsabrechnung
- MaLo/MeLo, Zählernummer, Marktpartner, Sparte, Prüfidentifikator und Prozess-/Nachrichtenreferenz
- Ausgangssachverhalt, ermittelte Ursache und erwartete Lösung
- offene Punkte mit Zuständigkeit und Fälligkeit
- Ansprechpartner, letzter Kontakt, E-Mails, Screenshots und Dokumente
- Journal für Notizen, Telefonate, E-Mail-Rückmeldungen und Entscheidungen

Änderungen an zentralen Steuerungsfeldern und erledigte Aufgaben werden automatisch im Journal protokolliert.

## Anmeldung und Benutzer

Beim ersten Start fordert NetzKlärung zur Anlage des ersten Administratorkontos auf. Administratoren können danach unter ihrem Benutzermenü weitere Konten als Sachbearbeitung oder Administration anlegen und deaktivieren. Jeder Mitarbeiter meldet sich persönlich an; **Abmelden / Benutzer wechseln** beendet die aktuelle Sitzung. Sitzungen laufen nach acht Stunden ab.

`AUTH_SECRET` muss in Portainer als langer, zufälliger und dauerhaft gleichbleibender Wert gesetzt werden. Wird der Wert geändert, werden bestehende Sitzungen ungültig. Bei HTTPS sollte `COOKIE_SECURE=true` gesetzt werden.

## Portainer-Installation

1. In Portainer unter **Stacks** einen neuen Stack anlegen.
2. Als Build-Quelle dieses Git-Repository auswählen oder den Inhalt von `docker-compose.yml` verwenden.
3. Bei einem Git-Stack **Re-pull image** beziehungsweise **Pull latest image** deaktiviert lassen. Das Image wird aus dem `Dockerfile` gebaut und nicht aus Docker Hub geladen.
4. Unter **Environment variables** mindestens `PORT` festlegen, zum Beispiel `8085`.
5. Einen langen zufälligen Wert als `AUTH_SECRET` setzen. Bei ausschließlichem HTTPS-Betrieb zusätzlich `COOKIE_SECURE=true` verwenden.
6. Stack bereitstellen und `http://SERVER:8085` öffnen.
7. Beim ersten Aufruf wird einmalig das erste Administratorkonto angelegt. Danach erfolgt die Anmeldung mit persönlichen Konten.

Der interne Container-Port ist 3000. `PORT` bestimmt ausschließlich den frei wählbaren Port des Docker-Hosts. Das Volume `netzklaerung_data` enthält Datenbank und Anlagen und muss bei Aktualisierungen erhalten bleiben.

Für produktive personenbezogene Mess- und Kommunikationsdaten werden TLS, ein Backupkonzept und ein abgestimmtes Löschkonzept benötigt. Die integrierte Benutzerverwaltung ist für den internen Betrieb gedacht; bei breiterem Einsatz sollte sie später durch Unternehmens-SSO ergänzt werden.

Alternativ lokal:

```bash
cp .env.example .env
docker compose up -d --build
```

## E-Mails und Screenshots ablegen

Der vorgesehene Standardweg benötigt keine Verbindung zum persönlichen Outlook-Postfach:

1. Vorgang öffnen.
2. Eine aus Outlook gezogene oder gespeicherte `.msg`-/`.eml`-Nachricht in **E-Mails, Screenshots & Dateien** ablegen.
3. Nachrichtentext und enthaltene Anlagen stehen anschließend lesbar am Vorgang und in der E-Mail-Ablage zur Verfügung. Enthaltene EDIFACT-Dateien werden zusätzlich im EDIFACT-Leser aufbereitet.

Screenshots und andere Nachweise können in denselben Bereich gezogen werden. Ein Screenshot aus der Zwischenablage lässt sich bei geöffnetem Vorgang mit `Strg+V` beziehungsweise `Cmd+V` einfügen. Bilder und PDFs öffnen sich im Browser; weitere Dateitypen werden kontrolliert heruntergeladen.

Hinweis: Abhängig von Outlook-Version und Browser lässt sich eine Nachricht nicht immer unmittelbar aus dem Outlook-Fenster in eine Webseite ziehen. In diesem Fall die Nachricht kurz als `.msg` oder `.eml` auf dem Desktop speichern/ablegen und diese Datei in NetzKlärung ziehen.

## Optionaler Funktionspostfach-Abruf

Nur wenn zusätzlich ein zentrales Klärfall-Funktionspostfach automatisch eingelesen werden soll, wird eine Microsoft-Entra-App benötigt:

1. App-Registrierung in Microsoft Entra ID erstellen.
2. Microsoft Graph **Application permission** `Mail.Read` hinzufügen und Administratorzustimmung erteilen.
3. Ein Client Secret erzeugen.
4. `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` und `OUTLOOK_MAILBOX` als Portainer-Umgebungsvariablen hinterlegen.
5. Optional `OUTLOOK_FOLDER_ID` auf die ID eines speziellen Klärfall-Ordners setzen; Standard ist `inbox`.

Aus Datenschutz- und Least-Privilege-Gründen sollte der Anwendungszugriff in Exchange auf das benötigte Funktionspostfach begrenzt werden. Die Synchronisierung verwendet Microsoft Graph Delta-Abfragen und speichert den Delta-Link, sodass nach der ersten Synchronisierung nur Änderungen abgerufen werden. `OUTLOOK_SYNC_MINUTES=0` deaktiviert den Hintergrundabruf; der Abruf kann weiterhin über die Oberfläche gestartet werden.

Ohne diese Variablen bleibt die Drag-and-drop-Ablage vollständig nutzbar. E-Mail-Texte werden vor der Anzeige bereinigt. Anlagen werden nur über kontrollierte Anzeige- beziehungsweise Download-Routen bereitgestellt.

## Navision-Marktpartner und Mailvorlagen

Unter **Marktpartner** kann ein Navision-Export als CSV importiert werden. Unterstützt werden Semikolon, Komma und Tabulator sowie UTF-8 und Windows-1252. Übliche Spalten wie `Debitorennr.`, `Firmenname`, `Marktrolle`, `BDEW-Nr.`, `GLN`, `E-Mail`, `Telefon`, `Straße`, `PLZ` und `Ort` werden automatisch erkannt. Mindestens `Name` oder `Firmenname` muss enthalten sein. Wiederholte Importe aktualisieren Partner anhand Navision-Nummer, BDEW-Code oder Name.

Bei geöffnetem Vorgang steht über **Mailvorlage** eine vorausgefüllte Klärungsanfrage zur Verfügung. Enthalten sind Vorgangsnummer, Sparte, MaLo/MeLo, Zählernummer und Sachverhalt. Weitere Vorlagen decken Messwertanforderung, Stammdatenklärung und Erinnerung ab. Empfängeradressen werden aus dem importierten Marktpartnerstamm übernommen. Der Text kann kopiert oder über einen `mailto`-Link im lokalen E-Mail-Programm geöffnet werden; NetzKlärung versendet dabei noch keine Nachricht selbst.

## Daten und Sicherung

Standardpfad im Container: `/data`

- `/data/netzklaerung.sqlite` – Vorgänge, Verlauf, E-Mail-Metadaten und EDIFACT-Auswertungen
- `/data/attachments/` – E-Mail-Anlagen
- `/data/cases/` – Screenshots und sonstige Vorgangsdateien

Für eine Sicherung das Docker-Volume im gestoppten oder konsistent gesicherten Zustand kopieren. Secrets gehören ausschließlich in Portainer-Umgebungsvariablen und nicht in das Repository.

## Entwicklung

```bash
npm install
npm run dev
```

Produktionsprüfung:

```bash
npm run check
npm run build
docker compose build
```
