using FastEndpoints;
using DrugManagement.Core.DataAccess;
using DrugManagement.Core.Model;

namespace DrugManagement.ApiService.Features.Persons;

internal sealed class CreatePerson(
    ILogger<CreatePerson> logger,
    ApplicationDbContext dbContext)
    : Endpoint<CreatePersonRequest, CreatePersonResponse>
{
    public override void Configure()
    {
        Post("/persons");
        Summary(s =>
            {
                s.Summary = "Creates a new person";
                s.ExampleRequest = new CreatePersonRequest
                {
                    Firstname = "John",
                    Lastname = "Doe",
                    Phone = "+49 30 12345678",
                    Email = "john.doe@example.com"
                };
            });
        Description(b => b
         .ProducesProblemDetails(400, "application/json+problem")
            .Produces<CreatePersonResponse>(201, contentType: "application/json"));
        Tags("Persons");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CreatePersonRequest request, CancellationToken ct)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.Firstname))
        {
            AddError(r => r.Firstname, "Firstname is required");
        }
        
        if (string.IsNullOrWhiteSpace(request.Lastname))
        {
            AddError(r => r.Lastname, "Lastname is required");
        }
        
        ThrowIfAnyErrors();

        logger.LogInformation("Creating new person: {Firstname} {Lastname}", request.Firstname, request.Lastname);

        var person = new Person
        {
            Firstname = request.Firstname,
            Lastname = request.Lastname,
            Phone = request.Phone,
            Email = request.Email
        };

        dbContext.Persons.Add(person);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Person created with ID: {PersonId}", person.Id);

        var response = new CreatePersonResponse
        {
            Id = person.Id,
            Firstname = person.Firstname,
            Lastname = person.Lastname,
            Phone = person.Phone,
            Email = person.Email
        };

        await Send.CreatedAtAsync<GetPersonById>(
                 routeValues: new { id = person.Id },
          responseBody: response,
             cancellation: ct);
    }
}

internal sealed record CreatePersonRequest
{
    public string Firstname { get; init; } = string.Empty;
    public string Lastname { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Email { get; init; }
}

internal sealed record CreatePersonResponse
{
    public int Id { get; init; }
    public string Firstname { get; init; } = string.Empty;
    public string Lastname { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Email { get; init; }
}
