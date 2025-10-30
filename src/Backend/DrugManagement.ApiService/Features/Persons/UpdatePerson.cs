using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Persons;

internal sealed class UpdatePerson(
    ILogger<UpdatePerson> logger,
    ApplicationDbContext dbContext)
    : Endpoint<UpdatePersonRequest, PersonDto>
{
    public override void Configure()
    {
        Put("/persons/{id}");
        Summary(s =>
      {
          s.Summary = "Updates an existing person";
          s.ExampleRequest = new UpdatePersonRequest
          {
              Id = 1,
              Firstname = "John",
              Lastname = "Doe",
              Phone = "+49 30 12345678",
              Email = "john.doe@example.com"
          };
      });
        Description(b => b
    .ProducesProblemDetails(404, "application/json+problem")
        .Produces<PersonDto>(200, contentType: "application/json"));
        Tags("Persons");
        AllowAnonymous();
    }

    public override async Task HandleAsync(UpdatePersonRequest request, CancellationToken ct)
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

        logger.LogInformation("Updating person with ID: {PersonId}", request.Id);

        var person = await dbContext.Persons
   .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (person is null)
        {
            logger.LogWarning("Person with ID {PersonId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        person.Firstname = request.Firstname;
        person.Lastname = request.Lastname;
        person.Phone = request.Phone;
        person.Email = request.Email;

        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Person updated: {Firstname} {Lastname}", person.Firstname, person.Lastname);

        var response = new PersonDto
        {
            Id = person.Id,
            Firstname = person.Firstname,
            Lastname = person.Lastname,
            Phone = person.Phone,
            Email = person.Email
        };

        await Send.OkAsync(response, ct);
    }
}

internal sealed record UpdatePersonRequest
{
    public int Id { get; init; }
    public string Firstname { get; init; } = string.Empty;
    public string Lastname { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Email { get; init; }
}
