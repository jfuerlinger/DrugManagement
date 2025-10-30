using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.PackageSizes;

internal sealed class GetAllPackageSizes(
    ILogger<GetAllPackageSizes> logger,
    ApplicationDbContext dbContext)
    : EndpointWithoutRequest<GetAllPackageSizesResponse>
{
    public override void Configure()
    {
        Get("/packagesizes");
        Summary(s =>
        {
            s.Summary = "Retrieves all package sizes";
        });
        Description(b => b
            .Produces<GetAllPackageSizesResponse>(200, contentType: "application/json"));
        Tags("PackageSizes");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Retrieving all package sizes");

        var packageSizes = await dbContext.DrugPackageSizes
            .Select(p => new PackageSizeDto
            {
                Id = p.Id,
                DrugMetaDataId = p.DrugMetaDataId,
                BundleSize = p.BundleSize,
                BundleType = p.BundleType
            })
            .ToListAsync(ct);

        logger.LogInformation("Found {Count} package sizes", packageSizes.Count);

        await Send.OkAsync(new GetAllPackageSizesResponse { PackageSizes = packageSizes }, ct);
    }
}

internal sealed record GetAllPackageSizesResponse
{
    public List<PackageSizeDto> PackageSizes { get; init; } = new();
}

internal sealed record PackageSizeDto
{
    public int Id { get; init; }
    public int DrugMetaDataId { get; init; }
    public int BundleSize { get; init; }
    public string? BundleType { get; init; }
}
