using Azure.Messaging.ServiceBus;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using DrugManagement.Core.Model.QueueItems;

namespace DrugManagement.D365Service.Functions;

public class BookAppointmentFunc
{
    private readonly ILogger<BookAppointmentFunc> _logger;

    public BookAppointmentFunc(ILogger<BookAppointmentFunc> logger)
    {
        _logger = logger;
    }

    [Function(nameof(BookAppointmentFunc))]
    public async Task Run(
        [ServiceBusTrigger(
            queueName: Shared.Metadata.Constants.AspireResources.SERVICEBUS_QUEUE_BOOKAPPOINTMENT, 
            Connection = Shared.Metadata.Constants.AspireResources.SERVICEBUS)]
        ServiceBusReceivedMessage message,
        ServiceBusMessageActions messageActions)
    {
        _logger.LogInformation("Message ID: {id}", message.MessageId);
        _logger.LogInformation("Message Body: {body}", message.Body);
        _logger.LogInformation("Message Content-Type: {contentType}", message.ContentType);

        BookAppointmentQueueItem payload = message.Body.ToObjectFromJson<BookAppointmentQueueItem>() 
                                                ?? throw new Exception($"Unable to parse the payload to type '{nameof(BookAppointmentQueueItem)}'!");

        _logger.LogInformation("--> Booking appointment at {from} for customer {customer}", payload.From, payload.Customer);

        // Complete the message
        await messageActions.CompleteMessageAsync(message);
    }
}