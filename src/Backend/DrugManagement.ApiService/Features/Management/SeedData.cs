using EFCore.BulkExtensions;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.ApiService.Features.Booking;
using DrugManagement.Core.DataAccess;
using DrugManagement.Core.FakeData;

namespace DrugManagement.ApiService.Features.Management;

internal sealed class SeedData(
    ILogger<BookAppointment> logger,
    ApplicationDbContext dbContext)
    : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("/management/data");

        Summary(s =>
        {
            s.Summary = "Seeds some testdata to the tables";
        });

        Description(b => b
            .Produces(200, contentType: "application/json"));

        Tags("Management");

        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Entered SeedData ...");

        var strategy = dbContext.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async (ct) =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync(ct);

            var slots = FakeDataGenerator.GenerateSlotsForCurrentYear();
            await dbContext.BulkInsertAsync(slots, cancellationToken: ct);

            await transaction.CommitAsync(ct);
        }, ct);

        logger.LogInformation("Exiting SeedData");

        await Send.OkAsync(cancellation: ct);
    }
}
