FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file for layer caching
COPY ["gateway/MyWatchMarketplace.ApiGateway/MyWatchMarketplace.ApiGateway.csproj", "gateway/MyWatchMarketplace.ApiGateway/"]

# Restore dependencies
RUN dotnet restore "gateway/MyWatchMarketplace.ApiGateway/MyWatchMarketplace.ApiGateway.csproj"

# Copy source code and build
COPY gateway/MyWatchMarketplace.ApiGateway/ gateway/MyWatchMarketplace.ApiGateway/
WORKDIR "/src/gateway/MyWatchMarketplace.ApiGateway"
RUN dotnet publish "MyWatchMarketplace.ApiGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyWatchMarketplace.ApiGateway.dll"]

