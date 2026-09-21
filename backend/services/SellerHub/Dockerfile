FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY ["BuildingBlocks/MyWatchMarketplace.SharedKernel/MyWatchMarketplace.SharedKernel.csproj", "BuildingBlocks/MyWatchMarketplace.SharedKernel/"]
COPY ["BuildingBlocks/MyWatchMarketplace.Contracts/MyWatchMarketplace.Contracts.csproj", "BuildingBlocks/MyWatchMarketplace.Contracts/"]
COPY ["services/SellerHub/MyWatchMarketplace.SellerHub.Domain/MyWatchMarketplace.SellerHub.Domain.csproj", "services/SellerHub/MyWatchMarketplace.SellerHub.Domain/"]
COPY ["services/SellerHub/MyWatchMarketplace.SellerHub.Application/MyWatchMarketplace.SellerHub.Application.csproj", "services/SellerHub/MyWatchMarketplace.SellerHub.Application/"]
COPY ["services/SellerHub/MyWatchMarketplace.SellerHub.Infrastructure/MyWatchMarketplace.SellerHub.Infrastructure.csproj", "services/SellerHub/MyWatchMarketplace.SellerHub.Infrastructure/"]
COPY ["services/SellerHub/MyWatchMarketplace.SellerHub.Api/MyWatchMarketplace.SellerHub.Api.csproj", "services/SellerHub/MyWatchMarketplace.SellerHub.Api/"]

# Restore dependencies
RUN dotnet restore "services/SellerHub/MyWatchMarketplace.SellerHub.Api/MyWatchMarketplace.SellerHub.Api.csproj"

# Copy source code and build
COPY BuildingBlocks/ BuildingBlocks/
COPY services/SellerHub/ services/SellerHub/
WORKDIR "/src/services/SellerHub/MyWatchMarketplace.SellerHub.Api"
RUN dotnet publish "MyWatchMarketplace.SellerHub.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyWatchMarketplace.SellerHub.Api.dll"]

