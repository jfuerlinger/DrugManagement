using FastEndpoints;
using DrugManagement.ApiService.Shared.Services;

namespace DrugManagement.ApiService.Features.Reports;

/// <summary>
/// Endpoint to download a generated PDF report
/// </summary>
internal sealed class DownloadDrugReport(
    ILogger<DownloadDrugReport> logger,
    IPdfReportService pdfReportService)
    : Endpoint<DownloadDrugReportRequest>
{
    public override void Configure()
    {
        Get("/reports/drugs/download/{reportId}");
        Summary(s =>
        {
            s.Summary = "Downloads a generated PDF report";
            s.Description = "Downloads a previously generated PDF report of medications. The report must have been generated using the /reports/drugs/generate endpoint.";
        });
        Description(b => b
            .Produces(200, contentType: "application/pdf")
            .Produces(404, contentType: "application/json")
            .Produces(500, contentType: "application/json"));
        Tags("Reports");
        AllowAnonymous();
    }

    public override async Task HandleAsync(DownloadDrugReportRequest req, CancellationToken ct)
    {
        logger.LogInformation("Received request to download report: {ReportId}", req.ReportId);

        try
        {
            // Check if report is ready
            if (!pdfReportService.IsReportReady(req.ReportId))
            {
                logger.LogWarning("Report not found or not ready: {ReportId}", req.ReportId);
                
                await Send.NotFoundAsync(ct);
                return;
            }

            // Get report path
            var reportPath = pdfReportService.GetReportPath(req.ReportId);
            
            if (reportPath == null)
            {
                logger.LogWarning("Report path is null for ID: {ReportId}", req.ReportId);
                
                await Send.NotFoundAsync(ct);
                return;
            }

            logger.LogInformation("Sending PDF report: {ReportPath}", reportPath);

            // Send file as response
            var fileName = $"Medikamentenbericht-{DateTime.Now:yyyy-MM-dd-HHmmss}.pdf";
            var fileBytes = await File.ReadAllBytesAsync(reportPath, ct);
            
            HttpContext.Response.ContentType = "application/pdf";
            HttpContext.Response.Headers.Append("Content-Disposition", $"attachment; filename=\"{fileName}\"");
            await HttpContext.Response.Body.WriteAsync(fileBytes, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to download report: {ReportId}", req.ReportId);
            
            ThrowError("Failed to download report. Please try again later.", 500);
        }
    }
}

internal sealed record DownloadDrugReportRequest
{
    public string ReportId { get; init; } = string.Empty;
}
