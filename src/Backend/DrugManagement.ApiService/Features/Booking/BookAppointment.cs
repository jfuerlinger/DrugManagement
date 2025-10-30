using FastEndpoints;
using FluentValidation;
using DrugManagement.ApiService.Shared.Services.Contracts;
using static DrugManagement.ApiService.Features.Booking.BookAppointment;

namespace DrugManagement.ApiService.Features.Booking;

internal sealed class BookAppointment(
    ILogger<BookAppointment> logger,
    IBookingService bookingService)
    : Endpoint<BookSlotRequest>
{
    public override void Configure()
    {
        Post("/booking");
        Summary(s =>
        {
            s.Summary = "Books a slot";
            s.ExampleRequest = new BookSlotRequest(DateTime.Now);
        });
        Description(b => b
            .ProducesProblemDetails(400, "application/json+problem")
            .Produces(200, contentType: "application/json"));
        AllowAnonymous();
    }

    public override async Task HandleAsync(BookSlotRequest request, CancellationToken ct)
    {
        logger.LogInformation($"Entered BookSlot ...");
        
        await bookingService.BookAppointmentAsync(request.From);

        logger.LogInformation($"Exiting BookSlot");

        await Send.OkAsync(cancellation: ct);
    }

    internal record BookSlotRequest(DateTime From);

    internal sealed class BookSlotRequestValidator : Validator<BookSlotRequest>
    {
        public BookSlotRequestValidator()
        {
            RuleFor(x => x.From)
                .NotEmpty()
                .WithMessage("From date is required");
        }
    }
}
