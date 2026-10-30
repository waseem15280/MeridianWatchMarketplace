FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY ["BuildingBlocks/MyWatchMarketplace.SharedKernel/MyWatchMarketplace.SharedKernel.csproj", "BuildingBlocks/MyWatchMarketplace.SharedKernel/"]
COPY ["BuildingBlocks/MyWatchMarketplace.Contracts/MyWatchMarketplace.Contracts.csproj", "BuildingBlocks/MyWatchMarketplace.Contracts/"]
COPY ["services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Domain/MyWatchMarketplace.ServiceCenter.Domain.csproj", "services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Domain/"]
COPY ["services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Application/MyWatchMarketplace.ServiceCenter.Application.csproj", "services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Application/"]
COPY ["services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Infrastructure/MyWatchMarketplace.ServiceCenter.Infrastructure.csproj", "services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Infrastructure/"]
COPY ["services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Api/MyWatchMarketplace.ServiceCenter.Api.csproj", "services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Api/"]

# Restore dependencies
RUN dotnet restore "services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Api/MyWatchMarketplace.ServiceCenter.Api.csproj"

# Copy source code and build
COPY BuildingBlocks/ BuildingBlocks/
COPY services/ServiceCenter/ services/ServiceCenter/
WORKDIR "/src/services/ServiceCenter/MyWatchMarketplace.ServiceCenter.Api"
RUN dotnet publish "MyWatchMarketplace.ServiceCenter.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyWatchMarketplace.ServiceCenter.Api.dll"]

