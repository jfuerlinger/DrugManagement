using System;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace DrugManagement.D365Service.Functions;

public class CloudSyncFunc
{
    private readonly ILogger _logger;

    public CloudSyncFunc(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<CloudSyncFunc>();
    }

    [Function("CloudSyncFunc")]
    public void Run([TimerTrigger("*/2 5-22 * * *")] TimerInfo myTimer)
    {
        _logger.LogInformation("C# Timer trigger function executed at: {executionTime}", DateTime.Now);
        
        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation("Next timer schedule at: {nextSchedule}", myTimer.ScheduleStatus.Next);
        }
    }
}