namespace DrugManagement.Core.Model;

public class DrugMetadata
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Agreeability { get; set; }

    // Navigation properties
    public ICollection<DrugPackageSize> PackageSizes { get; set; } = new List<DrugPackageSize>();
    public ICollection<Drug> Drugs { get; set; } = new List<Drug>();
}
