# DrugManagement.ApiService

API-Service fï¿½r die Verwaltung von Medikamenten, Apotheken und Terminen.

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

Die API bietet vollstï¿½ndige CRUD-Funktionalitï¿½t fï¿½r die Verwaltung von Apotheken/Shops.

#### 1. Shop erstellen
**POST** `/api/shops`

Erstellt eine neue Apotheke im System.

**Request Body:**
```json
{
  "name": "Apotheke am Markt",
  "street": "Hauptstraï¿½e 1",
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
  "street": "Hauptstraï¿½e 1",
  "postalcode": "12345",
  "city": "Berlin",
  "phone": "+49 30 12345678"
}
```

**Features:**
- Validiert erforderliche Felder (Name ist Pflichtfeld)
- Gibt die neu erstellte Shop-ID zurï¿½ck
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
      "street": "Hauptstraï¿½e 1",
      "postalcode": "12345",
      "city": "Berlin",
    "phone": "+49 30 12345678"
    },
    {
      "id": 2,
      "name": "Stadt-Apotheke",
      "street": "Bahnhofstraï¿½e 42",
    "postalcode": "54321",
      "city": "Mï¿½nchen",
   "phone": "+49 89 87654321"
    }
  ]
}
```

**Features:**
- Effiziente Datenbankabfrage mit Projektion
- Gibt alle Shops ohne Paginierung zurï¿½ck

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
  "street": "Hauptstraï¿½e 1",
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
- Gibt 404 zurï¿½ck, wenn der Shop nicht existiert
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
  "street": "Neue Straï¿½e 10",
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
  "street": "Neue Straï¿½e 10",
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
- Vollstï¿½ndige Aktualisierung aller Felder
- Gibt 404 zurï¿½ck, wenn der Shop nicht existiert
- Validiert erforderliche Felder

---

#### 5. Shop lï¿½schen
**DELETE** `/api/shops/{id}`

Lï¿½scht eine Apotheke aus dem System.

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

`409 Conflict` - Shop hat noch verknï¿½pfte Medikamente
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
- PrÃ¼ft auf referenzielle IntegritÃ¤t (verhindert LÃ¶schen bei verknÃ¼pften Drugs)
- Gibt 204 No Content bei Erfolg zurÃ¼ck
- Gibt 409 Conflict zurÃ¼ck, wenn Shop noch Medikamente hat
- Cascade Delete wird verhindert (DeleteBehavior.Restrict)

---

### Person Management (CRUD)

Die API bietet vollstÃ¤ndige CRUD-FunktionalitÃ¤t fÃ¼r die Verwaltung von Personen.

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
- Gibt die neu erstellte Person-ID zurÃ¼ck
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
- Gibt alle Personen ohne Paginierung zurÃ¼ck

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
- Gibt 404 zurÃ¼ck, wenn die Person nicht existiert
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
- VollstÃ¤ndige Aktualisierung aller Felder
- Gibt 404 zurÃ¼ck, wenn die Person nicht existiert
- Validiert erforderliche Felder

---

#### 5. Person lÃ¶schen
**DELETE** `/api/persons/{id}`

LÃ¶scht eine Person aus dem System.

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

`409 Conflict` - Person hat noch verknÃ¼pfte Medikamente
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
- PrÃ¼ft auf referenzielle IntegritÃ¤t (verhindert LÃ¶schen bei verknÃ¼pften Drugs)
- Gibt 204 No Content bei Erfolg zurÃ¼ck
- Gibt 409 Conflict zurÃ¼ck, wenn Person noch mit Medikamenten verknÃ¼pft ist
- Cascade Delete wird verhindert (DeleteBehavior.SetNull fÃ¼r Drug-Beziehungen)

---

### Weitere Endpunkte

#### Booking
- **POST** `/api/booking` - Termin buchen

#### Slots
- **GET** `/api/slots` - Freie Termine abrufen

#### Management
- **POST** `/api/management/data` - Testdaten generieren
- **DELETE** `/api/management/data` - Alle Daten lï¿½schen
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
- Delete-Verhalten: **Restrict** (Shop kann nicht gelÃ¶scht werden, wenn Drugs existieren)

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
- **1:N** zu `Drug.DrugsConcerned` - Eine Person kann fÃ¼r mehrere Medikamente verantwortlich sein
- Delete-Verhalten: **SetNull** (Person kann gelÃ¶scht werden, wenn keine Drugs verknÃ¼pft sind)

---

## Entwicklung

### Voraussetzungen
- .NET 10 SDK
- PostgreSQL Datenbank
- Azure Service Bus (optional)

### Lokale Ausfï¿½hrung
```bash
cd Backend/DrugManagement.ApiService
dotnet run
```

Die API ist dann verfï¿½gbar unter:
- **HTTPS:** `https://localhost:7001`
- **HTTP:** `http://localhost:5001`
- **Swagger UI:** `https://localhost:7001/swagger`

### Logging
Die Anwendung verwendet Serilog fï¿½r strukturiertes Logging:
- Console Sink - fï¿½r Entwicklung
- Application Insights Sink - fï¿½r Produktion

Jeder Endpunkt loggt:
- Eingehende Requests mit relevanten Parametern
- Erfolgsmeldungen mit Ergebnissen
- Warnungen bei 404-Fï¿½llen
- Fehler bei Exceptions

---

## Projektstruktur

```
DrugManagement.ApiService/
âââ Features/
â   âââ Shops/        # Shop CRUD Endpunkte
â   â   âââ CreateShop.cs
â   â   âââ GetAllShops.cs
â   â   âââ GetShopById.cs
â   â   âââ UpdateShop.cs
â   â   âââ DeleteShop.cs
â   âââ Persons/      # Person CRUD Endpunkte
â   â   âââ CreatePerson.cs
â   â   âââ GetAllPersons.cs
â   â   âââ GetPersonById.cs
â   â   âââ UpdatePerson.cs
â   â   âââ DeletePerson.cs
â   âââ Booking/
â   âââ Slots/
â   âââ Management/
âââ Shared/
â   âââ Services/
âââ Infrastructure/
â   âââ Extensions/
âââ Program.cs
```

### FastEndpoints Konventionen
- Jeder Endpunkt ist eine eigene Klasse
- Request/Response DTOs sind als `record` definiert
- Konfiguration erfolgt in `Configure()` Methode
- Business-Logik in `HandleAsync()` Methode
- `AllowAnonymous()` fï¿½r alle Endpunkte (derzeit keine Authentifizierung)

---

## Swagger/OpenAPI

Die API-Dokumentation ist automatisch verfï¿½gbar ï¿½ber Swagger UI:

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
- Problem Details fï¿½r Fehler (RFC 7807)
- Aussagekrï¿½ftige Fehlermeldungen

### Performance
- Effiziente EF Core Queries mit Projektion
- Async/Await durchgï¿½ngig
- Connection Pooling durch DbContext

### Sicherheit
- Input Validation durch FastEndpoints
- SQL Injection Prevention durch EF Core
- CORS konfiguriert (derzeit AllowAny fï¿½r Entwicklung)

---

## Deployment

Die Anwendung nutzt .NET Aspire fï¿½r Orchestrierung:
- Database Connection ï¿½ber Aspire
- Service Bus Connection ï¿½ber Aspire
- Service Discovery
- Health Checks

Siehe `DrugManagement.AppHost` fï¿½r Konfiguration.
