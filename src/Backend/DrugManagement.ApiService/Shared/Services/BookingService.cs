using Ardalis.Result;
using Azure.Messaging.ServiceBus;
using DrugManagement.ApiService.Shared.Services.Contracts;
using DrugManagement.Core.Model.QueueItems;

namespace DrugManagement.ApiService.Shared.Services
{
    public class BookingService(
        ILogger<BookingService> logger,
        ServiceBusClient serviceBusClient) : IBookingService
    {
        public async Task<Result> BookAppointmentAsync(DateTime from)
        {
            logger.LogInformation("Booking appointment at {From}", from);
            logger.LogInformation("Appointment at {From} booked successfully", from);

            // send message to service bus

            var sender = serviceBusClient.CreateSender(DrugManagement.Shared.Metadata.Constants.AspireResources.SERVICEBUS_QUEUE_BOOKAPPOINTMENT);
            var payload = new BookAppointmentQueueItem(from, "joes testing customer");
            var message = new ServiceBusMessage(BinaryData.FromObjectAsJson(payload));

            await sender.SendMessageAsync(message);

            return Result.Success();
        }
    }
}
