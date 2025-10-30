using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.DrugMetadata;

internal sealed class UpdateDrugMetadata(
    ILogger<UpdateDrugMetadata> logger,
    ApplicationDbContext dbContext)
    : Endpoint<UpdateDrugMetadataRequest, DrugMetadataDto>
{
    public override void Configure()
    {
        Put("/drugmetadata/{id}");
        Summary(s =>
        {
            s.Summary = "Updates an existing drug metadata";
            s.ExampleRequest = new UpdateDrugMetadataRequest
            {
                Id = 1,
                Name = "Aspirin",
                Description = "Pain reliever and fever reducer",
                ImageUrl = "https://example.com/aspirin.jpg",
                Agreeability = "Good"
            };
        });
        Description(b => b
            .ProducesProblemDetails(404, "application/json+problem")
            .Produces<DrugMetadataDto>(200, contentType: "application/json"));
        Tags("DrugMetadata");
        AllowAnonymous();
    }

    public override async Task HandleAsync(UpdateDrugMetadataRequest request, CancellationToken ct)
    {
        logger.LogInformation("Updating drug metadata with ID: {DrugMetadataId}", request.Id);

        var drugMetadata = await dbContext.DrugMetadata
            .FirstOrDefaultAsync(d => d.Id == request.Id, ct);

        if (drugMetadata is null)
        {
            logger.LogWarning("Drug metadata with ID {DrugMetadataId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        drugMetadata.Name = request.Name;
        drugMetadata.Description = request.Description;
        drugMetadata.ImageUrl = request.ImageUrl;
        drugMetadata.Agreeability = request.Agreeability;

        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Drug metadata updated: {DrugName}", drugMetadata.Name);

        var response = new DrugMetadataDto
        {
            Id = drugMetadata.Id,
            Name = drugMetadata.Name,
            Description = drugMetadata.Description,
            ImageUrl = drugMetadata.ImageUrl,
            Agreeability = drugMetadata.Agreeability
        };

        await Send.OkAsync(response, ct);
    }
}

internal sealed record UpdateDrugMetadataRequest
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public string? Agreeability { get; init; }
}

internal sealed class UpdateDrugMetadataRequestValidator : Validator<UpdateDrugMetadataRequest>
{
    public UpdateDrugMetadataRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");

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
