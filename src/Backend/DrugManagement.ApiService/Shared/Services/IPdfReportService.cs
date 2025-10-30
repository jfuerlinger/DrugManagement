namespace DrugManagement.ApiService.Shared.Services;

/// <summary>
/// Service for generating PDF reports
/// </summary>
public interface IPdfReportService
{
    /// <summary>
    /// Generates a PDF report of all drugs sorted by expiration date
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task containing the generated PDF report ID</returns>
    Task<string> GenerateDrugReportAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the PDF report file path for a given report ID
    /// </summary>
    /// <param name="reportId">The report ID</param>
    /// <returns>The file path if the report exists, null otherwise</returns>
    string? GetReportPath(string reportId);

    /// <summary>
    /// Checks if a report generation is complete
    /// </summary>
    /// <param name="reportId">The report ID</param>
    /// <returns>True if the report is ready, false otherwise</returns>
    bool IsReportReady(string reportId);
}
