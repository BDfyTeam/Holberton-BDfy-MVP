using System.ComponentModel.DataAnnotations.Schema;

namespace BDfy.Models
{
    public class Base // Clase base el cual todas las clases heredan
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        protected Base()
        {
            Id = Guid.NewGuid(); // Genera un id unico 128 Bits
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}