using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyWatchMarketplace.marketplace.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WatchListings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SellerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SellerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SellerRating = table.Column<double>(type: "double precision", nullable: false),
                    SellerReviewCount = table.Column<int>(type: "integer", nullable: false),
                    SellerVerified = table.Column<bool>(type: "boolean", nullable: false),
                    SellerLocation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Model = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "USD"),
                    Condition = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Movement = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CaseMaterial = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CaseDiameter = table.Column<double>(type: "double precision", nullable: false),
                    DialColor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BraceletMaterial = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    WaterResistance = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Caliber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PowerReserve = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    HasOriginalBox = table.Column<bool>(type: "boolean", nullable: false),
                    HasOriginalPapers = table.Column<bool>(type: "boolean", nullable: false),
                    HasServicePapers = table.Column<bool>(type: "boolean", nullable: true),
                    WarrantyUntil = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Images = table.Column<List<string>>(type: "text[]", nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    ProvenanceNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AuthenticityVerified = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active"),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ViewsCount = table.Column<int>(type: "integer", nullable: false),
                    WishlistCount = table.Column<int>(type: "integer", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: true),
                    FromPersonalCollectionId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WatchListings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WatchListings_Brand",
                table: "WatchListings",
                column: "Brand");

            migrationBuilder.CreateIndex(
                name: "IX_WatchListings_CreatedAt",
                table: "WatchListings",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_WatchListings_SellerId",
                table: "WatchListings",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_WatchListings_Status",
                table: "WatchListings",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WatchListings");
        }
    }
}
