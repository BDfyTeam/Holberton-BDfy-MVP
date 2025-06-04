using Microsoft.EntityFrameworkCore;

namespace BDfy.Models
{
    [Owned]
    public class Direction // Modelo para relacionar la direccion dentro de usuario en la base de datos
    {
        public string Street { get; set; } = "";
        public int StreetNumber { get; set; }
        public string Corner { get; set; } = "";
        public int ZipCode { get; set; }
        public string Department { get; set; } = "";
    }
}