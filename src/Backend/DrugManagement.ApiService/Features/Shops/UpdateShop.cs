using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Shops;

internal sealed class UpdateShop(
    ILogger<UpdateShop> logger,
    ApplicationDbContext dbContext)
    : Endpoint<UpdateShopRequest, ShopDto>
{
    public override void Configure()
    {
        Put("/shops/{id}");
        Summary(s =>
      {
          s.Summary = "Updates an existing shop";
          s.ExampleRequest = new UpdateShopRequest
          {
              Id = 1,
              Name = "Apotheke am Markt",
              Street = "Hauptstraße 1",
              Postalcode = "12345",
              City = "Berlin",
              Phone = "+49 30 12345678"
          };
      });
        Description(b => b
    .ProducesProblemDetails(404, "application/json+problem")
        .Produces<ShopDto>(200, contentType: "application/json"));
        Tags("Shops");
        AllowAnonymous();
    }

    public override async Task HandleAsync(UpdateShopRequest request, CancellationToken ct)
    {
        logger.LogInformation("Updating shop with ID: {ShopId}", request.Id);

        var shop = await dbContext.Shops
   .FirstOrDefaultAsync(s => s.Id == request.Id, ct);

        if (shop is null)
        {
            logger.LogWarning("Shop with ID {ShopId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        shop.Name = request.Name;
        shop.Street = request.Street;
        shop.Postalcode = request.Postalcode;
        shop.City = request.City;
        shop.Phone = request.Phone;

        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Shop updated: {ShopName}", shop.Name);

        var response = new ShopDto
        {
            Id = shop.Id,
            Name = shop.Name,
            Street = shop.Street,
            Postalcode = shop.Postalcode,
            City = shop.City,
            Phone = shop.Phone
        };

        await Send.OkAsync(response, ct);
    }
}

internal sealed record UpdateShopRequest
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Street { get; init; }
    public string? Postalcode { get; init; }
    public string? City { get; init; }
    public string? Phone { get; init; }
}
