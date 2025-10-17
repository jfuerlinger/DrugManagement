using FastEndpoints;
using static DrugManagement.ApiService.Features.Demo.GetWeatherForecast;

namespace DrugManagement.ApiService.Features.Demo;

internal sealed class GetWeatherForecast(ILogger<GetWeatherForecast> logger)
    : EndpointWithoutRequest<WeatherForecast[]>
{
    public override void Configure()
    {
        Get("/weatherforecast");

        Summary(s =>
        {
            s.Summary = "Retrieves the weather forecast";
        });

        Description(b => b
            .ProducesProblemDetails(400, "application/json+problem")
            .Produces(200, contentType: "application/json"));

        Tags("Demo");

        AllowAnonymous();
    }


    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation($"Entered GetFreeSlots ...");

        // do something
        var summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };


        var forecast = Enumerable.Range(1, 10).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
        


        logger.LogInformation($"Exiting GetFreeSlots");

        await Send.OkAsync(forecast, ct);
    }

    public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
    {
        public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
    }
}


