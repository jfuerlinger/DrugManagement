using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;
using DrugManagement.Core.Model;

namespace DrugManagement.ApiService.Features.PackageSizes;

internal sealed class CreatePackageSize(
    ILogger<CreatePackageSize> logger,
    ApplicationDbContext dbContext)
    : Endpoint<CreatePackageSizeRequest, CreatePackageSizeResponse>
{
    public override void Configure()
    {
        Post("/packagesizes");
        Summary(s =>
        {
            s.Summary = "Creates a new package size";
            s.ExampleRequest = new CreatePackageSizeRequest
            {
                DrugMetaDataId = 1,
                BundleSize = 20,
                BundleType = "Tablets"
            };
        });
        Description(b => b
            .ProducesProblemDetails(400, "application/json+problem")
            .ProducesProblemDetails(404, "application/json+problem")
            .Produces<CreatePackageSizeResponse>(201, contentType: "application/json"));
        Tags("PackageSizes");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CreatePackageSizeRequest request, CancellationToken ct)
    {
        logger.LogInformation("Creating new package size for DrugMetaDataId: {DrugMetaDataId}", request.DrugMetaDataId);

        // Verify that the drug metadata exists
        var drugMetadataExists = await dbContext.DrugMetadata
            .AnyAsync(d => d.Id == request.DrugMetaDataId, ct);

        if (!drugMetadataExists)
        {
            logger.LogWarning("Drug metadata with ID {DrugMetaDataId} not found", request.DrugMetaDataId);
            AddError("Drug metadata not found");
            await Send.ErrorsAsync(404, ct);
            return;
        }

        var packageSize = new DrugPackageSize
        {
            DrugMetaDataId = request.DrugMetaDataId,
            BundleSize = request.BundleSize,
            BundleType = request.BundleType
        };

        dbContext.DrugPackageSizes.Add(packageSize);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Package size created with ID: {PackageSizeId}", packageSize.Id);

        var response = new CreatePackageSizeResponse
        {
            Id = packageSize.Id,
            DrugMetaDataId = packageSize.DrugMetaDataId,
            BundleSize = packageSize.BundleSize,
            BundleType = packageSize.BundleType
        };

        await Send.CreatedAtAsync<GetPackageSizeById>(
            routeValues: new { id = packageSize.Id },
            responseBody: response,
            cancellation: ct);
    }
}

internal sealed record CreatePackageSizeRequest
{
    public int DrugMetaDataId { get; init; }
    public int BundleSize { get; init; }
    public string? BundleType { get; init; }
}

internal sealed class CreatePackageSizeRequestValidator : Validator<CreatePackageSizeRequest>
{
    public CreatePackageSizeRequestValidator()
    {
        RuleFor(x => x.DrugMetaDataId)
            .GreaterThan(0)
            .WithMessage("DrugMetaDataId must be greater than 0");

        RuleFor(x => x.BundleSize)
            .GreaterThan(0)
            .WithMessage("BundleSize must be greater than 0");

        RuleFor(x => x.BundleType)
            .MaximumLength(100)
            .WithMessage("BundleType must not exceed 100 characters")
            .When(x => x.BundleType != null);
    }
}

internal sealed record CreatePackageSizeResponse
{
    public int Id { get; init; }
    public int DrugMetaDataId { get; init; }
    public int BundleSize { get; init; }
    public string? BundleType { get; init; }
}
