using System;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Sockets;

namespace BDfy.Validations
{
    public class ValidEmailDomainAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
        {
            // Verificar si el valor es nulo o vacío
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
            {
                return new ValidationResult(ErrorMessage ?? "Email is required.");
            }

            // Convertir el email a minúsculas
            var email = value.ToString()!.ToLower(); 

            var emailParts = email.Split('@');

            if (emailParts.Length != 2)
            {
                return new ValidationResult("Invalid email format.");
            }

            var domain = emailParts[1];

            // Validar el dominio mediante consulta DNS
            try
            {
                var hostEntry = Dns.GetHostEntry(domain);
                if (hostEntry.AddressList.Length == 0)
                {
                    return new ValidationResult("The domain does not exist.");
                }
            }
            catch (SocketException)
            {
                return new ValidationResult("The domain does not exist.");
            }

            return ValidationResult.Success!;
        }
    }
}
