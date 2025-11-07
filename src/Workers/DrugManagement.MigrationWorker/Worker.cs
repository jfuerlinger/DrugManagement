using EFCore.BulkExtensions;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using DrugManagement.Core.DataAccess;
using DrugManagement.Core.FakeData;

namespace DrugManagement.MigrationWorker;

public class Worker(
    IServiceProvider serviceProvider,
    IHostApplicationLifetime hostApplicationLifetime) : BackgroundService
{
    public const string ActivitySourceName = "Migrations";
    private static readonly ActivitySource _activitySource = new(ActivitySourceName);

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        using var activity = _activitySource.StartActivity("Migrating database", ActivityKind.Client);

        try
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            await RunMigrationAsync(dbContext, cancellationToken);
            await SeedDataAsync(dbContext, cancellationToken);
        }
        catch (Exception ex)
        {
            activity?.AddException(ex);
            throw;
        }

        hostApplicationLifetime.StopApplication();
    }

    private static async Task RunMigrationAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken)
    {
        var strategy = dbContext.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async (ct) => // Run migration in a transaction to avoid partial migration if it fails.
await dbContext.Database.MigrateAsync(ct), cancellationToken);
    }

    private static async Task SeedDataAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken)
    {
        if (!dbContext.Slots.Any())
        {
            var strategy = dbContext.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                // Seed the database
                await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

                var slots = FakeDataGenerator.GenerateSlotsForCurrentYear();
                await dbContext.BulkInsertAsync(slots, cancellationToken: cancellationToken);

                await transaction.CommitAsync(cancellationToken);
            });
        }
    }
}
