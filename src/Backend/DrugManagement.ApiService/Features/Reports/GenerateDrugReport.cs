using FastEndpoints;
using DrugManagement.ApiService.Shared.Services;

namespace DrugManagement.ApiService.Features.Reports;

/// <summary>
/// Endpoint to asynchronously generate a PDF report of all drugs sorted by expiration date
/// </summary>
internal sealed class GenerateDrugReport(
    ILogger<GenerateDrugReport> logger,
    IPdfReportService pdfReportService)
    : EndpointWithoutRequest<GenerateDrugReportResponse>
{
    public override void Configure()
    {
        Post("/reports/drugs/generate");
        Summary(s =>
        {
            s.Summary = "Asynchronously generates a PDF report of all drugs sorted by expiration date";
            s.Description = "Initiates the generation of a professionally formatted PDF report containing all medications sorted by their expiration date (PalatableUntil). Returns a report ID that can be used to download the report.";
        });
        Description(b => b
            .Produces<GenerateDrugReportResponse>(202, contentType: "application/json")
            .Produces(500, contentType: "application/json"));
        Tags("Reports");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Received request to generate drug report");

        try
        {
            // Start PDF generation asynchronously
            var reportId = await pdfReportService.GenerateDrugReportAsync(ct);

            logger.LogInformation("Drug report generation initiated with ID: {ReportId}", reportId);

            await SendAsync(new GenerateDrugReportResponse
            {
                ReportId = reportId,
                Message = "Report generation initiated successfully",
                DownloadUrl = $"/reports/drugs/download/{reportId}"
            }, 202, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate drug report");
            
            ThrowError("Failed to generate report. Please try again later.", 500);
        }
    }
}

internal sealed record GenerateDrugReportResponse
{
    public string ReportId { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string DownloadUrl { get; init; } = string.Empty;
}
