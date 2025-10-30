using FastEndpoints;
using FluentValidation;
using DrugManagement.Core.DataAccess;
using DrugManagement.Core.Model;

namespace DrugManagement.ApiService.Features.DrugMetadata;

internal sealed class CreateDrugMetadata(
    ILogger<CreateDrugMetadata> logger,
    ApplicationDbContext dbContext)
    : Endpoint<CreateDrugMetadataRequest, CreateDrugMetadataResponse>
{
    public override void Configure()
    {
        Post("/drugmetadata");
        Summary(s =>
        {
            s.Summary = "Creates a new drug metadata";
            s.ExampleRequest = new CreateDrugMetadataRequest
            {
                Name = "Aspirin",
                Description = "Pain reliever and fever reducer",
                ImageUrl = "https://example.com/aspirin.jpg",
                Agreeability = "Good"
            };
        });
        Description(b => b
            .ProducesProblemDetails(400, "application/json+problem")
            .Produces<CreateDrugMetadataResponse>(201, contentType: "application/json"));
        Tags("DrugMetadata");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CreateDrugMetadataRequest request, CancellationToken ct)
    {
        logger.LogInformation("Creating new drug metadata: {DrugName}", request.Name);

        var drugMetadata = new Core.Model.DrugMetadata
        {
            Name = request.Name,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            Agreeability = request.Agreeability
        };

        dbContext.DrugMetadata.Add(drugMetadata);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Drug metadata created with ID: {DrugMetadataId}", drugMetadata.Id);

        var response = new CreateDrugMetadataResponse
        {
            Id = drugMetadata.Id,
            Name = drugMetadata.Name,
            Description = drugMetadata.Description,
            ImageUrl = drugMetadata.ImageUrl,
            Agreeability = drugMetadata.Agreeability
        };

        await Send.CreatedAtAsync<GetDrugMetadataById>(
            routeValues: new { id = drugMetadata.Id },
            responseBody: response,
            cancellation: ct);
    }
}

internal sealed record CreateDrugMetadataRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public string? Agreeability { get; init; }
}

internal sealed class CreateDrugMetadataRequestValidator : Validator<CreateDrugMetadataRequest>
{
    public CreateDrugMetadataRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required")
            .MaximumLength(200)
            .WithMessage("Name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description must not exceed 1000 characters")
            .When(x => x.Description != null);

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500)
            .WithMessage("ImageUrl must not exceed 500 characters")
            .When(x => x.ImageUrl != null);

        RuleFor(x => x.Agreeability)
            .MaximumLength(100)
            .WithMessage("Agreeability must not exceed 100 characters")
            .When(x => x.Agreeability != null);
    }
}

internal sealed record CreateDrugMetadataResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public string? Agreeability { get; init; }
}
