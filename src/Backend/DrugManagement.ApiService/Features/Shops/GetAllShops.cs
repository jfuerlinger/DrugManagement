using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Shops;

internal sealed class GetAllShops(
    ILogger<GetAllShops> logger,
    ApplicationDbContext dbContext)
    : EndpointWithoutRequest<GetAllShopsResponse>
{
    public override void Configure()
    {
        Get("/shops");
        Summary(s =>
               {
                   s.Summary = "Retrieves all shops";
               });
        Description(b => b
            .Produces<GetAllShopsResponse>(200, contentType: "application/json"));
        Tags("Shops");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Retrieving all shops");

        var shops = await dbContext.Shops
            .Select(s => new ShopDto
            {
                Id = s.Id,
                Name = s.Name,
                Street = s.Street,
                Postalcode = s.Postalcode,
                City = s.City,
                Phone = s.Phone
            })
    .ToListAsync(ct);

        logger.LogInformation("Found {Count} shops", shops.Count);

        await Send.OkAsync(new GetAllShopsResponse { Shops = shops }, ct);
    }
}

internal sealed record GetAllShopsResponse
{
    public List<ShopDto> Shops { get; init; } = new();
}

internal sealed record ShopDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Street { get; init; }
    public string? Postalcode { get; init; }
    public string? City { get; init; }
    public string? Phone { get; init; }
}
