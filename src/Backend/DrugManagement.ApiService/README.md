# DrugManagement.ApiService

API-Service für die Verwaltung von Medikamenten, Apotheken und Terminen.

## Technologie-Stack

- **.NET 10**
- **FastEndpoints** - Lightweight alternative to MVC controllers
- **Entity Framework Core** - PostgreSQL Database
- **Azure Service Bus** - Message Queue
- **Swagger/OpenAPI** - API Documentation
- **Serilog** - Structured Logging
- **Application Insights** - Telemetry

## API-Endpunkte

### Shop Management (CRUD)

Die API bietet vollständige CRUD-Funktionalität für die Verwaltung von Apotheken/Shops.

#### 1. Shop erstellen
**POST** `/api/shops`

Erstellt eine neue Apotheke im System.

**Request Body:**
```json
{
  "name": "Apotheke am Markt",
  "street": "Hauptstraße 1",
  "postalcode": "12345",
  "city": "Berlin",
  "phone": "+49 30 12345678"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Apotheke am Markt",
  "street": "Hauptstraße 1",
  "postalcode": "12345",
  "city": "Berlin",
  "phone": "+49 30 12345678"
}
```

**Features:**
- Validiert erforderliche Felder (Name ist Pflichtfeld)
- Gibt die neu erstellte Shop-ID zurück
- Setzt Location-Header mit Link zum neuen Shop

---

#### 2. Alle Shops abrufen
**GET** `/api/shops`

Ruft eine Liste aller Apotheken ab.

**Response:** `200 OK`
```json
{
  "shops": [
    {
      "id": 1,
"name": "Apotheke am Markt",
      "street": "Hauptstraße 1",
      "postalcode": "12345",
      "city": "Berlin",
    "phone": "+49 30 12345678"
    },
    {
      "id": 2,
      "name": "Stadt-Apotheke",
      "street": "Bahnhofstraße 42",
    "postalcode": "54321",
      "city": "München",
   "phone": "+49 89 87654321"
    }
  ]
}
```

**Features:**
- Effiziente Datenbankabfrage mit Projektion
- Gibt alle Shops ohne Paginierung zurück

---

#### 3. Shop nach ID abrufen
**GET** `/api/shops/{id}`

Ruft eine einzelne Apotheke anhand ihrer ID ab.

