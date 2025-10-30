using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Drugs;

internal sealed class DeleteDrug(
    ILogger<DeleteDrug> logger,
    ApplicationDbContext dbContext)
    : Endpoint<DeleteDrugRequest>
{
    public override void Configure()
    {
        Delete("/drugs/{id}");
        Summary(s =>
        {
            s.Summary = "Deletes a drug";
        });
        Description(b => b
            .ProducesProblemDetails(404, "application/json+problem")
            .Produces(204));
        Tags("Drugs");
        AllowAnonymous();
    }

    public override async Task HandleAsync(DeleteDrugRequest request, CancellationToken ct)
    {
        logger.LogInformation("Deleting drug with ID: {DrugId}", request.Id);

        var drug = await dbContext.Drugs
            .FirstOrDefaultAsync(d => d.Id == request.Id, ct);

        if (drug is null)
        {
            logger.LogWarning("Drug with ID {DrugId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        dbContext.Drugs.Remove(drug);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Drug deleted with ID: {DrugId}", drug.Id);

        await Send.NoContentAsync(ct);
    }
}

internal sealed record DeleteDrugRequest
{
    public int Id { get; init; }
}

internal sealed class DeleteDrugRequestValidator : Validator<DeleteDrugRequest>
{
    public DeleteDrugRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");
    }
}
