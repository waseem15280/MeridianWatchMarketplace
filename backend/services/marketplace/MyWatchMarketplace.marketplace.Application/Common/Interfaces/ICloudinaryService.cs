namespace MyWatchMarketplace.marketplace.Application.Common.Interfaces;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(Stream stream, string fileName, string? folder = null, CancellationToken cancellationToken = default);
    Task<string> UploadImageAsync(string base64OrUrl, string? folder = null, CancellationToken cancellationToken = default);
    Task<List<string>> UploadImagesAsync(IEnumerable<(Stream Stream, string FileName)> files, string? folder = null, CancellationToken cancellationToken = default);
}
