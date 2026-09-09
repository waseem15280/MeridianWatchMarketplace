using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyWatchMarketplace.SellerHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SellerOfferNegotiations",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SellerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ListingId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    BuyerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    BuyerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_SellerOfferNegotiations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SellerProfiles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Avatar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MemberSince = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    VerifiedDealer = table.Column<bool>(type: "boolean", nullable: false),
                    Bio = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Rating = table.Column<double>(type: "double precision", precision: 3, scale: 2, nullable: false),
                    ReviewCount = table.Column<int>(type: "integer", nullable: false),
                    TotalSalesCount = table.Column<int>(type: "integer", nullable: false),
                    ResponseRate = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AvgShipTime = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SellerProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SellerReviews",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SellerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    BuyerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    BuyerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BuyerAvatar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    SubRatings_Accuracy = table.Column<int>(type: "integer", nullable: true),
                    SubRatings_Communication = table.Column<int>(type: "integer", nullable: true),
                    SubRatings_Shipping = table.Column<int>(type: "integer", nullable: true),
                    SubRatings_Authenticity = table.Column<int>(type: "integer", nullable: true),
                    Comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    WatchModel = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    WatchReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Date = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    VerifiedPurchase = table.Column<bool>(type: "boolean", nullable: false),
                    SellerReply = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SellerReviews", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SellerOfferNegotiations_ListingId",
                table: "SellerOfferNegotiations",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_SellerOfferNegotiations_SellerId",
                table: "SellerOfferNegotiations",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_SellerOfferNegotiations_Status",
                table: "SellerOfferNegotiations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SellerProfiles_Email",
                table: "SellerProfiles",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SellerReviews_BuyerId",
                table: "SellerReviews",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_SellerReviews_SellerId",
                table: "SellerReviews",
                column: "SellerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SellerOfferNegotiations");

            migrationBuilder.DropTable(
                name: "SellerProfiles");

            migrationBuilder.DropTable(
                name: "SellerReviews");
        }
    }
}
