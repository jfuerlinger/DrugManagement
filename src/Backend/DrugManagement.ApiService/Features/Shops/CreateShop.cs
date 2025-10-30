using FastEndpoints;
using FluentValidation;
using DrugManagement.Core.DataAccess;
using DrugManagement.Core.Model;

namespace DrugManagement.ApiService.Features.Shops;

internal sealed class CreateShop(
    ILogger<CreateShop> logger,
    ApplicationDbContext dbContext)
    : Endpoint<CreateShopRequest, CreateShopResponse>
{
    public override void Configure()
    {
        Post("/shops");
        Summary(s =>
            {
                s.Summary = "Creates a new shop";
                s.ExampleRequest = new CreateShopRequest
                {
                    Name = "Apotheke am Markt",
                    Street = "Hauptstra�e 1",
                    Postalcode = "12345",
                    City = "Berlin",
                    Phone = "+49 30 12345678"
                };
            });
        Description(b => b
         .ProducesProblemDetails(400, "application/json+problem")
            .Produces<CreateShopResponse>(201, contentType: "application/json"));
        Tags("Shops");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CreateShopRequest request, CancellationToken ct)
    {
        logger.LogInformation("Creating new shop: {ShopName}", request.Name);

        var shop = new Shop
        {
            Name = request.Name,
            Street = request.Street,
            Postalcode = request.Postalcode,
            City = request.City,
            Phone = request.Phone
        };

        dbContext.Shops.Add(shop);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Shop created with ID: {ShopId}", shop.Id);

        var response = new CreateShopResponse
        {
            Id = shop.Id,
            Name = shop.Name,
            Street = shop.Street,
            Postalcode = shop.Postalcode,
            City = shop.City,
            Phone = shop.Phone
        };

        await Send.CreatedAtAsync<GetShopById>(
                 routeValues: new { id = shop.Id },
          responseBody: response,
             cancellation: ct);
    }
}

internal sealed record CreateShopRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Street { get; init; }
    public string? Postalcode { get; init; }
    public string? City { get; init; }
    public string? Phone { get; init; }
}

internal sealed class CreateShopRequestValidator : Validator<CreateShopRequest>
{
    public CreateShopRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required")
            .MaximumLength(200)
            .WithMessage("Name must not exceed 200 characters");

        RuleFor(x => x.Street)
            .MaximumLength(200)
            .WithMessage("Street must not exceed 200 characters")
            .When(x => x.Street != null);

        RuleFor(x => x.Postalcode)
            .MaximumLength(20)
            .WithMessage("Postalcode must not exceed 20 characters")
            .When(x => x.Postalcode != null);

        RuleFor(x => x.City)
            .MaximumLength(100)
            .WithMessage("City must not exceed 100 characters")
            .When(x => x.City != null);

        RuleFor(x => x.Phone)
            .MaximumLength(50)
            .WithMessage("Phone must not exceed 50 characters")
            .When(x => x.Phone != null);
    }
}

internal sealed record CreateShopResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Street { get; init; }
    public string? Postalcode { get; init; }
    public string? City { get; init; }
    public string? Phone { get; init; }
}
