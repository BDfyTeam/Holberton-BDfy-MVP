using BDfy.Services;
using NUnit.Framework;

namespace Bdfy.Tests.Services;

public class PasswordHasherTests
{
    [Test]
    public void HashAndVerify_ReturnsTrueForCorrectPassword()
    {
        const string password = "Secure123!";

        string hashed = PasswordHasher.Hash(password);

        Assert.IsNotEmpty(hashed);
        Assert.AreNotEqual(password, hashed);
        Assert.IsTrue(PasswordHasher.Verify(password, hashed));
    }

    [Test]
    public void Verify_ReturnsFalseForWrongPassword()
    {
        const string password = "Secure123!";
        string hashed = PasswordHasher.Hash(password);

        bool result = PasswordHasher.Verify("Wrong" + password, hashed);

        Assert.IsFalse(result);
    }

    [Test]
    public void Verify_ThrowsForUnsupportedHash()
    {
        Assert.Throws<NotSupportedException>(() => PasswordHasher.Verify("p", "invalid"));
    }
}
