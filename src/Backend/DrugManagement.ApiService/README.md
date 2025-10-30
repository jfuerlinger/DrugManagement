# DrugManagement.ApiService

API-Service f�r die Verwaltung von Medikamenten, Apotheken und Terminen.

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

Die API bietet vollst�ndige CRUD-Funktionalit�t f�r die Verwaltung von Apotheken/Shops.

#### 1. Shop erstellen
**POST** `/api/shops`

Erstellt eine neue Apotheke im System.

**Request Body:**
```json
{
  "name": "Apotheke am Markt",
  "street": "Hauptstra�e 1",
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
  "street": "Hauptstra�e 1",
  "postalcode": "12345",
  "city": "Berlin",
  "phone": "+49 30 12345678"
}
```

**Features:**
- Validiert erforderliche Felder (Name ist Pflichtfeld)
- Gibt die neu erstellte Shop-ID zur�ck
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
      "street": "Hauptstra�e 1",
      "postalcode": "12345",
      "city": "Berlin",
    "phone": "+49 30 12345678"
    },
    {
      "id": 2,
      "name": "Stadt-Apotheke",
      "street": "Bahnhofstra�e 42",
    "postalcode": "54321",
      "city": "M�nchen",
   "phone": "+49 89 87654321"
    }
  ]
}
```

**Features:**
- Effiziente Datenbankabfrage mit Projektion
- Gibt alle Shops ohne Paginierung zur�ck

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
  "street": "Hauptstra�e 1",
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
- Gibt 404 zur�ck, wenn der Shop nicht existiert
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
  "street": "Neue Stra�e 10",
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
  "street": "Neue Stra�e 10",
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
- Vollst�ndige Aktualisierung aller Felder
- Gibt 404 zur�ck, wenn der Shop nicht existiert
- Validiert erforderliche Felder

---

#### 5. Shop l�schen
**DELETE** `/api/shops/{id}`

L�scht eine Apotheke aus dem System.

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

`409 Conflict` - Shop hat noch verkn�pfte Medikamente
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

### Person Management (CRUD)

Die API bietet vollständige CRUD-Funktionalität für die Verwaltung von Personen.

#### 1. Person erstellen
**POST** `/api/persons`

Erstellt eine neue Person im System.

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+49 30 12345678",
  "email": "john.doe@example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+49 30 12345678",
  "email": "john.doe@example.com"
}
```

**Features:**
- Validiert erforderliche Felder (Firstname und Lastname sind Pflichtfelder)
- Gibt die neu erstellte Person-ID zurück
- Setzt Location-Header mit Link zur neuen Person

---

#### 2. Alle Personen abrufen
**GET** `/api/persons`

Ruft eine Liste aller Personen ab.

**Response:** `200 OK`
```json
{
  "persons": [
    {
      "id": 1,
      "firstname": "John",
      "lastname": "Doe",
      "phone": "+49 30 12345678",
      "email": "john.doe@example.com"
    },
    {
      "id": 2,
      "firstname": "Jane",
      "lastname": "Smith",
      "phone": "+49 89 87654321",
      "email": "jane.smith@example.com"
    }
  ]
}
```

**Features:**
- Effiziente Datenbankabfrage mit Projektion
- Gibt alle Personen ohne Paginierung zurück

---

#### 3. Person nach ID abrufen
**GET** `/api/persons/{id}`

Ruft eine einzelne Person anhand ihrer ID ab.

**Path Parameter:**
- `id` (integer) - Die Person-ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+49 30 12345678",
  "email": "john.doe@example.com"
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
- Gibt 404 zurück, wenn die Person nicht existiert
- Loggt Warnung bei nicht gefundener Person

---

#### 4. Person aktualisieren
**PUT** `/api/persons/{id}`

Aktualisiert eine bestehende Person.

**Path Parameter:**
- `id` (integer) - Die Person-ID

**Request Body:**
```json
{
  "id": 1,
  "firstname": "John",
  "lastname": "Doe-Smith",
  "phone": "+49 30 11111111",
  "email": "john.doesmith@example.com"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "firstname": "John",
  "lastname": "Doe-Smith",
  "phone": "+49 30 11111111",
  "email": "john.doesmith@example.com"
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
- Gibt 404 zurück, wenn die Person nicht existiert
- Validiert erforderliche Felder

---

#### 5. Person löschen
**DELETE** `/api/persons/{id}`

Löscht eine Person aus dem System.

**Path Parameter:**
- `id` (integer) - Die Person-ID

**Response:** `204 No Content`

**Error Responses:**

`404 Not Found` - Person existiert nicht
```json
{
  "title": "Not Found",
  "status": 404
}
```

`409 Conflict` - Person hat noch verknüpfte Medikamente
```json
{
  "errors": {
    "GeneralErrors": [
      "Cannot delete person because it has associated drugs"
    ]
  },
  "status": 409
}
```

**Features:**
- Prüft auf referenzielle Integrität (verhindert Löschen bei verknüpften Drugs)
- Gibt 204 No Content bei Erfolg zurück
- Gibt 409 Conflict zurück, wenn Person noch mit Medikamenten verknüpft ist
- Cascade Delete wird verhindert (DeleteBehavior.SetNull für Drug-Beziehungen)

---

### Weitere Endpunkte

#### Booking
- **POST** `/api/booking` - Termin buchen

#### Slots
- **GET** `/api/slots` - Freie Termine abrufen

#### Management
- **POST** `/api/management/data` - Testdaten generieren
- **DELETE** `/api/management/data` - Alle Daten l�schen
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

## Datenmodell: Person

```csharp
public class Person
{
    public int Id { get; set; }
    public string Firstname { get; set; } // Required
    public string Lastname { get; set; } // Required
    public string? Phone { get; set; }
    public string? Email { get; set; }
    
