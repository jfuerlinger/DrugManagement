using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Persons;

internal sealed class GetPersonById(
    ILogger<GetPersonById> logger,
    ApplicationDbContext dbContext)
 : Endpoint<GetPersonByIdRequest, PersonDto>
{
    public override void Configure()
    {
        Get("/persons/{id}");
        Summary(s =>
               {
                   s.Summary = "Retrieves a person by ID";
               });
        Description(b => b
          .ProducesProblemDetails(404, "application/json+problem")
        .Produces<PersonDto>(200, contentType: "application/json"));
        Tags("Persons");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPersonByIdRequest request, CancellationToken ct)
    {
        logger.LogInformation("Retrieving person with ID: {PersonId}", request.Id);

        var person = await dbContext.Persons
         .Where(p => p.Id == request.Id)
    .Select(p => new PersonDto
    {
        Id = p.Id,
        Firstname = p.Firstname,
        Lastname = p.Lastname,
        Phone = p.Phone,
        Email = p.Email
    })
      .FirstOrDefaultAsync(ct);

        if (person is null)
        {
            logger.LogWarning("Person with ID {PersonId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        logger.LogInformation("Person found: {Firstname} {Lastname}", person.Firstname, person.Lastname);
        await Send.OkAsync(person, ct);
    }
}

internal sealed record GetPersonByIdRequest
{
    public int Id { get; init; }
}
