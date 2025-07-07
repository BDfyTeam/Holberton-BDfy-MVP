using Google.Cloud.Storage.V1;
using Google.Apis.Auth.OAuth2;

namespace BDfy.Services
{
    public interface IImageService
    {
        Task<string> UploadImageAsync(IFormFile file, string folder); // Subir imagen a Gcs
        Task<string> CalculateHashAsync(Stream stream); // Caluclar el hash de una imagen dada
        Task<Stream> DownloadImageAsync(string url); // Descarga imagen del buecket segun un URL dado
        Task DeleteImageAsync(string imageUrl); // Borra una imagen de Gcs

    }

    public class GcsImageService : IImageService
    {
        private readonly string _bucketName = "bdfy-images";
        private readonly StorageClient _storageClient;

        public GcsImageService(IConfiguration config)
        {
            _storageClient = StorageClient.Create();
        }
        public async Task<string> UploadImageAsync(IFormFile file, string folder)
        {
            var objectName = $"{folder}/{Guid.NewGuid()}_{file.FileName}";
            using var stream = file.OpenReadStream();

            await _storageClient.UploadObjectAsync(_bucketName, objectName, file.ContentType, stream);

            return $"https://storage.googleapis.com/{_bucketName}/{objectName}";
        }
        public async Task<string> CalculateHashAsync(Stream stream)
        {
            using var sha = System.Security.Cryptography.SHA256.Create(); // Encriptador SHA256
            var hash = await sha.ComputeHashAsync(stream); // Hashea la imagen
            return Convert.ToHexStringLower(hash); // Devuelve el hash
        }
        public async Task<Stream> DownloadImageAsync(string url)
        {
            using var client = new HttpClient();
            return await client.GetStreamAsync(url); // Obtiene la imagen
        }
        public async Task DeleteImageAsync(string imageUrl)
        {
            var uri = new Uri(imageUrl);
            var objectName = uri.AbsolutePath.TrimStart('/').Replace($"{_bucketName}/", ""); // Obtiene el nombre del objeto (ej lots/{hash}-tractor.png)

            await _storageClient.DeleteObjectAsync(_bucketName, objectName); // Borra la imagen dada
        }
    }
}