namespace DrugManagement.Core.Model;

public class Person
{
    public int Id { get; set; }
    public string Firstname { get; set; } = string.Empty;
    public string Lastname { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }

    // Navigation properties
    public ICollection<Drug> DrugsBought { get; set; } = new List<Drug>();
    public ICollection<Drug> DrugsConcerned { get; set; } = new List<Drug>();
}
