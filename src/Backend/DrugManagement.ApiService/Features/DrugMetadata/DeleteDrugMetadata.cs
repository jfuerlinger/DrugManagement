using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.DrugMetadata;

internal sealed class DeleteDrugMetadata(
    ILogger<DeleteDrugMetadata> logger,
    ApplicationDbContext dbContext)
    : Endpoint<DeleteDrugMetadataRequest>
{
    public override void Configure()
    {
        Delete("/drugmetadata/{id}");
        Summary(s =>
        {
            s.Summary = "Deletes a drug metadata";
        });
        Description(b => b
            .ProducesProblemDetails(404, "application/json+problem")
            .ProducesProblemDetails(409, "application/json+problem")
            .Produces(204));
        Tags("DrugMetadata");
        AllowAnonymous();
    }

    public override async Task HandleAsync(DeleteDrugMetadataRequest request, CancellationToken ct)
    {
        logger.LogInformation("Deleting drug metadata with ID: {DrugMetadataId}", request.Id);

        var drugMetadata = await dbContext.DrugMetadata
            .Include(d => d.PackageSizes)
            .Include(d => d.Drugs)
            .FirstOrDefaultAsync(d => d.Id == request.Id, ct);

        if (drugMetadata is null)
        {
            logger.LogWarning("Drug metadata with ID {DrugMetadataId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        // Check if drug metadata has associated package sizes or drugs
        if (drugMetadata.PackageSizes.Any() || drugMetadata.Drugs.Any())
        {
            logger.LogWarning(
                "Cannot delete drug metadata with ID {DrugMetadataId} because it has {PackageSizeCount} associated package sizes and {DrugCount} associated drugs",
                request.Id, drugMetadata.PackageSizes.Count, drugMetadata.Drugs.Count);

            AddError("Cannot delete drug metadata because it has associated package sizes or drugs");
            await Send.ErrorsAsync(409, ct);
            return;
        }

        dbContext.DrugMetadata.Remove(drugMetadata);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Drug metadata deleted: {DrugName}", drugMetadata.Name);

        await Send.NoContentAsync(ct);
    }
}

internal sealed record DeleteDrugMetadataRequest
{
    public int Id { get; init; }
}

internal sealed class DeleteDrugMetadataRequestValidator : Validator<DeleteDrugMetadataRequest>
{
    public DeleteDrugMetadataRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");
    }
}
