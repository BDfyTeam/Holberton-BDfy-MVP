using BDfy.Validations;
using NUnit.Framework;
using System.ComponentModel.DataAnnotations;

namespace Bdfy.Tests.Validations;

public class ValidEmailDomainAttributeTests
{
    private ValidationContext _context = new(new object());
    private ValidEmailDomainAttribute _attribute = new();

    [Test]
    public void IsValid_ReturnsSuccessForValidDomain()
    {
        ValidationResult? result = _attribute.GetValidationResult("user@example.com", _context);
        Assert.AreEqual(ValidationResult.Success, result);
    }

    [Test]
    public void IsValid_ReturnsErrorForInvalidDomain()
    {
        ValidationResult? result = _attribute.GetValidationResult("user@invalid.invalid", _context);
        Assert.IsNotNull(result);
    }
}
