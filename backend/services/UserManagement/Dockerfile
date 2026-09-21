FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY ["BuildingBlocks/MyWatchMarketplace.SharedKernel/MyWatchMarketplace.SharedKernel.csproj", "BuildingBlocks/MyWatchMarketplace.SharedKernel/"]
COPY ["BuildingBlocks/MyWatchMarketplace.Contracts/MyWatchMarketplace.Contracts.csproj", "BuildingBlocks/MyWatchMarketplace.Contracts/"]
COPY ["services/UserManagement/MyWatchMarketplace.UserManagement.Domain/MyWatchMarketplace.UserManagement.Domain.csproj", "services/UserManagement/MyWatchMarketplace.UserManagement.Domain/"]
COPY ["services/UserManagement/MyWatchMarketplace.UserManagement.Application/MyWatchMarketplace.UserManagement.Application.csproj", "services/UserManagement/MyWatchMarketplace.UserManagement.Application/"]
COPY ["services/UserManagement/MyWatchMarketplace.UserManagement.Infrastructure/MyWatchMarketplace.UserManagement.Infrastructure.csproj", "services/UserManagement/MyWatchMarketplace.UserManagement.Infrastructure/"]
COPY ["services/UserManagement/MyWatchMarketplace.UserManagement.Api/MyWatchMarketplace.UserManagement.Api.csproj", "services/UserManagement/MyWatchMarketplace.UserManagement.Api/"]

# Restore dependencies
RUN dotnet restore "services/UserManagement/MyWatchMarketplace.UserManagement.Api/MyWatchMarketplace.UserManagement.Api.csproj"

# Copy source code and build
COPY BuildingBlocks/ BuildingBlocks/
COPY services/UserManagement/ services/UserManagement/
WORKDIR "/src/services/UserManagement/MyWatchMarketplace.UserManagement.Api"
RUN dotnet publish "MyWatchMarketplace.UserManagement.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyWatchMarketplace.UserManagement.Api.dll"]

