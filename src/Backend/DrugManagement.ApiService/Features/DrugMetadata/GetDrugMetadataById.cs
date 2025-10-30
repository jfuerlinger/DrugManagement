using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.DrugMetadata;

internal sealed class GetDrugMetadataById(
    ILogger<GetDrugMetadataById> logger,
    ApplicationDbContext dbContext)
    : Endpoint<GetDrugMetadataByIdRequest, DrugMetadataDto>
{
    public override void Configure()
    {
        Get("/drugmetadata/{id}");
        Summary(s =>
        {
            s.Summary = "Retrieves a drug metadata by ID";
        });
        Description(b => b
            .ProducesProblemDetails(404, "application/json+problem")
            .Produces<DrugMetadataDto>(200, contentType: "application/json"));
        Tags("DrugMetadata");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetDrugMetadataByIdRequest request, CancellationToken ct)
    {
        logger.LogInformation("Retrieving drug metadata with ID: {DrugMetadataId}", request.Id);

        var drugMetadata = await dbContext.DrugMetadata
            .Where(d => d.Id == request.Id)
            .Select(d => new DrugMetadataDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                ImageUrl = d.ImageUrl,
                Agreeability = d.Agreeability
            })
            .FirstOrDefaultAsync(ct);

        if (drugMetadata is null)
        {
            logger.LogWarning("Drug metadata with ID {DrugMetadataId} not found", request.Id);
            await SendNotFoundAsync(ct);
            return;
        }

        logger.LogInformation("Drug metadata found: {DrugName}", drugMetadata.Name);
        await SendOkAsync(drugMetadata, ct);
    }
}

internal sealed record GetDrugMetadataByIdRequest
{
    public int Id { get; init; }
}

internal sealed class GetDrugMetadataByIdRequestValidator : Validator<GetDrugMetadataByIdRequest>
{
    public GetDrugMetadataByIdRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0");
    }
}
