using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Drugs;

internal sealed class GetAllDrugs(
    ILogger<GetAllDrugs> logger,
    ApplicationDbContext dbContext)
    : EndpointWithoutRequest<GetAllDrugsResponse>
{
    public override void Configure()
    {
        Get("/drugs");
        Summary(s =>
        {
            s.Summary = "Retrieves all drugs";
        });
        Description(b => b
            .Produces<GetAllDrugsResponse>(200, contentType: "application/json"));
        Tags("Drugs");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Retrieving all drugs");

        var drugs = await dbContext.Drugs
            .Select(d => new DrugDto
            {
                Id = d.Id,
                MetadataId = d.MetadataId,
                DrugPackageSizeId = d.DrugPackageSizeId,
                ShopId = d.ShopId,
                BoughtOn = d.BoughtOn,
                OpenedOn = d.OpenedOn,
                PalatableUntil = d.PalatableUntil,
                BoughtBy = d.BoughtBy,
                PersonConcerned = d.PersonConcerned,
                AmountLeftAbsolute = d.AmountLeftAbsolute,
                AmountLeftInPercentage = d.AmountLeftInPercentage
            })
            .ToListAsync(ct);

        logger.LogInformation("Found {Count} drugs", drugs.Count);

        await Send.OkAsync(new GetAllDrugsResponse { Drugs = drugs }, ct);
    }
}

internal sealed record GetAllDrugsResponse
{
    public List<DrugDto> Drugs { get; init; } = new();
}

internal sealed record DrugDto
{
    public int Id { get; init; }
    public int MetadataId { get; init; }
    public int DrugPackageSizeId { get; init; }
    public int ShopId { get; init; }
    public DateTime? BoughtOn { get; init; }
    public DateTime? OpenedOn { get; init; }
    public DateTime? PalatableUntil { get; init; }
    public int? BoughtBy { get; init; }
    public int? PersonConcerned { get; init; }
    public decimal? AmountLeftAbsolute { get; init; }
    public decimal? AmountLeftInPercentage { get; init; }
}
