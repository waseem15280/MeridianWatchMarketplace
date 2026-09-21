FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY ["BuildingBlocks/MyWatchMarketplace.SharedKernel/MyWatchMarketplace.SharedKernel.csproj", "BuildingBlocks/MyWatchMarketplace.SharedKernel/"]
COPY ["BuildingBlocks/MyWatchMarketplace.Contracts/MyWatchMarketplace.Contracts.csproj", "BuildingBlocks/MyWatchMarketplace.Contracts/"]
COPY ["services/CollectorVault/MyWatchMarketplace.CollectorVault.Domain/MyWatchMarketplace.CollectorVault.Domain.csproj", "services/CollectorVault/MyWatchMarketplace.CollectorVault.Domain/"]
COPY ["services/CollectorVault/MyWatchMarketplace.CollectorVault.Application/MyWatchMarketplace.CollectorVault.Application.csproj", "services/CollectorVault/MyWatchMarketplace.CollectorVault.Application/"]
COPY ["services/CollectorVault/MyWatchMarketplace.CollectorVault.Infrastructure/MyWatchMarketplace.CollectorVault.Infrastructure.csproj", "services/CollectorVault/MyWatchMarketplace.CollectorVault.Infrastructure/"]
COPY ["services/CollectorVault/MyWatchMarketplace.CollectorVault.Api/MyWatchMarketplace.CollectorVault.Api.csproj", "services/CollectorVault/MyWatchMarketplace.CollectorVault.Api/"]

# Restore dependencies
RUN dotnet restore "services/CollectorVault/MyWatchMarketplace.CollectorVault.Api/MyWatchMarketplace.CollectorVault.Api.csproj"

# Copy source code and build
COPY BuildingBlocks/ BuildingBlocks/
COPY services/CollectorVault/ services/CollectorVault/
WORKDIR "/src/services/CollectorVault/MyWatchMarketplace.CollectorVault.Api"
RUN dotnet publish "MyWatchMarketplace.CollectorVault.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyWatchMarketplace.CollectorVault.Api.dll"]

