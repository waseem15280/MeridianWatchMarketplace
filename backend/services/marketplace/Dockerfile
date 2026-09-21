FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY ["BuildingBlocks/MyWatchMarketplace.SharedKernel/MyWatchMarketplace.SharedKernel.csproj", "BuildingBlocks/MyWatchMarketplace.SharedKernel/"]
COPY ["BuildingBlocks/MyWatchMarketplace.Contracts/MyWatchMarketplace.Contracts.csproj", "BuildingBlocks/MyWatchMarketplace.Contracts/"]
COPY ["services/marketplace/MyWatchMarketplace.marketplace.Domain/MyWatchMarketplace.Marketplace.Domain.csproj", "services/marketplace/MyWatchMarketplace.marketplace.Domain/"]
COPY ["services/marketplace/MyWatchMarketplace.marketplace.Application/MyWatchMarketplace.Marketplace.Application.csproj", "services/marketplace/MyWatchMarketplace.marketplace.Application/"]
COPY ["services/marketplace/MyWatchMarketplace.marketplace.Infrastructure/MyWatchMarketplace.Marketplace.Infrastructure.csproj", "services/marketplace/MyWatchMarketplace.marketplace.Infrastructure/"]
COPY ["services/marketplace/MyWatchMarketplace.marketplace.Api/MyWatchMarketplace.Marketplace.Api.csproj", "services/marketplace/MyWatchMarketplace.marketplace.Api/"]

# Restore dependencies
RUN dotnet restore "services/marketplace/MyWatchMarketplace.marketplace.Api/MyWatchMarketplace.Marketplace.Api.csproj"

# Copy source code and build
COPY BuildingBlocks/ BuildingBlocks/
COPY services/marketplace/ services/marketplace/
WORKDIR "/src/services/marketplace/MyWatchMarketplace.marketplace.Api"
RUN dotnet publish "MyWatchMarketplace.Marketplace.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyWatchMarketplace.Marketplace.Api.dll"]

