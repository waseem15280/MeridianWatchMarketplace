FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY ["BuildingBlocks/MyWatchMarketplace.SharedKernel/MyWatchMarketplace.SharedKernel.csproj", "BuildingBlocks/MyWatchMarketplace.SharedKernel/"]
COPY ["BuildingBlocks/MyWatchMarketplace.Contracts/MyWatchMarketplace.Contracts.csproj", "BuildingBlocks/MyWatchMarketplace.Contracts/"]
COPY ["services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Domain/MyWatchMarketplace.BuyerWishlist.Domain.csproj", "services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Domain/"]
COPY ["services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Application/MyWatchMarketplace.BuyerWishlist.Application.csproj", "services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Application/"]
COPY ["services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Infrastructure/MyWatchMarketplace.BuyerWishlist.Infrastructure.csproj", "services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Infrastructure/"]
COPY ["services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Api/MyWatchMarketplace.BuyerWishlist.Api.csproj", "services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Api/"]

# Restore dependencies
RUN dotnet restore "services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Api/MyWatchMarketplace.BuyerWishlist.Api.csproj"

# Copy source code and build
COPY BuildingBlocks/ BuildingBlocks/
COPY services/BuyerWishlist/ services/BuyerWishlist/
WORKDIR "/src/services/BuyerWishlist/MyWatchMarketplace.BuyerWishlist.Api"
RUN dotnet publish "MyWatchMarketplace.BuyerWishlist.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyWatchMarketplace.BuyerWishlist.Api.dll"]

