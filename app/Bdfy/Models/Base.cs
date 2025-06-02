namespace BDfy.Models
{
    public class Base // Clase base el cual todas las clases heredan
    {
        public Guid Id { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        protected Base()
        {
            Id = Guid.NewGuid(); // Genera un id unico 128 Bits
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}