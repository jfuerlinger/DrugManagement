using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.ApiService.Features.Booking;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Management;

internal sealed class DeleteData(
    ILogger<BookAppointment> logger,
    ApplicationDbContext dbContext)
    : EndpointWithoutRequest
{
    public override void Configure()
    {
        Delete("/management/data");

        Summary(s =>
        {
            s.Summary = "Truncates all the tables";
        });

        Description(b => b
            .Produces(200, contentType: "application/json"));

        Tags("Management");

        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Entered DeleteData ...");

        var strategy = dbContext.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            // Seed the database
            await using var transaction = await dbContext.Database.BeginTransactionAsync(ct);

            await dbContext.Slots.ExecuteDeleteAsync(ct);

            await dbContext.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        });

        logger.LogInformation("Exiting DeleteData");

        await Send.OkAsync(cancellation: ct);
    }
}
