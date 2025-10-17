namespace DrugManagement.ApiService.Infrastructure.Extensions;

public static class RedirectExtensions
{
    public static IApplicationBuilder UseRootRedirectToSwagger(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            if (context.Request.Path == "/")
            {
                context.Response.Redirect("/swagger", permanent: false);
                return;
            }

            await next();
        });
    }
}