    // Navigation properties
    public ICollection<Drug> DrugsBought { get; set; }
    public ICollection<Drug> DrugsConcerned { get; set; }
}
```

### Beziehungen
- **1:N** zu `Drug.DrugsBought` - Eine Person kann mehrere Medikamente gekauft haben
- **1:N** zu `Drug.DrugsConcerned` - Eine Person kann für mehrere Medikamente verantwortlich sein
- Delete-Verhalten: **SetNull** (Person kann gelöscht werden, wenn keine Drugs verknüpft sind)

---

## Entwicklung

### Voraussetzungen
- .NET 10 SDK
- PostgreSQL Datenbank
- Azure Service Bus (optional)

### Lokale Ausf�hrung
```bash
cd Backend/DrugManagement.ApiService
dotnet run
```

Die API ist dann verf�gbar unter:
- **HTTPS:** `https://localhost:7001`
- **HTTP:** `http://localhost:5001`
- **Swagger UI:** `https://localhost:7001/swagger`

### Logging
Die Anwendung verwendet Serilog f�r strukturiertes Logging:
- Console Sink - f�r Entwicklung
- Application Insights Sink - f�r Produktion

Jeder Endpunkt loggt:
- Eingehende Requests mit relevanten Parametern
- Erfolgsmeldungen mit Ergebnissen
- Warnungen bei 404-F�llen
- Fehler bei Exceptions

---

## Projektstruktur

```
DrugManagement.ApiService/
├── Features/
│   ├── Shops/        # Shop CRUD Endpunkte
│   │   ├── CreateShop.cs
│   │   ├── GetAllShops.cs
│   │   ├── GetShopById.cs
│   │   ├── UpdateShop.cs
│   │   └── DeleteShop.cs
│   ├── Persons/      # Person CRUD Endpunkte
│   │   ├── CreatePerson.cs
│   │   ├── GetAllPersons.cs
│   │   ├── GetPersonById.cs
│   │   ├── UpdatePerson.cs
│   │   └── DeletePerson.cs
│   ├── Booking/
│   ├── Slots/
│   └── Management/
├── Shared/
│   └── Services/
├── Infrastructure/
│   └── Extensions/
└── Program.cs
```

### FastEndpoints Konventionen
- Jeder Endpunkt ist eine eigene Klasse
- Request/Response DTOs sind als `record` definiert
- Konfiguration erfolgt in `Configure()` Methode
- Business-Logik in `HandleAsync()` Methode
- `AllowAnonymous()` f�r alle Endpunkte (derzeit keine Authentifizierung)

---

## Swagger/OpenAPI

Die API-Dokumentation ist automatisch verf�gbar �ber Swagger UI:

**URL:** `https://localhost:7001/swagger`

Swagger bietet:
- Interaktive API-Dokumentation
- Request/Response Beispiele
- Direkte API-Tests aus dem Browser
- OpenAPI 3.0 Spezifikation

### Swagger-Gruppierung

Die Endpunkte sind in Swagger in folgende Kategorien gruppiert:
- **Shops** - Shop CRUD-Operationen
- **Persons** - Person CRUD-Operationen
- **Data** - Slots und andere Daten-Endpunkte
- **Management** - Administrative Endpunkte (Migrations, Seeding)

---

## Best Practices

### Error Handling
- Konsistente HTTP-Statuscodes
- Problem Details f�r Fehler (RFC 7807)
- Aussagekr�ftige Fehlermeldungen

### Performance
- Effiziente EF Core Queries mit Projektion
- Async/Await durchg�ngig
- Connection Pooling durch DbContext

### Sicherheit
- Input Validation durch FastEndpoints
- SQL Injection Prevention durch EF Core
- CORS konfiguriert (derzeit AllowAny f�r Entwicklung)

---

## Deployment

Die Anwendung nutzt .NET Aspire f�r Orchestrierung:
- Database Connection �ber Aspire
- Service Bus Connection �ber Aspire
- Service Discovery
- Health Checks

Siehe `DrugManagement.AppHost` f�r Konfiguration.
