using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Drugs;

internal sealed class GetDrugById(
    ILogger<GetDrugById> logger,
    ApplicationDbContext dbContext)
    : Endpoint<GetDrugByIdRequest, DrugDto>
{
    public override void Configure()
    {
        Get("/drugs/{id}");
        Summary(s =>
        {
            s.Summary = "Retrieves a drug by ID";
        });
        Description(b => b
            .ProducesProblemDetails(404, "application/json+problem")
            .Produces<DrugDto>(200, contentType: "application/json"));
        Tags("Drugs");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetDrugByIdRequest request, CancellationToken ct)
    {
        logger.LogInformation("Retrieving drug with ID: {DrugId}", request.Id);

        var drug = await dbContext.Drugs
            .Where(d => d.Id == request.Id)
            .Select(d => new DrugDto
            {
                Id = d.Id,
                MetadataId = d.MetadataId,
                DrugPackageSizeId = d.DrugPackageSizeId,
                ShopId = d.ShopId,
                BoughtOn = d.BoughtOn,
                OpenedOn = d.OpenedOn,
                PalatableUntil = d.PalatableUntil,
                BoughtBy = d.BoughtBy,
                PersonConcerned = d.PersonConcerned,
                AmountLeftAbsolute = d.AmountLeftAbsolute,
                AmountLeftInPercentage = d.AmountLeftInPercentage
            })
            .FirstOrDefaultAsync(ct);

        if (drug is null)
        {
            logger.LogWarning("Drug with ID {DrugId} not found", request.Id);
            await SendNotFoundAsync(ct);
            return;
        }

        logger.LogInformation("Drug found with ID: {DrugId}", drug.Id);
        await SendOkAsync(drug, ct);
    }
}

internal sealed record GetDrugByIdRequest
{
    public int Id { get; init; }
}

internal sealed class GetDrugByIdRequestValidator : Validator<GetDrugByIdRequest>
{
    public GetDrugByIdRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");
    }
}
