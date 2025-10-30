using FastEndpoints;
using DrugManagement.ApiService.Shared.Services;

namespace DrugManagement.ApiService.Features.Reports;

/// <summary>
/// Endpoint to check the status of a report generation
/// </summary>
internal sealed class GetDrugReportStatus(
    ILogger<GetDrugReportStatus> logger,
    IPdfReportService pdfReportService)
    : Endpoint<GetDrugReportStatusRequest, GetDrugReportStatusResponse>
{
    public override void Configure()
    {
        Get("/reports/drugs/status/{reportId}");
        Summary(s =>
        {
            s.Summary = "Checks the status of a report generation";
            s.Description = "Checks whether a PDF report has been generated and is ready for download.";
        });
        Description(b => b
            .Produces<GetDrugReportStatusResponse>(200, contentType: "application/json")
            .Produces(404, contentType: "application/json"));
        Tags("Reports");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetDrugReportStatusRequest req, CancellationToken ct)
    {
        logger.LogInformation("Checking status for report: {ReportId}", req.ReportId);

        var isReady = pdfReportService.IsReportReady(req.ReportId);

        if (!isReady)
        {
            logger.LogInformation("Report not found: {ReportId}", req.ReportId);
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(new GetDrugReportStatusResponse
        {
            ReportId = req.ReportId,
            IsReady = true,
            DownloadUrl = $"/reports/drugs/download/{req.ReportId}"
        }, ct);
    }
}

internal sealed record GetDrugReportStatusRequest
{
    public string ReportId { get; init; } = string.Empty;
}

internal sealed record GetDrugReportStatusResponse
{
    public string ReportId { get; init; } = string.Empty;
    public bool IsReady { get; init; }
    public string DownloadUrl { get; init; } = string.Empty;
}
