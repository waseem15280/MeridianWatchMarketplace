FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY ["BuildingBlocks/MyWatchMarketplace.SharedKernel/MyWatchMarketplace.SharedKernel.csproj", "BuildingBlocks/MyWatchMarketplace.SharedKernel/"]
COPY ["BuildingBlocks/MyWatchMarketplace.Contracts/MyWatchMarketplace.Contracts.csproj", "BuildingBlocks/MyWatchMarketplace.Contracts/"]
COPY ["services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Domain/MyWatchMarketplace.CustomerOrders.Domain.csproj", "services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Domain/"]
COPY ["services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Application/MyWatchMarketplace.CustomerOrders.Application.csproj", "services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Application/"]
COPY ["services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Infrastructure/MyWatchMarketplace.CustomerOrders.Infrastructure.csproj", "services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Infrastructure/"]
COPY ["services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Api/MyWatchMarketplace.CustomerOrders.Api.csproj", "services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Api/"]

# Restore dependencies
RUN dotnet restore "services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Api/MyWatchMarketplace.CustomerOrders.Api.csproj"

# Copy source code and build
COPY BuildingBlocks/ BuildingBlocks/
COPY services/CustomerOrders/ services/CustomerOrders/
WORKDIR "/src/services/CustomerOrders/MyWatchMarketplace.CustomerOrders.Api"
RUN dotnet publish "MyWatchMarketplace.CustomerOrders.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyWatchMarketplace.CustomerOrders.Api.dll"]

