# Dockerfile for DrugManagement.ApiService (.NET 9)
# Multi-stage build to produce a small final image

ARG DOTNET_VERSION=9.0

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION} AS base
WORKDIR /app
# Port konfigurieren (falls anders in Program.cs anpassen)
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION} AS build
WORKDIR /src
COPY DrugManagement.ApiService/*.csproj DrugManagement.ApiService/
# Falls Shared/Projects: copy props/items
# Copy übrige Projektdateien (globale restore optimieren)
RUN dotnet restore DrugManagement.ApiService/DrugManagement.ApiService.csproj
COPY . .
WORKDIR /src/DrugManagement.ApiService
RUN dotnet publish DrugManagement.ApiService.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
# Health Probe Endpoint kann über ASPNETCORE_URLS gesetzt werden
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "DrugManagement.ApiService.dll"]
