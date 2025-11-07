using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.ApiService.Features.Booking;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Management;

internal sealed class ApplyMigrations(
    ILogger<BookAppointment> logger,
    ApplicationDbContext dbContext)
    : EndpointWithoutRequest
{
    public override void Configure()
    {
        Patch("/management/tables");
        
        Summary(s =>
        {
            s.Summary = "Applies all missing migrations";
        });
        
        Description(b => b
            .Produces(500)
            .Produces(200, contentType: "application/json"));

        Tags("Management");

        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Entered ApplyMigrations ...");

        var strategy = dbContext.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async (ct) =>
        {
            // Run migration in a transaction to avoid partial migration if it fails.
            await dbContext.Database.MigrateAsync(ct);
        }, ct);

        logger.LogInformation("Exiting ApplyMigrations");

        await Send.OkAsync(cancellation: ct);
    }
}
