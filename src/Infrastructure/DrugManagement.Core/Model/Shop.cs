namespace DrugManagement.Core.Model;

public class Shop
{
  public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Street { get; set; }
    public string? Postalcode { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }

    // Navigation properties
    public ICollection<Drug> Drugs { get; set; } = new List<Drug>();
}
