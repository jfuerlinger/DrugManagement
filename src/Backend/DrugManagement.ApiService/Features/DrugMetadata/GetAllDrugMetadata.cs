using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.DrugMetadata;

internal sealed class GetAllDrugMetadata(
    ILogger<GetAllDrugMetadata> logger,
    ApplicationDbContext dbContext)
    : EndpointWithoutRequest<GetAllDrugMetadataResponse>
{
    public override void Configure()
    {
        Get("/drugmetadata");
        Summary(s =>
        {
            s.Summary = "Retrieves all drug metadata";
        });
        Description(b => b
            .Produces<GetAllDrugMetadataResponse>(200, contentType: "application/json"));
        Tags("DrugMetadata");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Retrieving all drug metadata");

        var drugMetadata = await dbContext.DrugMetadata
            .Select(d => new DrugMetadataDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                ImageUrl = d.ImageUrl,
                Agreeability = d.Agreeability
            })
            .ToListAsync(ct);

        logger.LogInformation("Found {Count} drug metadata records", drugMetadata.Count);

        await Send.OkAsync(new GetAllDrugMetadataResponse { DrugMetadata = drugMetadata }, ct);
    }
}

internal sealed record GetAllDrugMetadataResponse
{
    public List<DrugMetadataDto> DrugMetadata { get; init; } = new();
}

internal sealed record DrugMetadataDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public string? Agreeability { get; init; }
}
