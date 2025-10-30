using DrugManagement.Core.DataAccess;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace DrugManagement.ApiService.Shared.Services;

/// <summary>
/// Service for generating PDF reports using QuestPDF
/// </summary>
public class PdfReportService : IPdfReportService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<PdfReportService> _logger;
    private readonly string _reportDirectory;

    public PdfReportService(
        ApplicationDbContext dbContext,
        ILogger<PdfReportService> logger,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _logger = logger;
        
        // Get report directory from configuration or use temp directory
        _reportDirectory = configuration["ReportSettings:Directory"] 
            ?? Path.Combine(Path.GetTempPath(), "DrugReports");
        
        // Ensure directory exists
        Directory.CreateDirectory(_reportDirectory);
        
        // Configure QuestPDF license (Community license for non-commercial use)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<string> GenerateDrugReportAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting drug report generation");

        // Generate unique report ID
        var reportId = Guid.NewGuid().ToString();
        var reportPath = GetReportFilePath(reportId);

        try
        {
            // Fetch drugs sorted by expiration date
            var drugs = await _dbContext.Drugs
                .Include(d => d.Metadata)
                .Include(d => d.DrugPackageSize)
                .Include(d => d.Shop)
                .Include(d => d.BoughtByPerson)
                .Include(d => d.PersonConcernedPerson)
                .OrderBy(d => d.PalatableUntil ?? DateTime.MaxValue)
                .Select(d => new DrugReportDto
                {
                    DrugName = d.Metadata.Name,
                    Description = d.Metadata.Description ?? "N/A",
                    PackageSize = $"{d.DrugPackageSize.BundleSize} {d.DrugPackageSize.BundleType ?? ""}",
                    Shop = d.Shop.Name,
                    BoughtOn = d.BoughtOn,
                    OpenedOn = d.OpenedOn,
                    ExpirationDate = d.PalatableUntil,
                    BoughtBy = d.BoughtByPerson != null ? $"{d.BoughtByPerson.Firstname} {d.BoughtByPerson.Lastname}" : "N/A",
                    PersonConcerned = d.PersonConcernedPerson != null ? $"{d.PersonConcernedPerson.Firstname} {d.PersonConcernedPerson.Lastname}" : "N/A",
                    AmountLeft = d.AmountLeftInPercentage.HasValue ? $"{d.AmountLeftInPercentage.Value:F0}%" : "N/A",
                    Agreeability = d.Metadata.Agreeability ?? "N/A"
                })
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Found {Count} drugs for report", drugs.Count);

            // Generate PDF
            await Task.Run(() => GeneratePdf(drugs, reportPath), cancellationToken);

            _logger.LogInformation("Drug report generated successfully: {ReportId}", reportId);
            return reportId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate drug report");
            
            // Clean up partial file if it exists
            if (File.Exists(reportPath))
            {
                File.Delete(reportPath);
            }
            
            throw;
        }
    }

    public string? GetReportPath(string reportId)
    {
        var reportPath = GetReportFilePath(reportId);
        return File.Exists(reportPath) ? reportPath : null;
    }

    public bool IsReportReady(string reportId)
    {
        var reportPath = GetReportFilePath(reportId);
        return File.Exists(reportPath);
    }

    private string GetReportFilePath(string reportId)
    {
        return Path.Combine(_reportDirectory, $"drug-report-{reportId}.pdf");
    }

    private void GeneratePdf(List<DrugReportDto> drugs, string outputPath)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .AlignCenter()
                    .Text("Medikamentenbericht - Sortiert nach Ablaufdatum")
                    .FontSize(20)
                    .SemiBold()
                    .FontColor(Colors.Blue.Darken2);

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        column.Spacing(5);

                        // Summary
                        column.Item().Text($"Generiert am: {DateTime.Now:dd.MM.yyyy HH:mm}")
                            .FontSize(10)
                            .Italic();
                        column.Item().Text($"Anzahl Medikamente: {drugs.Count}")
                            .FontSize(10)
                            .SemiBold();

                        column.Item().PaddingTop(10);

                        // Table
                        column.Item().Table(table =>
                        {
                            // Define columns
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2); // Drug Name
                                columns.RelativeColumn(1.5f); // Package Size
                                columns.RelativeColumn(1.5f); // Shop
                                columns.RelativeColumn(1.2f); // Bought On
                                columns.RelativeColumn(1.2f); // Opened On
                                columns.RelativeColumn(1.2f); // Expiration
                                columns.RelativeColumn(1.5f); // Person Concerned
                                columns.RelativeColumn(1); // Amount Left
                                columns.RelativeColumn(1.2f); // Agreeability
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("Medikament").SemiBold();
                                header.Cell().Element(CellStyle).Text("Packungsgröße").SemiBold();
                                header.Cell().Element(CellStyle).Text("Geschäft").SemiBold();
                                header.Cell().Element(CellStyle).Text("Gekauft am").SemiBold();
                                header.Cell().Element(CellStyle).Text("Geöffnet am").SemiBold();
                                header.Cell().Element(CellStyle).Text("Ablaufdatum").SemiBold();
                                header.Cell().Element(CellStyle).Text("Betroffene Person").SemiBold();
                                header.Cell().Element(CellStyle).Text("Menge").SemiBold();
                                header.Cell().Element(CellStyle).Text("Verträglichkeit").SemiBold();

                                static IContainer CellStyle(IContainer container)
                                {
                                    return container
                                        .Border(1)
                                        .BorderColor(Colors.Grey.Lighten1)
                                        .Background(Colors.Grey.Lighten3)
                                        .Padding(5)
                                        .AlignCenter()
                                        .AlignMiddle();
                                }
                            });

                            // Rows
                            foreach (var drug in drugs)
                            {
                                var isExpired = drug.ExpirationDate.HasValue && drug.ExpirationDate.Value < DateTime.Now;
                                var isExpiringSoon = drug.ExpirationDate.HasValue && 
                                                     drug.ExpirationDate.Value >= DateTime.Now && 
                                                     drug.ExpirationDate.Value <= DateTime.Now.AddDays(30);

                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.DrugName);
                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.PackageSize);
                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.Shop);
                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.BoughtOn?.ToString("dd.MM.yyyy") ?? "N/A");
                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.OpenedOn?.ToString("dd.MM.yyyy") ?? "N/A");
                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.ExpirationDate?.ToString("dd.MM.yyyy") ?? "N/A");
                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.PersonConcerned);
                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.AmountLeft);
                                table.Cell().Element(container => RowCellStyle(container, isExpired, isExpiringSoon))
                                    .Text(drug.Agreeability);
                            }

                            static IContainer RowCellStyle(IContainer container, bool isExpired, bool isExpiringSoon)
                            {
                                var styled = container
                                    .Border(1)
                                    .BorderColor(Colors.Grey.Lighten2)
                                    .Padding(5);

                                if (isExpired)
                                {
                                    styled = styled.Background(Colors.Red.Lighten4);
                                }
                                else if (isExpiringSoon)
                                {
                                    styled = styled.Background(Colors.Orange.Lighten4);
                                }

                                return styled;
                            }
                        });
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Seite ");
                        x.CurrentPageNumber();
                        x.Span(" von ");
                        x.TotalPages();
                    });
            });
        });

        document.GeneratePdf(outputPath);
    }

    private class DrugReportDto
    {
        public string DrugName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string PackageSize { get; set; } = string.Empty;
        public string Shop { get; set; } = string.Empty;
        public DateTime? BoughtOn { get; set; }
        public DateTime? OpenedOn { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string BoughtBy { get; set; } = string.Empty;
        public string PersonConcerned { get; set; } = string.Empty;
        public string AmountLeft { get; set; } = string.Empty;
        public string Agreeability { get; set; } = string.Empty;
    }
}
