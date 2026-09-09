using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyWatchMarketplace.CustomerOrders.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BuyerOffers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ListingId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    BuyerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    BuyerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SellerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    WatchModel = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    WatchBrand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    WatchImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    OfferAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    OriginalListingPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CounterAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "pending"),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuyerOffers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerOrders",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ListingId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    WatchModel = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    WatchBrand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    WatchReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    WatchImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    BuyerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    BuyerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SellerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SellerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ShippingFee = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ShippingAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PaymentStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "pending"),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TrackingNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    HasReviewed = table.Column<bool>(type: "boolean", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerOrders", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BuyerOffers_BuyerId",
                table: "BuyerOffers",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_BuyerOffers_ListingId",
                table: "BuyerOffers",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_BuyerOffers_SellerId",
                table: "BuyerOffers",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_BuyerOffers_Status",
                table: "BuyerOffers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerOrders_BuyerId",
                table: "CustomerOrders",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerOrders_ListingId",
                table: "CustomerOrders",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerOrders_SellerId",
                table: "CustomerOrders",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerOrders_Status",
                table: "CustomerOrders",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BuyerOffers");

            migrationBuilder.DropTable(
                name: "CustomerOrders");
        }
    }
}
