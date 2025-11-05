# Scripts

Dieses Verzeichnis enthält hilfreiche Scripts für die Verwaltung des Projekts.

## GitHub Repository Creator

### Überblick

Das `create-github-repo.js` Script ermöglicht es dir, neue GitHub-Repositories direkt von der Kommandozeile aus zu erstellen.

### Voraussetzungen

1. **GitHub Personal Access Token**
   - Gehe zu: https://github.com/settings/tokens
   - Klicke auf "Generate new token (classic)"
   - Wähle den `repo` Scope aus
   - Generiere das Token und kopiere es
   - Setze es als Umgebungsvariable: `export GITHUB_TOKEN=dein_token`

### Verwendung

#### Interaktiver Modus (Empfohlen für Anfänger)

```bash
# Mit .env file (Token wird automatisch geladen)
npm run create-repo:interactive

# Oder mit Token inline
GITHUB_TOKEN=your_token npm run create-repo:interactive
```

Das Script fragt dich interaktiv nach allen benötigten Informationen.

#### Basis-Verwendung (Kommandozeile)

```bash
# Repository mit npm script erstellen
GITHUB_TOKEN=your_token npm run create-repo my-new-repo

# Oder direkt mit Node.js
GITHUB_TOKEN=your_token node scripts/create-github-repo.js my-new-repo

# Mit Bash-Wrapper (lädt .env automatisch)
./scripts/create-repo.sh my-new-repo
```

#### Mit Beschreibung

```bash
GITHUB_TOKEN=your_token npm run create-repo my-new-repo -- --description "Mein neues Projekt"
```

#### Privates Repository erstellen

```bash
GITHUB_TOKEN=your_token npm run create-repo my-private-repo -- --private --description "Geheimes Projekt"
```

### Optionen

| Option | Kurzform | Beschreibung | Standard |
|--------|----------|--------------|----------|
| `--description` | `-d` | Repository-Beschreibung | (keine) |
| `--private` | - | Als privates Repository erstellen | false |
| `--public` | - | Als öffentliches Repository erstellen | true |
| `--help` | `-h` | Hilfe anzeigen | - |

### Beispiele

```bash
# Öffentliches Repository mit Beschreibung
GITHUB_TOKEN=xxx npm run create-repo awesome-project -- -d "Ein tolles Projekt"

# Privates Repository
GITHUB_TOKEN=xxx npm run create-repo secret-project -- --private -d "Vertraulich"

# Hilfe anzeigen
npm run create-repo -- --help
```

### Ausgabe

Bei erfolgreicher Erstellung zeigt das Script:
- Repository-Name
- Owner
- Repository-URL
- Clone-URL (HTTPS)
- SSH-URL

### Fehlerbehebung

**Problem:** `GITHUB_TOKEN environment variable is required`
**Lösung:** Setze das GITHUB_TOKEN Environment Variable:
```bash
export GITHUB_TOKEN=your_token_here
```

**Problem:** `401 Unauthorized`
**Lösung:** Überprüfe, ob dein Token gültig ist und den `repo` Scope hat.

**Problem:** Repository existiert bereits
**Lösung:** Wähle einen anderen Namen oder lösche das existierende Repository.

### Sicherheitshinweise

- ⚠️ Teile niemals deinen GitHub Token
- ⚠️ Füge `.env` zur `.gitignore` hinzu
- ⚠️ Verwende Token nur mit den notwendigen Berechtigungen
- ✅ Lösche Token, die du nicht mehr verwendest
