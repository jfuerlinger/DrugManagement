using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DrugManagement.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddDrugManagementEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DrugMetadata",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Agreeability = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrugMetadata", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Persons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Firstname = table.Column<string>(type: "text", nullable: false),
                    Lastname = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Persons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Shops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Street = table.Column<string>(type: "text", nullable: true),
                    Postalcode = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shops", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DrugPackageSizes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DrugMetaDataId = table.Column<int>(type: "integer", nullable: false),
                    BundleSize = table.Column<int>(type: "integer", nullable: false),
                    BundleType = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrugPackageSizes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DrugPackageSizes_DrugMetadata_DrugMetaDataId",
                        column: x => x.DrugMetaDataId,
                        principalTable: "DrugMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Drugs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MetadataId = table.Column<int>(type: "integer", nullable: false),
                    DrugPackageSizeId = table.Column<int>(type: "integer", nullable: false),
                    ShopId = table.Column<int>(type: "integer", nullable: false),
                    BoughtOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OpenedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PalatableUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BoughtBy = table.Column<int>(type: "integer", nullable: true),
                    PersonConcerned = table.Column<int>(type: "integer", nullable: true),
                    AmountLeftAbsolute = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    AmountLeftInPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drugs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Drugs_DrugMetadata_MetadataId",
                        column: x => x.MetadataId,
                        principalTable: "DrugMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Drugs_DrugPackageSizes_DrugPackageSizeId",
                        column: x => x.DrugPackageSizeId,
                        principalTable: "DrugPackageSizes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Drugs_Persons_BoughtBy",
                        column: x => x.BoughtBy,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Drugs_Persons_PersonConcerned",
                        column: x => x.PersonConcerned,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Drugs_Shops_ShopId",
                        column: x => x.ShopId,
                        principalTable: "Shops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DrugPackageSizes_DrugMetaDataId",
                table: "DrugPackageSizes",
                column: "DrugMetaDataId");

            migrationBuilder.CreateIndex(
                name: "IX_Drugs_BoughtBy",
                table: "Drugs",
                column: "BoughtBy");

            migrationBuilder.CreateIndex(
                name: "IX_Drugs_DrugPackageSizeId",
                table: "Drugs",
                column: "DrugPackageSizeId");

            migrationBuilder.CreateIndex(
                name: "IX_Drugs_MetadataId",
                table: "Drugs",
                column: "MetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_Drugs_PersonConcerned",
                table: "Drugs",
                column: "PersonConcerned");

            migrationBuilder.CreateIndex(
                name: "IX_Drugs_ShopId",
                table: "Drugs",
                column: "ShopId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Drugs");

            migrationBuilder.DropTable(
                name: "DrugPackageSizes");

            migrationBuilder.DropTable(
                name: "Persons");

            migrationBuilder.DropTable(
                name: "Shops");

            migrationBuilder.DropTable(
                name: "DrugMetadata");
        }
    }
}