**Path Parameter:**
- `id` (integer) - Die Shop-ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Apotheke am Markt",
  "street": "Hauptstraße 1",
  "postalcode": "12345",
  "city": "Berlin",
  "phone": "+49 30 12345678"
}
```

**Error Response:** `404 Not Found`
```json
{
  "title": "Not Found",
  "status": 404
}
```

**Features:**
- Gibt 404 zurück, wenn der Shop nicht existiert
- Loggt Warnung bei nicht gefundenem Shop

---

#### 4. Shop aktualisieren
**PUT** `/api/shops/{id}`

Aktualisiert eine bestehende Apotheke.

**Path Parameter:**
- `id` (integer) - Die Shop-ID

**Request Body:**
```json
{
  "id": 1,
  "name": "Apotheke am Markt - Neue Filiale",
  "street": "Neue Straße 10",
  "postalcode": "12345",
  "city": "Berlin",
  "phone": "+49 30 11111111"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Apotheke am Markt - Neue Filiale",
  "street": "Neue Straße 10",
  "postalcode": "12345",
  "city": "Berlin",
  "phone": "+49 30 11111111"
}
```

**Error Response:** `404 Not Found`
```json
{
  "title": "Not Found",
  "status": 404
}
```

**Features:**
- Vollständige Aktualisierung aller Felder
- Gibt 404 zurück, wenn der Shop nicht existiert
- Validiert erforderliche Felder

---

#### 5. Shop löschen
**DELETE** `/api/shops/{id}`

Löscht eine Apotheke aus dem System.

**Path Parameter:**
- `id` (integer) - Die Shop-ID

**Response:** `204 No Content`

**Error Responses:**

`404 Not Found` - Shop existiert nicht
```json
{
  "title": "Not Found",
  "status": 404
}
```

`409 Conflict` - Shop hat noch verknüpfte Medikamente
```json
{
  "errors": {
    "GeneralErrors": [
      "Cannot delete shop because it has associated drugs"
    ]
  },
  "status": 409
}
```

**Features:**
- Prüft auf referenzielle Integrität (verhindert Löschen bei verknüpften Drugs)
- Gibt 204 No Content bei Erfolg zurück
- Gibt 409 Conflict zurück, wenn Shop noch Medikamente hat
- Cascade Delete wird verhindert (DeleteBehavior.Restrict)

---

### Weitere Endpunkte

#### Booking
- **POST** `/api/booking` - Termin buchen

#### Slots
- **GET** `/api/slots` - Freie Termine abrufen

#### Management
- **POST** `/api/management/data` - Testdaten generieren
- **DELETE** `/api/management/data` - Alle Daten löschen
- **POST** `/api/management/migrations` - Migrationen anwenden

---

## Datenmodell: Shop

```csharp
public class Shop
{
    public int Id { get; set; }
    public string Name { get; set; } // Required
    public string? Street { get; set; }
public string? Postalcode { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    
    // Navigation properties
    public ICollection<Drug> Drugs { get; set; }
}
```

### Beziehungen
- **1:N** zu `Drug` - Ein Shop kann mehrere Medikamente haben
- Delete-Verhalten: **Restrict** (Shop kann nicht gelöscht werden, wenn Drugs existieren)

---

## Entwicklung

### Voraussetzungen
- .NET 10 SDK
- PostgreSQL Datenbank
- Azure Service Bus (optional)

### Lokale Ausführung
```bash
cd Backend/DrugManagement.ApiService
dotnet run
```

Die API ist dann verfügbar unter:
- **HTTPS:** `https://localhost:7001`
- **HTTP:** `http://localhost:5001`
- **Swagger UI:** `https://localhost:7001/swagger`

### Logging
Die Anwendung verwendet Serilog für strukturiertes Logging:
- Console Sink - für Entwicklung
- Application Insights Sink - für Produktion

Jeder Endpunkt loggt:
- Eingehende Requests mit relevanten Parametern
- Erfolgsmeldungen mit Ergebnissen
- Warnungen bei 404-Fällen
- Fehler bei Exceptions

---

## Projektstruktur

```
DrugManagement.ApiService/
??? Features/
?   ??? Shops/        # Shop CRUD Endpunkte
?   ?   ??? CreateShop.cs
?   ?   ??? GetAllShops.cs
?   ?   ??? GetShopById.cs
?   ?   ??? UpdateShop.cs
?   ?   ??? DeleteShop.cs
?   ??? Booking/
? ??? Slots/
?   ??? Management/
??? Shared/
?   ??? Services/
??? Infrastructure/
?   ??? Extensions/
??? Program.cs
```

### FastEndpoints Konventionen
- Jeder Endpunkt ist eine eigene Klasse
- Request/Response DTOs sind als `record` definiert
- Konfiguration erfolgt in `Configure()` Methode
- Business-Logik in `HandleAsync()` Methode
- `AllowAnonymous()` für alle Endpunkte (derzeit keine Authentifizierung)

---

## Swagger/OpenAPI

Die API-Dokumentation ist automatisch verfügbar über Swagger UI:

**URL:** `https://localhost:7001/swagger`

Swagger bietet:
- Interaktive API-Dokumentation
- Request/Response Beispiele
- Direkte API-Tests aus dem Browser
- OpenAPI 3.0 Spezifikation

### Swagger-Gruppierung

Die Endpunkte sind in Swagger in folgende Kategorien gruppiert:
- **Shops** - Shop CRUD-Operationen
- **Data** - Slots und andere Daten-Endpunkte
- **Management** - Administrative Endpunkte (Migrations, Seeding)

---

## Best Practices

### Error Handling
- Konsistente HTTP-Statuscodes
- Problem Details für Fehler (RFC 7807)
- Aussagekräftige Fehlermeldungen

### Performance
- Effiziente EF Core Queries mit Projektion
- Async/Await durchgängig
- Connection Pooling durch DbContext

### Sicherheit
- Input Validation durch FastEndpoints
- SQL Injection Prevention durch EF Core
- CORS konfiguriert (derzeit AllowAny für Entwicklung)

---

## Deployment

Die Anwendung nutzt .NET Aspire für Orchestrierung:
- Database Connection über Aspire
- Service Bus Connection über Aspire
- Service Discovery
- Health Checks

Siehe `DrugManagement.AppHost` für Konfiguration.
