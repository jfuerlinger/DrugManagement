using DrugManagement.AppHost.Extensions;

var builder = DistributedApplication.CreateBuilder(args);

var serviceBus = builder.AddAzureServiceBus(DrugManagement.Shared.Metadata.Constants.AspireResources.SERVICEBUS)
    .RunAsEmulator(c => c.WithLifetime(ContainerLifetime.Persistent));

var bookAppointmentQueue = serviceBus.AddServiceBusQueue(DrugManagement.Shared.Metadata.Constants.AspireResources.SERVICEBUS_QUEUE_BOOKAPPOINTMENT);

builder.AddContainer(
        DrugManagement.Shared.Metadata.Constants.AspireResources.SERVICEBUS_VIEWER,
        "jfuerlinger/servicebusviewer:latest")
    .WithReference(serviceBus)
    .WaitFor(serviceBus)
    .WaitFor(bookAppointmentQueue)
    .WithEnvironment("ServiceBusQueueName", DrugManagement.Shared.Metadata.Constants.AspireResources.SERVICEBUS_QUEUE_BOOKAPPOINTMENT)
    .WithHttpEndpoint(targetPort: 8080)
    .WithLifetime(ContainerLifetime.Persistent);
var dbServer = builder.AddPostgres(DrugManagement.Shared.Metadata.Constants.AspireResources.DBSERVER)
                      .WithLifetime(ContainerLifetime.Persistent)
                      .WithPgAdmin(c => c.WithLifetime(ContainerLifetime.Persistent));

var db = dbServer.AddDatabase(DrugManagement.Shared.Metadata.Constants.AspireResources.DB);

var migrations = builder.AddProject<Projects.DrugManagement_MigrationWorker>(
    name: DrugManagement.Shared.Metadata.Constants.ProjectResources.MIGRATION_WORKER,
    launchProfileName: "DrugManagement.MigrationWorker")
    .WithReference(db)
    .WaitFor(db);

var api = builder.AddProject<Projects.DrugManagement_ApiService>(DrugManagement.Shared.Metadata.Constants.ProjectResources.API)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints()
    .WithReference(serviceBus)
    .WithReference(db)
    .WaitFor(db)
    .WaitForCompletion(migrations);


var frontend = builder.AddNpmApp(DrugManagement.Shared.Metadata.Constants.ProjectResources.FRONTEND, "../../Frontend/DrugManagement.Frontend")
    .WithReference(api)
    .WaitFor(api)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .WithNpmInstallCommand()
    .PublishAsDockerFile();



builder.AddAzureFunctionsProject<Projects.DrugManagement_D365Service>(DrugManagement.Shared.Metadata.Constants.ProjectResources.D365_SERVICE)
    .WithReference(serviceBus)
    .WaitFor(serviceBus)
    .WaitFor(db)
    .WaitForCompletion(migrations);


builder.AddDevTunnel(DrugManagement.Shared.Metadata.Constants.AspireResources.DEVTUNNEL)
       .WithReference(frontend)
       .WithAnonymousAccess();

await builder.Build().RunAsync();
