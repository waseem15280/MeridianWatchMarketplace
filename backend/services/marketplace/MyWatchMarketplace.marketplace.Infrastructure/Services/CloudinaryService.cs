using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MyWatchMarketplace.marketplace.Application.Common.Interfaces;

namespace MyWatchMarketplace.marketplace.Infrastructure.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;
    private const string DefaultFolder = "meridian_listings";

    public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
    {
        _logger = logger;

        var cloudinaryUrl = Environment.GetEnvironmentVariable("CLOUDINARY_URL")
            ?? configuration["Cloudinary:Url"]
            ?? configuration["CLOUDINARY_URL"];

        if (!string.IsNullOrWhiteSpace(cloudinaryUrl))
        {
            _cloudinary = new Cloudinary(cloudinaryUrl);
        }
        else
        {
            var cloudName = configuration["Cloudinary:CloudName"] ?? "jwrzshry";
            var apiKey = configuration["Cloudinary:ApiKey"] ?? "936341539214393";
            var apiSecret = configuration["Cloudinary:ApiSecret"] ?? "B7pys9i22GLSBRgnd8BcmH1Mdjo";
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        _cloudinary.Api.Secure = true;
    }

    public async Task<string> UploadImageAsync(Stream stream, string fileName, string? folder = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, stream),
                Folder = folder ?? DefaultFolder,
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary upload failed: {Error}", uploadResult.Error.Message);
                throw new InvalidOperationException($"Cloudinary upload failed: {uploadResult.Error.Message}");
            }

            var url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString();
            if (string.IsNullOrWhiteSpace(url))
            {
                throw new InvalidOperationException("Cloudinary returned empty URL");
            }

            return url;
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            _logger.LogError(ex, "Unexpected error uploading image {FileName} to Cloudinary", fileName);
            throw;
        }
    }

    public async Task<string> UploadImageAsync(string base64OrUrl, string? folder = null, CancellationToken cancellationToken = default)
    {
        if (base64OrUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            base64OrUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return base64OrUrl;
        }

        try
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(base64OrUrl),
                Folder = folder ?? DefaultFolder,
                UniqueFilename = true,
                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary upload from base64/url failed: {Error}", uploadResult.Error.Message);
                throw new InvalidOperationException($"Cloudinary upload failed: {uploadResult.Error.Message}");
            }

            var url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString();
            if (string.IsNullOrWhiteSpace(url))
            {
                throw new InvalidOperationException("Cloudinary returned empty URL");
            }

            return url;
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            _logger.LogError(ex, "Unexpected error uploading base64 data to Cloudinary");
            throw;
        }
    }

    public async Task<List<string>> UploadImagesAsync(IEnumerable<(Stream Stream, string FileName)> files, string? folder = null, CancellationToken cancellationToken = default)
    {
        var urls = new List<string>();
        foreach (var (stream, fileName) in files)
        {
            var url = await UploadImageAsync(stream, fileName, folder, cancellationToken);
            urls.Add(url);
        }
        return urls;
    }
}
