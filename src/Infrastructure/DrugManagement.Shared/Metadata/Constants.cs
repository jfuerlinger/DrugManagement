namespace DrugManagement.Shared.Metadata;

public static class Constants
{
    public static class AspireResources
    {
        public const string SERVICEBUS = "servicebus";
        public const string SERVICEBUS_QUEUE_BOOKAPPOINTMENT = "queue-bookappointment";
        public const string SERVICEBUS_VIEWER = "servicebus-viewer";
        public const string DBSERVER = "postgres";
        public const string DB = "dev";
        public const string DEVTUNNEL = "tunnel";
    }

    public static class ProjectResources
    {
        public const string FRONTEND = "frontend";
        public const string API = "api";
        public const string D365_SERVICE = "d365service";
        public const string MIGRATION_WORKER = "migration-worker";
    }
}
