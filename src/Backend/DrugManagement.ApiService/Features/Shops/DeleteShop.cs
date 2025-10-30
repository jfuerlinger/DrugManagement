using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Shops;

internal sealed class DeleteShop(
    ILogger<DeleteShop> logger,
    ApplicationDbContext dbContext)
    : Endpoint<DeleteShopRequest>
{
    public override void Configure()
    {
        Delete("/shops/{id}");
        Summary(s =>
    {
        s.Summary = "Deletes a shop";
    });
        Description(b => b
             .ProducesProblemDetails(404, "application/json+problem")
            .ProducesProblemDetails(409, "application/json+problem")
             .Produces(204));
        Tags("Shops");
        AllowAnonymous();
    }

    public override async Task HandleAsync(DeleteShopRequest request, CancellationToken ct)
    {
        logger.LogInformation("Deleting shop with ID: {ShopId}", request.Id);

        var shop = await dbContext.Shops
      .Include(s => s.Drugs)
   .FirstOrDefaultAsync(s => s.Id == request.Id, ct);

        if (shop is null)
        {
            logger.LogWarning("Shop with ID {ShopId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        // Check if shop has associated drugs
        if (shop.Drugs.Any())
        {
            logger.LogWarning("Cannot delete shop with ID {ShopId} because it has {DrugCount} associated drugs",
               request.Id, shop.Drugs.Count);

            AddError("Cannot delete shop because it has associated drugs");
            await Send.ErrorsAsync(409, ct);
            return;
        }

        dbContext.Shops.Remove(shop);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Shop deleted: {ShopName}", shop.Name);

        await Send.NoContentAsync(ct);
    }
}

internal sealed record DeleteShopRequest
{
    public int Id { get; init; }
}
