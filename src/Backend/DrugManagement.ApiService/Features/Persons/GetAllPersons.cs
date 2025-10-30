using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Persons;

internal sealed class GetAllPersons(
    ILogger<GetAllPersons> logger,
    ApplicationDbContext dbContext)
    : EndpointWithoutRequest<GetAllPersonsResponse>
{
    public override void Configure()
    {
        Get("/persons");
        Summary(s =>
               {
                   s.Summary = "Retrieves all persons";
               });
        Description(b => b
            .Produces<GetAllPersonsResponse>(200, contentType: "application/json"));
        Tags("Persons");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogInformation("Retrieving all persons");

        var persons = await dbContext.Persons
            .Select(p => new PersonDto
            {
                Id = p.Id,
                Firstname = p.Firstname,
                Lastname = p.Lastname,
                Phone = p.Phone,
                Email = p.Email
            })
    .ToListAsync(ct);

        logger.LogInformation("Found {Count} persons", persons.Count);

        await Send.OkAsync(new GetAllPersonsResponse { Persons = persons }, ct);
    }
}

internal sealed record GetAllPersonsResponse
{
    public List<PersonDto> Persons { get; init; } = new();
}

internal sealed record PersonDto
{
    public int Id { get; init; }
    public string Firstname { get; init; } = string.Empty;
    public string Lastname { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Email { get; init; }
}
