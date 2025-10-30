namespace DrugManagement.Core.Model;

public class Drug
{
    public int Id { get; set; }
    public int MetadataId { get; set; }
    public int DrugPackageSizeId { get; set; }
    public int ShopId { get; set; }
    public DateTime? BoughtOn { get; set; }
    public DateTime? OpenedOn { get; set; }
 public DateTime? PalatableUntil { get; set; }
    public int? BoughtBy { get; set; }
    public int? PersonConcerned { get; set; }
    public decimal? AmountLeftAbsolute { get; set; }
    public decimal? AmountLeftInPercentage { get; set; }

    // Navigation properties
    public DrugMetadata Metadata { get; set; } = null!;
    public DrugPackageSize DrugPackageSize { get; set; } = null!;
    public Shop Shop { get; set; } = null!;
    public Person? BoughtByPerson { get; set; }
    public Person? PersonConcernedPerson { get; set; }
}
