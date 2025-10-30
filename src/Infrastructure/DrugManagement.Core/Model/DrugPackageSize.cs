namespace DrugManagement.Core.Model;

public class DrugPackageSize
{
    public int Id { get; set; }
    public int DrugMetaDataId { get; set; }
    public int BundleSize { get; set; }
    public string? BundleType { get; set; }

    // Navigation properties
    public DrugMetadata DrugMetadata { get; set; } = null!;
    public ICollection<Drug> Drugs { get; set; } = new List<Drug>();
}
