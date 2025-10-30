using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;
using DrugManagement.Core.Model;

namespace DrugManagement.ApiService.Features.Drugs;

internal sealed class CreateDrug(
    ILogger<CreateDrug> logger,
    ApplicationDbContext dbContext)
    : Endpoint<CreateDrugRequest, CreateDrugResponse>
{
    public override void Configure()
    {
        Post("/drugs");
        Summary(s =>
        {
            s.Summary = "Creates a new drug";
            s.ExampleRequest = new CreateDrugRequest
            {
                MetadataId = 1,
                DrugPackageSizeId = 1,
                ShopId = 1,
                BoughtOn = DateTime.UtcNow,
                OpenedOn = null,
                PalatableUntil = DateTime.UtcNow.AddMonths(6),
                BoughtBy = 1,
                PersonConcerned = 1,
                AmountLeftAbsolute = 100,
                AmountLeftInPercentage = 100
            };
        });
        Description(b => b
            .ProducesProblemDetails(400, "application/json+problem")
            .ProducesProblemDetails(404, "application/json+problem")
            .Produces<CreateDrugResponse>(201, contentType: "application/json"));
        Tags("Drugs");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CreateDrugRequest request, CancellationToken ct)
    {
        logger.LogInformation("Creating new drug for MetadataId: {MetadataId}", request.MetadataId);

        // Verify that the related entities exist
        var metadataExists = await dbContext.DrugMetadata
            .AnyAsync(d => d.Id == request.MetadataId, ct);

        if (!metadataExists)
        {
            logger.LogWarning("Drug metadata with ID {MetadataId} not found", request.MetadataId);
            AddError("Drug metadata not found");
            await Send.ErrorsAsync(404, ct);
            return;
        }

        var packageSizeExists = await dbContext.DrugPackageSizes
            .AnyAsync(p => p.Id == request.DrugPackageSizeId, ct);

        if (!packageSizeExists)
        {
            logger.LogWarning("Package size with ID {DrugPackageSizeId} not found", request.DrugPackageSizeId);
            AddError("Package size not found");
            await Send.ErrorsAsync(404, ct);
            return;
        }

        var shopExists = await dbContext.Shops
            .AnyAsync(s => s.Id == request.ShopId, ct);

        if (!shopExists)
        {
            logger.LogWarning("Shop with ID {ShopId} not found", request.ShopId);
            AddError("Shop not found");
            await Send.ErrorsAsync(404, ct);
            return;
        }

        var drug = new Drug
        {
            MetadataId = request.MetadataId,
            DrugPackageSizeId = request.DrugPackageSizeId,
            ShopId = request.ShopId,
            BoughtOn = request.BoughtOn,
            OpenedOn = request.OpenedOn,
            PalatableUntil = request.PalatableUntil,
            BoughtBy = request.BoughtBy,
            PersonConcerned = request.PersonConcerned,
            AmountLeftAbsolute = request.AmountLeftAbsolute,
            AmountLeftInPercentage = request.AmountLeftInPercentage
        };

        dbContext.Drugs.Add(drug);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Drug created with ID: {DrugId}", drug.Id);

        var response = new CreateDrugResponse
        {
            Id = drug.Id,
            MetadataId = drug.MetadataId,
            DrugPackageSizeId = drug.DrugPackageSizeId,
            ShopId = drug.ShopId,
            BoughtOn = drug.BoughtOn,
            OpenedOn = drug.OpenedOn,
            PalatableUntil = drug.PalatableUntil,
            BoughtBy = drug.BoughtBy,
            PersonConcerned = drug.PersonConcerned,
            AmountLeftAbsolute = drug.AmountLeftAbsolute,
            AmountLeftInPercentage = drug.AmountLeftInPercentage
        };

        await Send.CreatedAtAsync<GetDrugById>(
            routeValues: new { id = drug.Id },
            responseBody: response,
            cancellation: ct);
    }
}

internal sealed record CreateDrugRequest
{
    public int MetadataId { get; init; }
    public int DrugPackageSizeId { get; init; }
    public int ShopId { get; init; }
    public DateTime? BoughtOn { get; init; }
    public DateTime? OpenedOn { get; init; }
    public DateTime? PalatableUntil { get; init; }
    public int? BoughtBy { get; init; }
    public int? PersonConcerned { get; init; }
    public decimal? AmountLeftAbsolute { get; init; }
    public decimal? AmountLeftInPercentage { get; init; }
}

internal sealed class CreateDrugRequestValidator : Validator<CreateDrugRequest>
{
    public CreateDrugRequestValidator()
    {
        RuleFor(x => x.MetadataId)
            .GreaterThan(0)
            .WithMessage("MetadataId must be greater than 0");

        RuleFor(x => x.DrugPackageSizeId)
            .GreaterThan(0)
            .WithMessage("DrugPackageSizeId must be greater than 0");

        RuleFor(x => x.ShopId)
            .GreaterThan(0)
            .WithMessage("ShopId must be greater than 0");

        RuleFor(x => x.BoughtBy)
            .GreaterThan(0)
            .WithMessage("BoughtBy must be greater than 0")
            .When(x => x.BoughtBy.HasValue);

        RuleFor(x => x.PersonConcerned)
            .GreaterThan(0)
            .WithMessage("PersonConcerned must be greater than 0")
            .When(x => x.PersonConcerned.HasValue);

        RuleFor(x => x.AmountLeftAbsolute)
            .GreaterThanOrEqualTo(0)
            .WithMessage("AmountLeftAbsolute must be greater than or equal to 0")
            .When(x => x.AmountLeftAbsolute.HasValue);

        RuleFor(x => x.AmountLeftInPercentage)
            .InclusiveBetween(0, 100)
            .WithMessage("AmountLeftInPercentage must be between 0 and 100")
            .When(x => x.AmountLeftInPercentage.HasValue);
    }
}

internal sealed record CreateDrugResponse
{
    public int Id { get; init; }
    public int MetadataId { get; init; }
    public int DrugPackageSizeId { get; init; }
    public int ShopId { get; init; }
    public DateTime? BoughtOn { get; init; }
    public DateTime? OpenedOn { get; init; }
    public DateTime? PalatableUntil { get; init; }
    public int? BoughtBy { get; init; }
    public int? PersonConcerned { get; init; }
    public decimal? AmountLeftAbsolute { get; init; }
    public decimal? AmountLeftInPercentage { get; init; }
}
