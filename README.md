# Terminbuchung

## Vorbedingungen

Für die Ausführung des Terminbuchungs-Systems werden folgende Komponenten benütigt:

- **.NET 10 SDK**: Für die Backend-Services und Aspire AppHost
- **Node.js 20+**: JavaScript-Runtime für das Angular Frontend
- **Angular CLI**: Für die Frontend-Entwicklung und Build-Prozesse
- **Docker** oder **Podman**: Container-Runtime für PostgreSQL, Service Bus Emulator und andere Infrastruktur-Services
- **dotnet-ef Tool**: Für Entity Framework Migrationen (siehe Datenmigration-Sektion)

### Installation / Inbetriebnahme

```bash
# .NET 10 SDK - Download von https://dotnet.microsoft.com/download
# Node.js - Download von https://nodejs.org/

# Angular CLI installieren bzw. https://www.npmjs.com/package/@angular/cli/v/21.0.0-next.7
npm install -g @angular/cli

# EF Core Tools installieren
dotnet tool install --global dotnet-ef

# Docker Desktop - Download von https://www.docker.com/products/docker-desktop
# ODER Podman - Download von https://podman-desktop.io/downloads

# NPM Pakete installieren
cd src/Frontend/Terminbuchung.Frontend/
npm install

# DEV Tunnel CLI installieren
winget install Microsoft.devtunnel

# Terminbuchung.AppHost als Startup Project in Visual Studio konfigurieren

# Das AppHost Projekt per F5 starten
```

## Systemarchitektur

Das Terminbuchungs-System ist als **mikroservice-orientierte Architektur** mit **.NET Aspire** als Orchestrator implementiert. Die Lüsung nutzt **Cloud-Native-Patterns** und **Event-Driven Architecture**.

### Komponenten

- **API Service** (.NET 10): REST-API mit FastEndpoints, PostgreSQL Integration, Health Checks
- **D365 Service** (.NET 9): Azure Functions für Dynamics 365 Integration mit Service Bus Triggern
- **Migration Worker** (.NET 9): Background Service für Datenbankmigrationen und Wartungsaufgaben
- **Frontend** (Angular 19): Single Page Application mit Angular Material UI
- **AppHost** (.NET 10): Aspire-basierte Orchestrierung aller Services

### Infrastruktur

- **Database**: PostgreSQL mit Entity Framework Core
- **Message Queue**: Azure Service Bus für asynchrone Kommunikation
- **Monitoring**: Application Insights, Serilog, OpenTelemetry
- **Containerization**: Docker mit persistenten Containern
- **Service Discovery**: Aspire Service Discovery

### Datenfluss

1. Frontend kommuniziert mit API Service über HTTP/REST
2. API Service publiziert Events über Service Bus
3. D365 Service konsumiert Events für Dynamics 365 Synchronisation
4. Migration Worker führt Hintergrundprozesse aus

### Technologie-Stack

- **.NET 9/10** mit C# 13
- **FastEndpoints** für performante REST APIs
- **Entity Framework Core** mit PostgreSQL
- **Azure Service Bus** für Messaging
- **Angular 19** mit TypeScript 5.7
- **Docker** für Containerisierung
- **Aspire** für Orchestrierung

## Datenmigration

### Eine neue Datenmigration erstellen

```bash
cd \Terminbuchung\src\Backend\Terminbuchung.ApiService
dotnet ef migrations add <Migrationsname> --project ..\..\Infrastructure\Terminbuchung.Core\Terminbuchung.Core.csproj
```

### Migration anwenden

Die Migrationen werden automatisch beim Start der Anwendung durch den **Migration Worker** angewendet. Manuelle Ausführung:

```bash
dotnet ef database update --project ..\..\Infrastructure\Terminbuchung.Core\Terminbuchung.Core.csproj
```

### Migration rückgüngig machen

```bash
dotnet ef database update <VorherigerMigrationsname> --project ..\..\Infrastructure\Terminbuchung.Core\Terminbuchung.Core.csproj
```

## Development Setup

1. **Prerequisites**: .NET 10 SDK, Node.js 20+, Docker
2. **Start**: `dotnet run --project Infrastructure/Terminbuchung.AppHost`
3. **Frontend**: Wird automatisch durch Aspire gestartet
4. **Database**: PostgreSQL Container mit PgAdmin
5. **Service Bus**: Emulator mit Web-Viewer auf Port 8080

## Known Issues

1. Derzeit wird bei Verwendung von Visual Studio 2026 Insiders (aktueller Build Stand 10.10.2025) das `Migration Worker` Projekt nicht gestartet!

   Bitte Visual Studio 2022 verwenden!