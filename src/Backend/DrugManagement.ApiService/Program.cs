using FastEndpoints;
using FastEndpoints.Swagger;
using Serilog;
using Serilog.Events;
using DrugManagement.ApiService.Infrastructure.Extensions;
using DrugManagement.Core.DataAccess;

try
{
    var builder = WebApplication.CreateBuilder(args);
    {
        // Application Insights aktivieren
        builder.Services.AddApplicationInsightsTelemetry();

        // Serilog konfigurieren
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.ApplicationInsights(
                builder.Configuration["ApplicationInsights:InstrumentationKey"],
                TelemetryConverter.Traces)
            .CreateLogger();

        builder.Host.UseSerilog();


        // Add service defaults & Aspire client integrations.
        builder.AddServiceDefaults();

        // Add services to the container.
        builder.Services.AddProblemDetails();
        builder.Services.AddOpenApi();
        builder.Services.AddCors();

        builder.AddAzureServiceBusClient(DrugManagement.Shared.Metadata.Constants.AspireResources.SERVICEBUS);
        builder.AddNpgsqlDbContext<ApplicationDbContext>(connectionName: DrugManagement.Shared.Metadata.Constants.AspireResources.DB);

        builder.Services.Scan(scan => scan
            .FromAssemblyOf<Program>()
            .AddClasses(classes => classes.InNamespaces("DrugManagement.ApiService.Shared.Services"))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        builder.Services
                    .AddFastEndpoints()
                    .SwaggerDocument(o =>
                    {
                        o.DocumentSettings = s =>
                        {
                            s.Title = "DrugManagement.ApiService";
                            s.Version = "v1";
                        };
                    });


    }

    var app = builder.Build();
    {

        // Configure the HTTP request pipeline.
        app.UseExceptionHandler();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();

        app.UseRootRedirectToSwagger();
        //app.UseRouting();

        app.MapDefaultEndpoints();

        app.UseFastEndpoints()
            .UseSwaggerGen();

        app.UseCors(static builder =>
            builder.AllowAnyMethod()
                .AllowAnyHeader()
                .AllowAnyOrigin());


        app.UseSerilogRequestLogging(options =>
        {
            options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
            {
                diagnosticContext.Set("UserName", httpContext.User.Identity?.Name ?? "n/a");
                diagnosticContext.Set("Host", httpContext.Request.Host.Value ?? "n/a");
            };
        });

        Log.Information("Initialization finished - ready to serve requests ...");

        app.Run();
    }
}
catch (Exception ex)
{
    Console.WriteLine(ex);
    Log.Fatal(ex, "Application start-up failed");
}
finally
{
    Log.CloseAndFlush();
}
