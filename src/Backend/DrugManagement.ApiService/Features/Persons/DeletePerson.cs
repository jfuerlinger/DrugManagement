using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.DataAccess;

namespace DrugManagement.ApiService.Features.Persons;

internal sealed class DeletePerson(
    ILogger<DeletePerson> logger,
    ApplicationDbContext dbContext)
    : Endpoint<DeletePersonRequest>
{
    public override void Configure()
    {
        Delete("/persons/{id}");
        Summary(s =>
    {
        s.Summary = "Deletes a person";
    });
        Description(b => b
             .ProducesProblemDetails(404, "application/json+problem")
            .ProducesProblemDetails(409, "application/json+problem")
             .Produces(204));
        Tags("Persons");
        AllowAnonymous();
    }

    public override async Task HandleAsync(DeletePersonRequest request, CancellationToken ct)
    {
        logger.LogInformation("Deleting person with ID: {PersonId}", request.Id);

        var person = await dbContext.Persons
      .Include(p => p.DrugsBought)
      .Include(p => p.DrugsConcerned)
   .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (person is null)
        {
            logger.LogWarning("Person with ID {PersonId} not found", request.Id);
            await Send.NotFoundAsync(ct);
            return;
        }

        // Check if person has associated drugs
        if (person.DrugsBought.Any() || person.DrugsConcerned.Any())
        {
            logger.LogWarning("Cannot delete person with ID {PersonId} because it has associated drugs", request.Id);

            AddError("Cannot delete person because it has associated drugs");
            await Send.ErrorsAsync(409, ct);
            return;
        }

        dbContext.Persons.Remove(person);
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("Person deleted: {Firstname} {Lastname}", person.Firstname, person.Lastname);

        await Send.NoContentAsync(ct);
    }
}

internal sealed record DeletePersonRequest
{
    public int Id { get; init; }
}
