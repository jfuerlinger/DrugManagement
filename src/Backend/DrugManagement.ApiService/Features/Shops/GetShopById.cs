using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Shops;

internal sealed class GetShopById(
    ILogger<GetShopById> logger,
    ApplicationDbContext dbContext)
 : Endpoint<GetShopByIdRequest, ShopDto>
{
    public override void Configure()
    {
        Get("/shops/{id}");
        Summary(s =>
               {
                   s.Summary = "Retrieves a shop by ID";
               });
        Description(b => b
          .ProducesProblemDetails(404, "application/json+problem")
        .Produces<ShopDto>(200, contentType: "application/json"));
        Tags("Shops");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetShopByIdRequest request, CancellationToken ct)
    {
        logger.LogInformation("Retrieving shop with ID: {ShopId}", request.Id);

        var shop = await dbContext.Shops
         .Where(s => s.Id == request.Id)
    .Select(s => new ShopDto
    {
        Id = s.Id,
        Name = s.Name,
        Street = s.Street,
        Postalcode = s.Postalcode,
        City = s.City,
        Phone = s.Phone
    })
      .FirstOrDefaultAsync(ct);

        if (shop is null)
        {
            logger.LogWarning("Shop with ID {ShopId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        logger.LogInformation("Shop found: {ShopName}", shop.Name);
        await Send.OkAsync(shop, ct);
    }
}

internal sealed record GetShopByIdRequest
{
    public int Id { get; init; }
}

internal sealed class GetShopByIdRequestValidator : Validator<GetShopByIdRequest>
{
    public GetShopByIdRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");
    }
}
