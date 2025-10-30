using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.PackageSizes;

internal sealed class DeletePackageSize(
    ILogger<DeletePackageSize> logger,
    ApplicationDbContext dbContext)
    : Endpoint<DeletePackageSizeRequest>
{
    public override void Configure()
    {
        Delete("/packagesizes/{id}");
        Summary(s =>
        {
            s.Summary = "Deletes a package size";
        });
        Description(b => b
            .ProducesProblemDetails(404, "application/json+problem")
            .ProducesProblemDetails(409, "application/json+problem")
            .Produces(204));
        Tags("PackageSizes");
        AllowAnonymous();
    }

    public override async Task HandleAsync(DeletePackageSizeRequest request, CancellationToken ct)
    {
        logger.LogInformation("Deleting package size with ID: {PackageSizeId}", request.Id);

        var packageSize = await dbContext.DrugPackageSizes
            .Include(p => p.Drugs)
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (packageSize is null)
        {
            logger.LogWarning("Package size with ID {PackageSizeId} not found", request.Id);
            await SendNotFoundAsync(ct);
            return;
        }

        // Check if package size has associated drugs
        if (packageSize.Drugs.Any())
        {
            logger.LogWarning(
                "Cannot delete package size with ID {PackageSizeId} because it has {DrugCount} associated drugs",
                request.Id, packageSize.Drugs.Count);

            AddError("Cannot delete package size because it has associated drugs");
            await SendErrorsAsync(409, ct);
            return;
        }

        dbContext.DrugPackageSizes.Remove(packageSize);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Package size deleted: {BundleSize} {BundleType}", packageSize.BundleSize, packageSize.BundleType);

        await SendNoContentAsync(ct);
    }
}

internal sealed record DeletePackageSizeRequest
{
    public int Id { get; init; }
}

internal sealed class DeletePackageSizeRequestValidator : Validator<DeletePackageSizeRequest>
{
    public DeletePackageSizeRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");
    }
}
