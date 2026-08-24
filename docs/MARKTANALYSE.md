# Markt- und Nutzenprüfung

Stand: 24. August 2026

## Ergebnis

NetzKlärung ist als **ergänzendes Klärfall- und Arbeitsvorratsportal** sinnvoll, nicht als Ersatz für ein MaKo-, EDM- oder Abrechnungssystem. Der wirtschaftliche Nutzen entsteht an der Schnittstelle, an der strukturierte EDIFACT-Prozesse in manuelle Nachbearbeitung, E-Mail-Rückfragen und systemübergreifende Ursachenklärung übergehen.

Der Bedarf ist am Markt erkennbar: Ein bestehender SAP-basierter MSCONS-Monitor nennt ausdrücklich die aufwendige Verarbeitungschronik, schwierige Stornohandhabung und mehrere parallele Werkzeuge zur Klärfallbearbeitung als Problem. Dessen Leistungsumfang umfasst Zusammenführung, Analyse und Nachverarbeitung. Das bestätigt das Problem, zeigt aber zugleich, dass NetzKlärung über reine Ticketverwaltung hinaus Datenabgleich und Nachverarbeitung unterstützen muss, um dauerhaft wertvoll zu sein. Quelle: [cortility MSCONS-Monitor](https://cortility.de/portfolio/MSCONSMonitor/).

Die dena beschreibt EDIFACT als etablierten, systemübergreifenden Kompromiss in einem Markt mit rund 900 Netzbetreibern und mehr als 1.000 Lieferanten. Unterschiedliche Nachrichtentypen transportieren Mess-, Stamm- und Abrechnungsdaten und lösen automatisierte Folgeprozesse aus. Quelle: [dena – Von Daten zum Mehrwert](https://www.dena.de/fileadmin/dena/Publikationen/PDFs/2024/SET_Pilot_1_Von_Daten_zum_Mehrwert.pdf).

## Aktueller Formatumfang

Seit 1. April 2026 gelten unter anderem neue Versionen von COMDIS, INVOIC, MSCONS, ORDERS, ORDRSP, PARTIN, REMADV und UTILMD Gas. Quelle: [Bundesnetzagentur, Mitteilung 54](https://www.bundesnetzagentur.de/DE/Beschlusskammern/BK06/BK6_83_Zug_Mess/835_mitteilungen_datenformate/Mitteilung_54/Mitteilung_Nr_54.html).

Zum 1. Oktober 2026 werden weitere Versionen verbindlich, darunter APERAK, IFTSTA, INVOIC, MSCONS, ORDCHG, ORDERS, ORDRSP, PARTIN, PRICAT, QUOTES, REQOTE, UTILMD Strom/Gas und UTILTS. Quelle: [Bundesnetzagentur, Mitteilung 56](https://www.bundesnetzagentur.de/DE/Beschlusskammern/BK06/BK6_83_Zug_Mess/835_mitteilungen_datenformate/Mitteilung_56/Mitteilung_Nr_56.html).

NetzKlärung liest diese Nachrichtentypen heute syntaktisch generisch und stellt bekannte Fachobjekte wie Marktpartner, Lokationen, Referenzen, Zeiträume, Mengen, Status- und Fehlercodes menschenlesbar dar. Dadurch bleiben auch unbekannte oder zukünftige Nachrichtentypen zugänglich. Eine verbindliche, versionsgenaue AHB-Prüfung aller Mussfelder, Bedingungen, Prüfidentifikatoren und Entscheidungsbäume ist jedoch ein eigenes Regelwerksprojekt und noch nicht Bestandteil.

## Outlook-Nutzen

Microsoft Graph unterstützt Delta-Abfragen je Mailordner. Damit kann das Portal nach dem Erstimport nur neue, geänderte oder gelöschte Nachrichten abrufen, statt das Postfach bei jedem Lauf vollständig zu lesen. Quelle: [Microsoft Graph – message delta](https://learn.microsoft.com/en-us/graph/api/message-delta?view=graph-rest-1.0).

Das Portal verwendet diesen Mechanismus, speichert den Delta-Link, archiviert E-Mail-Inhalt und Anlagen lokal und erkennt EDIFACT-Anlagen automatisch. Für Produktion sollte der Graph-Anwendungszugriff auf das benötigte Funktionspostfach eingeschränkt werden.

## Geeigneter Pilotumfang

1. Ein Funktionspostfach und ein Team mit fünf bis fünfzehn Bearbeitern.
2. Zunächst drei volumenstarke Fallarten: fehlende Messwerte, unplausible Energiemengen und Stammdaten-/MaLo-MeLo-Abweichungen.
3. Vier bis sechs Wochen Parallelbetrieb ohne automatische Rückschreibungen in führende Systeme.
4. Messung von Durchlaufzeit, Wiedervorlageüberschreitungen, Anzahl manueller Systemwechsel, wiederkehrenden Ursachen und Partnerantwortzeiten.

## Vor einem breiten Produktiveinsatz

- Unternehmens-SSO und rollenbasierte Berechtigungen statt einfachem Basisschutz
- revisionssichere Auditierung, Aufbewahrungs- und Löschkonzept
- Verschlüsselung und Backup des Daten-Volumes
- Konnektoren zu EDM, SAP IS-U/S/4 Utilities oder dem vorhandenen MaKo-System
- versionierte AHB-/MIG-Regelpakete für fachliche Vollprüfung
- Dubletten-, Storno- und Kettenlogik über Nachrichtenreferenzen
- optionaler AS4-Eingang; Outlook ist für Klärkommunikation sinnvoll, aber nicht als Ersatz für den vorgeschriebenen MaKo-Übertragungsweg
- Massendaten- und Lasttests mit realistischen MSCONS-Zählerstandsgängen

## Produktpositionierung

Die stärkste Position ist: **„Ein verständlicher Klärfall-Arbeitsplatz über vorhandenen MaKo- und Backend-Systemen.“** Ein allgemeines Ticketsystem wäre zu schwach; ein vollständiges neues MaKo-System wäre unnötig groß und regulatorisch aufwendig. Der kombinierte Blick auf Vorgang, E-Mail, Anlage und fachlich übersetzte EDIFACT-Nachricht ist die sinnvolle Mitte.
