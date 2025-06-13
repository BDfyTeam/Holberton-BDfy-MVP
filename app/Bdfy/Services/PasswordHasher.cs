using System.Security.Cryptography;

namespace BDfy.Services
{
    public class PasswordHasher
    {
        private const int SaltSize = 16;

        private const int HashSize = 20;

        public static string HashPassword(string password, int iterations)
        {
            byte[] salt = new byte[SaltSize];
            RandomNumberGenerator.Fill(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256); // Algoritmo de hasheo SHA256
            byte[] hash = pbkdf2.GetBytes(HashSize);

            // Combinamos salt y el hasheo
            byte[] hashBytes = new byte[SaltSize + HashSize];
            Array.Copy(salt, 0, hashBytes, 0, SaltSize);
            Array.Copy(hash, 0, hashBytes, SaltSize, HashSize);

            var base64Hash = Convert.ToBase64String(hashBytes);

            return string.Format("$BDfyHASH${0}${1}", iterations, base64Hash);
        }

        public static string Hash(string password)
        {
            return HashPassword(password, 10000); // Hashea la password con 10000 iteraciones
        }

        public static bool IsHashSupported(string hashString)
        {
            return hashString.Contains("$BDfyHASH$"); // Check del hash
        }

        public static bool Verify(string password, string hashedPassword)
        {
            // Check hash
            if (!IsHashSupported(hashedPassword))
            {
                throw new NotSupportedException("The hashtype is not supported");
            }

            // Extract iteration and Base64 string
            var splittedHashString = hashedPassword.Replace("$BDfyHASH$", "").Split('$');
            var iterations = int.Parse(splittedHashString[0]);
            var base64Hash = splittedHashString[1];

            // Get hash bytes
            var hashBytes = Convert.FromBase64String(base64Hash);

            // Get salt
            var salt = new byte[SaltSize];
            Array.Copy(hashBytes, 0, salt, 0, SaltSize);

            // Create hash with given salt
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
            byte[] hash = pbkdf2.GetBytes(HashSize);

            // Get result
            for (var i = 0; i < HashSize; i++)
            {
                if (hashBytes[i + SaltSize] != hash[i])
                {
                    return false;
                }
            }
            return true;
        }
    }
}