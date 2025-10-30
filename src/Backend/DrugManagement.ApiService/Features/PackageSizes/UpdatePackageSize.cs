using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.PackageSizes;

internal sealed class UpdatePackageSize(
    ILogger<UpdatePackageSize> logger,
    ApplicationDbContext dbContext)
    : Endpoint<UpdatePackageSizeRequest, PackageSizeDto>
{
    public override void Configure()
    {
        Put("/packagesizes/{id}");
        Summary(s =>
        {
            s.Summary = "Updates an existing package size";
            s.ExampleRequest = new UpdatePackageSizeRequest
            {
                Id = 1,
                DrugMetaDataId = 1,
                BundleSize = 20,
                BundleType = "Tablets"
            };
        });
        Description(b => b
            .ProducesProblemDetails(404, "application/json+problem")
            .Produces<PackageSizeDto>(200, contentType: "application/json"));
        Tags("PackageSizes");
        AllowAnonymous();
    }

    public override async Task HandleAsync(UpdatePackageSizeRequest request, CancellationToken ct)
    {
        logger.LogInformation("Updating package size with ID: {PackageSizeId}", request.Id);

        var packageSize = await dbContext.DrugPackageSizes
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (packageSize is null)
        {
            logger.LogWarning("Package size with ID {PackageSizeId} not found", request.Id);
            await SendNotFoundAsync(ct);
            return;
        }

        // Verify that the drug metadata exists
        var drugMetadataExists = await dbContext.DrugMetadata
            .AnyAsync(d => d.Id == request.DrugMetaDataId, ct);

        if (!drugMetadataExists)
        {
            logger.LogWarning("Drug metadata with ID {DrugMetaDataId} not found", request.DrugMetaDataId);
            AddError("Drug metadata not found");
            await SendErrorsAsync(404, ct);
            return;
        }

        packageSize.DrugMetaDataId = request.DrugMetaDataId;
        packageSize.BundleSize = request.BundleSize;
        packageSize.BundleType = request.BundleType;

        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Package size updated: {BundleSize} {BundleType}", packageSize.BundleSize, packageSize.BundleType);

        var response = new PackageSizeDto
        {
            Id = packageSize.Id,
            DrugMetaDataId = packageSize.DrugMetaDataId,
            BundleSize = packageSize.BundleSize,
            BundleType = packageSize.BundleType
        };

        await SendOkAsync(response, ct);
    }
}

internal sealed record UpdatePackageSizeRequest
{
    public int Id { get; init; }
    public int DrugMetaDataId { get; init; }
    public int BundleSize { get; init; }
    public string? BundleType { get; init; }
}

internal sealed class UpdatePackageSizeRequestValidator : Validator<UpdatePackageSizeRequest>
{
    public UpdatePackageSizeRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");

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
