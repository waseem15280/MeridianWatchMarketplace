using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MyWatchMarketplace.BuyerWishlist.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WishlistItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BuyerId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ListingId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    WatchBrand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    WatchModel = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    PriceWhenAdded = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    AddedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WishlistItems", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WishlistItems_BuyerId_ListingId",
                table: "WishlistItems",
                columns: new[] { "BuyerId", "ListingId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WishlistItems_ListingId",
                table: "WishlistItems",
                column: "ListingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WishlistItems");
        }
    }
}
