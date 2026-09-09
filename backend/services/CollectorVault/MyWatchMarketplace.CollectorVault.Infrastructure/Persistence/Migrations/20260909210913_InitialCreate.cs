using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MyWatchMarketplace.CollectorVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ValuationRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VaultWatchId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    RecordedDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EstimatedValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValuationRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VaultWatches",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Model = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CaseDiameter = table.Column<double>(type: "double precision", nullable: false),
                    CaseMaterial = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Movement = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DialColor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Condition = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PurchasePrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    PurchaseDate = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EstimatedMarketValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Images = table.Column<List<string>>(type: "text[]", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsListedForSale = table.Column<bool>(type: "boolean", nullable: false),
                    ListingId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VaultWatches", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ValuationRecords_VaultWatchId",
                table: "ValuationRecords",
                column: "VaultWatchId");

            migrationBuilder.CreateIndex(
                name: "IX_VaultWatches_Brand",
                table: "VaultWatches",
                column: "Brand");

            migrationBuilder.CreateIndex(
                name: "IX_VaultWatches_UserId",
                table: "VaultWatches",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ValuationRecords");

            migrationBuilder.DropTable(
                name: "VaultWatches");
        }
    }
}
