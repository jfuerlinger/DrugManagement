using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.PackageSizes;

internal sealed class GetPackageSizeById(
    ILogger<GetPackageSizeById> logger,
    ApplicationDbContext dbContext)
    : Endpoint<GetPackageSizeByIdRequest, PackageSizeDto>
{
    public override void Configure()
    {
        Get("/packagesizes/{id}");
        Summary(s =>
        {
            s.Summary = "Retrieves a package size by ID";
        });
        Description(b => b
            .ProducesProblemDetails(404, "application/json+problem")
            .Produces<PackageSizeDto>(200, contentType: "application/json"));
        Tags("PackageSizes");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPackageSizeByIdRequest request, CancellationToken ct)
    {
        logger.LogInformation("Retrieving package size with ID: {PackageSizeId}", request.Id);

        var packageSize = await dbContext.DrugPackageSizes
            .Where(p => p.Id == request.Id)
            .Select(p => new PackageSizeDto
            {
                Id = p.Id,
                DrugMetaDataId = p.DrugMetaDataId,
                BundleSize = p.BundleSize,
                BundleType = p.BundleType
            })
            .FirstOrDefaultAsync(ct);

        if (packageSize is null)
        {
            logger.LogWarning("Package size with ID {PackageSizeId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        logger.LogInformation("Package size found: {BundleSize} {BundleType}", packageSize.BundleSize, packageSize.BundleType);
        await Send.OkAsync(packageSize, ct);
    }
}

internal sealed record GetPackageSizeByIdRequest
{
    public int Id { get; init; }
}

internal sealed class GetPackageSizeByIdRequestValidator : Validator<GetPackageSizeByIdRequest>
{
    public GetPackageSizeByIdRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");
    }
}
