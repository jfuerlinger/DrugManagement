using Ardalis.Result;

namespace DrugManagement.ApiService.Shared.Services.Contracts
{
    public interface IBookingService
    {
        Task<Result> BookAppointmentAsync(DateTime from);
    }
}
