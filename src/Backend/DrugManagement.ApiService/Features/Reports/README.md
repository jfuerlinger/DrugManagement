# PDF Report Generation Feature

## Overview

This feature provides endpoints for generating and downloading professionally formatted PDF reports of medications (drugs) sorted by their expiration date.

## Endpoints

### 1. Generate Drug Report

**POST** `/reports/drugs/generate`

Initiates asynchronous generation of a PDF report containing all medications sorted by expiration date.

**Response (202 Accepted)**
```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Report generation initiated successfully",
  "downloadUrl": "/reports/drugs/download/550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Check Report Status

**GET** `/reports/drugs/status/{reportId}`

Checks whether a report has been generated and is ready for download.

**Response (200 OK)**
```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "isReady": true,
  "downloadUrl": "/reports/drugs/download/550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (404 Not Found)**
Report not found or not yet generated.

### 3. Download Drug Report

**GET** `/reports/drugs/download/{reportId}`

Downloads the generated PDF report.

**Response (200 OK)**
- Content-Type: `application/pdf`
- File download with name: `Medikamentenbericht-{timestamp}.pdf`

**Response (404 Not Found)**
Report not found or not yet generated.

## Report Format

The generated PDF report includes:

- **Header**: "Medikamentenbericht - Sortiert nach Ablaufdatum"
- **Metadata**: Generation date and total count of medications
- **Table with columns**:
  - Medikament (Drug Name)
  - Packungsgröße (Package Size)
  - Geschäft (Shop)
  - Gekauft am (Bought On)
  - Geöffnet am (Opened On)
  - Ablaufdatum (Expiration Date)
  - Betroffene Person (Person Concerned)
  - Menge (Amount Left)
  - Verträglichkeit (Agreeability)

### Visual Indicators

- **Red background**: Expired medications (past expiration date)
- **Orange background**: Medications expiring within 30 days
- **White background**: Medications not expiring soon

## Usage Example

```bash
# 1. Generate report
curl -X POST http://localhost:5464/reports/drugs/generate

# Response:
# {
#   "reportId": "abc123...",
#   "message": "Report generation initiated successfully",
#   "downloadUrl": "/reports/drugs/download/abc123..."
# }

# 2. Check status (optional)
curl http://localhost:5464/reports/drugs/status/abc123...

# 3. Download report
curl -O -J http://localhost:5464/reports/drugs/download/abc123...
```

## Configuration

The report directory can be configured in `appsettings.json`:

```json
{
  "ReportSettings": {
    "Directory": "/path/to/reports"
  }
}
```

If not configured, reports are stored in the system's temp directory under `DrugReports`.

## Technical Details

- **PDF Library**: QuestPDF (Community License)
- **Layout**: A4 Landscape for optimal table display
- **Sorting**: Medications are sorted by `PalatableUntil` (expiration date) in ascending order
- **File Naming**: Reports are saved as `drug-report-{reportId}.pdf`
- **Cleanup**: Reports should be cleaned up periodically (not implemented yet)

## Security

- All endpoints are currently configured with `AllowAnonymous()` 
- In production, authentication and authorization should be added
- Report IDs are GUIDs to prevent enumeration attacks

## Future Enhancements

- Add automatic cleanup of old reports
- Add report generation progress tracking
- Support for filtering (e.g., only expired drugs, specific person)
- Support for different report formats (Excel, CSV)
- Background job processing for large datasets
