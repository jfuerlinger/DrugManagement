using Aspire.Hosting;
using Aspire.Hosting.ApplicationModel;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace DrugManagement.AppHost.Extensions;

/// <summary>
/// Extension methods for adding custom commands to Node.js applications.
/// </summary>
public static class NodeAppExtensions
{
    /// <summary>
    /// Adds a custom command to install NPM dependencies for the Node.js application.
    /// </summary>
    /// <param name="builder">The Node.js application resource builder.</param>
    /// <param name="commandTitle">The title of the command. Defaults to "npm install".</param>
    /// <returns>The Node.js application resource builder.</returns>
    /// <remarks>
    /// Das Command führt 'npm install' im Working Directory der Node.js-Anwendung aus.
    /// Dies ist besonders nützlich nach Änderungen am package.json.
    /// </remarks>
    public static IResourceBuilder<NodeAppResource> WithNpmInstallCommand(
        this IResourceBuilder<NodeAppResource> builder,
     string commandTitle = "npm install")
    {
        return builder.WithCommand(
            "npm-install",
            commandTitle,
       async context =>
            {
                try
                {
                    var nodeApp = builder.Resource;
                    var workingDirectory = nodeApp.WorkingDirectory;

                    // Versuche verschiedene npm-Ausführungsmethoden
                    var executionStrategies = GetNpmExecutionStrategies();

                    Exception? lastException = null;
                    string lastError = "";

                    foreach (var strategy in executionStrategies)
                    {
                        try
                        {
                            var result = await ExecuteNpmInstall(strategy, workingDirectory, context.CancellationToken);
                            if (result.Success)
                            {
                                return result;
                            }

                            lastError = result.ErrorMessage ?? "";
                        }
                        catch (Exception ex)
                        {
                            lastException = ex;
                            continue; // Versuche die nächste Strategie
                        }
                    }

                    // Alle Strategien fehlgeschlagen
                    var errorMessage = lastException != null
                    ? $"Alle npm-Ausführungsstrategien fehlgeschlagen. Letzter Fehler: {lastException.Message}"
                   : $"npm install fehlgeschlagen: {lastError}";

                    return new ExecuteCommandResult()
                    {
                        Success = false,
                        ErrorMessage = errorMessage
                    };
                }
                catch (Exception ex)
                {
                    return new ExecuteCommandResult()
                    {
                        Success = false,
                        ErrorMessage = $"Unerwarteter Fehler beim Ausführen von npm install: {ex.Message}"
                    };
                }
            },
   new CommandOptions
   {
       IconName = "PackageFilled",
       IconVariant = IconVariant.Filled,
       Description = "Führt 'npm install' im Projektverzeichnis aus.",
       IsHighlighted = true
   });
    }

    /// <summary>
    /// Gibt eine Liste von npm-Ausführungsstrategien zurück, sortiert nach Wahrscheinlichkeit des Erfolgs.
    /// </summary>
    /// <returns>Eine Liste von Execution-Strategien.</returns>
    private static List<NpmExecutionStrategy> GetNpmExecutionStrategies()
    {
        var strategies = new List<NpmExecutionStrategy>();

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            // Windows-spezifische Strategien
            strategies.Add(new NpmExecutionStrategy("cmd.exe", "/c npm install", "Windows Command Prompt"));
            strategies.Add(new NpmExecutionStrategy("powershell.exe", "-Command \"npm install\"", "PowerShell"));
            strategies.Add(new NpmExecutionStrategy("npm.cmd", "install", "npm.cmd direkt"));
            strategies.Add(new NpmExecutionStrategy("npm", "install", "npm direkt"));
        }
        else
        {
            // Unix-ähnliche Systeme (Linux, macOS)
            strategies.Add(new NpmExecutionStrategy("npm", "install", "npm direkt"));
            strategies.Add(new NpmExecutionStrategy("bash", "-c \"npm install\"", "Bash Shell"));
            strategies.Add(new NpmExecutionStrategy("sh", "-c \"npm install\"", "Shell"));
        }

        return strategies;
    }

    /// <summary>
    /// Führt npm install mit der angegebenen Strategie aus.
    /// </summary>
    /// <param name="strategy">Die Ausführungsstrategie.</param>
    /// <param name="workingDirectory">Das Arbeitsverzeichnis.</param>
    /// <param name="cancellationToken">Cancellation Token.</param>
    /// <returns>Das Ausführungsergebnis.</returns>
    private static async Task<ExecuteCommandResult> ExecuteNpmInstall(
            NpmExecutionStrategy strategy,
    string workingDirectory,
        CancellationToken cancellationToken)
    {
        var processStartInfo = new ProcessStartInfo
        {
            FileName = strategy.FileName,
            Arguments = strategy.Arguments,
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        using var process = Process.Start(processStartInfo);
        if (process == null)
        {
            return new ExecuteCommandResult()
            {
                Success = false,
                ErrorMessage = $"Konnte Prozess nicht starten mit Strategie: {strategy.Description}"
            };
        }

        await process.WaitForExitAsync(cancellationToken);

        if (process.ExitCode == 0)
        {
            return new ExecuteCommandResult() { Success = true };
        }
        else
        {
            // Sammle Error Output für ErrorMessage
            var errorOutput = await process.StandardError.ReadToEndAsync();
            var standardOutput = await process.StandardOutput.ReadToEndAsync();
            var combinedOutput = string.IsNullOrEmpty(errorOutput) ? standardOutput : errorOutput;

            return new ExecuteCommandResult()
            {
                Success = false,
                ErrorMessage = $"Strategie '{strategy.Description}' fehlgeschlagen (Exit Code {process.ExitCode}): {combinedOutput}"
            };
        }
    }

    /// <summary>
    /// Repräsentiert eine npm-Ausführungsstrategie.
    /// </summary>
    private record NpmExecutionStrategy(string FileName, string Arguments, string Description);
}