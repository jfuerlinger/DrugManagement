# Testing Guide for PDF Report Endpoints

## Prerequisites
- .NET 10 SDK installed
- DrugManagement application running
- Some test data in the database (use the seed endpoint if needed)

## Testing Steps

### 1. Start the Application
```bash
cd src/Infrastructure/DrugManagement.AppHost
dotnet run
```

The API should be available at `http://localhost:5464` (or the port shown in Aspire dashboard).

### 2. Seed Test Data (Optional)
If the database is empty, use the seed endpoint:
```bash
curl -X POST http://localhost:5464/management/seed
```

### 3. Test PDF Generation

#### Generate a new report:
```bash
curl -X POST http://localhost:5464/reports/drugs/generate \
  -H "Accept: application/json"
```

Expected response (202 Accepted):
```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Report generation initiated successfully",
  "downloadUrl": "/reports/drugs/download/550e8400-e29b-41d4-a716-446655440000"
}
```

**Copy the `reportId` from the response for the next steps.**

### 4. Check Report Status

```bash
curl http://localhost:5464/reports/drugs/status/{reportId} \
  -H "Accept: application/json"
```

Expected response (200 OK):
```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "isReady": true,
  "downloadUrl": "/reports/drugs/download/550e8400-e29b-41d4-a716-446655440000"
}
```

### 5. Download the Report

```bash
curl -O -J http://localhost:5464/reports/drugs/download/{reportId}
```

This will download a PDF file named `Medikamentenbericht-{timestamp}.pdf`.

### 6. Verify PDF Content

Open the downloaded PDF and verify:
- ✅ Header shows "Medikamentenbericht - Sortiert nach Ablaufdatum"
- ✅ Metadata shows generation date and drug count
- ✅ Table contains all drugs with columns:
  - Medikament, Packungsgröße, Geschäft, Gekauft am, Geöffnet am, Ablaufdatum, Betroffene Person, Menge, Verträglichkeit
- ✅ Drugs are sorted by expiration date (earliest first, nulls last)
- ✅ Expired drugs have red background
- ✅ Drugs expiring within 30 days have orange background
- ✅ Page numbers are shown in footer

## Using the .http File

If using Visual Studio or Visual Studio Code with REST Client extension:

1. Open `DrugManagement.ApiService.http`
2. Click "Send Request" on the "Generate Drug Report" request
3. Copy the `reportId` from response
4. Replace `{{reportId}}` in the subsequent requests
5. Test status and download endpoints

## Error Cases to Test

### Test 404 - Report Not Found
```bash
curl -i http://localhost:5464/reports/drugs/download/invalid-report-id
```
Expected: 404 Not Found

### Test 404 - Status for Non-existent Report
```bash
curl -i http://localhost:5464/reports/drugs/status/non-existent-id
```
Expected: 404 Not Found

## Swagger UI Testing

1. Navigate to `http://localhost:5464/swagger`
2. Find the "Reports" section
3. Expand and test each endpoint:
   - POST /reports/drugs/generate
   - GET /reports/drugs/status/{reportId}
   - GET /reports/drugs/download/{reportId}

## Automated Testing (Future)

Example xUnit test to add:

```csharp
[Fact]
public async Task GenerateDrugReport_ReturnsReportId()
{
    // Arrange
    var client = _factory.CreateClient();
    
    // Act
    var response = await client.PostAsync("/reports/drugs/generate", null);
    
    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.Accepted);
    var content = await response.Content.ReadFromJsonAsync<GenerateDrugReportResponse>();
    content.ReportId.Should().NotBeNullOrEmpty();
}

[Fact]
public async Task DownloadDrugReport_WithValidId_ReturnsPdf()
{
    // Arrange
    var client = _factory.CreateClient();
    var generateResponse = await client.PostAsync("/reports/drugs/generate", null);
    var generateContent = await generateResponse.Content.ReadFromJsonAsync<GenerateDrugReportResponse>();
    
    // Wait a bit for report generation
    await Task.Delay(1000);
    
    // Act
    var response = await client.GetAsync($"/reports/drugs/download/{generateContent.ReportId}");
    
    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    response.Content.Headers.ContentType?.MediaType.Should().Be("application/pdf");
}
```

## Performance Testing

For large datasets, test report generation time:

```bash
time curl -X POST http://localhost:5464/reports/drugs/generate
```

Expected: Should complete within a few seconds for up to 1000 drugs.

## Cleanup

Reports are stored in the temp directory. To clean up manually:

**Windows:**
```powershell
Remove-Item "$env:TEMP\DrugReports\*" -Force
```

**Linux/Mac:**
```bash
rm -rf /tmp/DrugReports/*
```

## Known Limitations

1. No automatic cleanup of old reports (manual cleanup required)
2. No progress indication for long-running report generation
3. No pagination or filtering options
4. Endpoints are currently unauthenticated (AllowAnonymous)

## Troubleshooting

### Error: QuestPDF License Exception
If you see license-related errors, ensure QuestPDF Community license is properly configured in PdfReportService.cs.

### Error: Directory Access Denied
Check that the application has write permissions to the temp directory or configure a custom directory in appsettings.json:

```json
{
  "ReportSettings": {
    "Directory": "/path/to/writable/directory"
  }
}
```

### Error: Empty PDF or Missing Data
Verify that the database contains drugs with the necessary relationships (Metadata, PackageSize, Shop) using:

```bash
curl http://localhost:5464/drugs
```
