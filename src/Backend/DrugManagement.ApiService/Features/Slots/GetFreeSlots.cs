using FastEndpoints;
using FluentValidation;
using DrugManagement.Core.FakeData;
using DrugManagement.Core.Model;
using static DrugManagement.ApiService.Features.Slots.GetFreeSlots;
using static DrugManagement.ApiService.Features.Slots.GetFreeSlots.GetFreeSlotsResponse;

namespace DrugManagement.ApiService.Features.Slots;

internal sealed class GetFreeSlots(ILogger<GetFreeSlots> logger)
    : Endpoint<GetFreeSlotsRequest, GetFreeSlotsResponse>
{
    public override void Configure()
    {
        Get("/slots");

        Summary(s =>
        {
            s.Summary = "Retrieves all the free slots";
            s.ExampleRequest = new GetFreeSlotsRequest(new DateOnly(2025, 09, 04));
        });

        Description(b => b
            .ProducesProblemDetails(400, "application/json+problem")
            .Produces(200, contentType: "application/json"));

        Tags("Data");

        AllowAnonymous();
    }

    public override async Task HandleAsync(GetFreeSlotsRequest request, CancellationToken ct)
    {
        logger.LogInformation($"Entered GetFreeSlots ...");
        // do something
        logger.LogInformation($"Exiting GetFreeSlots");

        await Send.OkAsync(CreateDemoRequest(), ct);
    }

    internal record GetFreeSlotsRequest(DateOnly Day);

    internal sealed class GetFreeSlotsRequestValidator : Validator<GetFreeSlotsRequest>
    {
        public GetFreeSlotsRequestValidator()
        {
            RuleFor(x => x.Day)
                .NotEmpty()
                .WithMessage("Day is required");
        }
    }

    internal record GetFreeSlotsResponse(Slot[] FreeSlots);

    private static GetFreeSlotsResponse CreateDemoRequest()
        => new([
                .. FakeDataGenerator.GenerateSlotsForCurrentYear()
                                    .Take(25)
            ]);
}

