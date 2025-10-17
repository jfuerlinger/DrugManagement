using DrugManagement.Core.DataAccess;

namespace DrugManagement.MigrationWorker;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);

        builder.AddServiceDefaults();
        builder.Services.AddHostedService<Worker>();

        builder.Services.AddOpenTelemetry()
            .WithTracing(tracing => tracing.AddSource(Worker.ActivitySourceName));

        builder.AddNpgsqlDbContext<ApplicationDbContext>(connectionName: Shared.Metadata.Constants.AspireResources.DB);

        var host = builder.Build();
        host.Run();
    }
}