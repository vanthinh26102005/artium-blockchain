# Google Cloud Storage Setup Guide

## Overview
This project uses Google Cloud Storage (GCS) for storing and serving images (artworks, avatars, etc.) with automatic optimization using Sharp.

## Prerequisites

1. **Google Cloud Platform Account**
   - Create a GCP account at https://console.cloud.google.com

2. **Create a GCS Bucket**
   ```bash
   # Using gcloud CLI
   gcloud storage buckets create gs://artwork_uit \
     --project=your-project-id \
     --location=us-central1 \
     --uniform-bucket-level-access
   ```

3. **Create a Service Account**
   ```bash
   # Create service account
   gcloud iam service-accounts create artium-storage \
     --display-name="Artium Storage Service Account"

   # Grant Storage Admin role
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:artium-storage@your-project-id.iam.gserviceaccount.com" \
     --role="roles/storage.admin"

   # Create and download key
   gcloud iam service-accounts keys create ./config/gcs-service-account.json \
     --iam-account=artium-storage@your-project-id.iam.gserviceaccount.com
   ```

4. **Set Bucket CORS (if needed for web uploads)**
   ```json
   [
     {
       "origin": ["http://localhost:3000", "https://yourdomain.com"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "responseHeader": ["Content-Type"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

   Apply CORS:
   ```bash
   gcloud storage buckets update gs://artwork_uit --cors-file=cors.json
   ```

## Configuration

### Docker Compose Setup

The configuration is already added to `docker-compose.yml`:

```yaml
environment:
  # GCS Configuration
  GCS_PROJECT_ID: your-gcs-project-id          # Replace with your project ID
  GCS_BUCKET_NAME: artwork_uit               # Your bucket name
  GCS_KEY_FILE: /app/config/gcs-service-account.json

  # Image Upload Limits
  MAX_FILE_SIZE_MB: 10
  ALLOWED_IMAGE_TYPES: image/jpeg,image/png,image/webp,image/jpg

  # Image Optimization
  IMAGE_QUALITY: 85
  IMAGE_MAX_WIDTH: 2000
  IMAGE_MAX_HEIGHT: 2000

volumes:
  - ./config/gcs-service-account.json:/app/config/gcs-service-account.json:ro
```

### Local Development (.env.local)

For local development without Docker, create `apps/artwork-service/.env.local`:

```env
GCS_PROJECT_ID=your-gcs-project-id
GCS_BUCKET_NAME=artwork_uit
GCS_KEY_FILE=./config/gcs-service-account.json

MAX_FILE_SIZE_MB=10
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/jpg
IMAGE_QUALITY=85
IMAGE_MAX_WIDTH=2000
IMAGE_MAX_HEIGHT=2000
```

## Folder Structure in GCS

Images are organized as follows:

```
artwork_uit/
├── artworks/
│   ├── {sellerId}/
│   │   └── {artworkId}/
│   │       ├── {uuid}.webp
│   │       ├── {uuid}.webp
│   │       └── ...
├── avatars/
│   ├── {userId}.webp
│   └── ...
└── thumbnails/
    └── ...
```

## Usage Examples

### 1. Upload Single Artwork Image

```bash
curl -X POST http://localhost:3003/upload/artwork-image \
  -F "file=@artwork.jpg" \
  -F "sellerId=123e4567-e89b-12d3-a456-426614174000" \
  -F "artworkId=987fcdeb-51a2-43d7-8765-987654321000" \
  -F "altText=Beautiful landscape" \
  -F "isPrimary=true"
```

Response:
```json
{
  "publicId": "artworks/123e4567.../987fcdeb.../a1b2c3d4.webp",
  "url": "https://storage.googleapis.com/artwork_uit/artworks/...",
  "secureUrl": "https://storage.googleapis.com/artwork_uit/artworks/...",
  "format": "webp",
  "width": 1920,
  "height": 1080,
  "size": 245678,
  "bucket": "artwork_uit"
}
```

### 2. Upload Multiple Artwork Images

```bash
curl -X POST http://localhost:3003/upload/artwork-images \
  -F "files=@artwork1.jpg" \
  -F "files=@artwork2.jpg" \
  -F "files=@artwork3.jpg" \
  -F "sellerId=123e4567-e89b-12d3-a456-426614174000" \
  -F "artworkId=987fcdeb-51a2-43d7-8765-987654321000"
```

### 3. Upload Avatar

```bash
curl -X POST http://localhost:3003/upload/avatar \
  -F "file=@profile.jpg" \
  -F "userId=123e4567-e89b-12d3-a456-426614174000"
```

## Image Optimization

All uploaded images are automatically:
- **Converted to WebP** format for optimal compression
- **Resized** to max 2000x2000px (configurable)
- **Compressed** with 85% quality (configurable)
- **Optimized** for web delivery

### Optimization Settings

| Type | Max Width | Max Height | Quality | Format |
|------|-----------|------------|---------|--------|
| Artwork | 2000px | 2000px | 85% | WebP |
| Avatar | 500px | 500px | 80% | WebP |
| Thumbnail | 300px | 300px | 70% | WebP |

## Security Best Practices

1. **Never commit service account keys** to version control
2. **Use IAM roles** in production (not service account keys)
3. **Enable bucket versioning** for backup
4. **Set up lifecycle policies** to delete old files
5. **Use signed URLs** for private content

### Generating Signed URLs (for private images)

```typescript
const signedUrl = await gcsStorageService.generateSignedUrl(
  'artworks/seller123/artwork456/image.webp',
  60 // expires in 60 minutes
);
```

## Production Deployment

For production on GCP (App Engine, Cloud Run, GKE):

1. **Use Application Default Credentials (ADC)**
   - Remove `GCS_KEY_FILE` from environment
   - Attach service account to compute resource

2. **Update docker-compose.yml for production:**
   ```yaml
   environment:
     GCS_PROJECT_ID: your-production-project-id
     GCS_BUCKET_NAME: artwork_uit-prod
     # GCS_KEY_FILE: Leave empty to use ADC
   ```

3. **Set up Cloud CDN** for better performance
   ```bash
   gcloud compute backend-buckets create artwork_uit-backend \
     --gcs-bucket-name=artwork_uit-prod \
     --enable-cdn
   ```

## Troubleshooting

### Error: "Service account key file not found"
- Ensure `./config/gcs-service-account.json` exists
- Check volume mount in docker-compose.yml

### Error: "Permission denied"
- Verify service account has `Storage Admin` role
- Check bucket permissions

### Error: "Bucket not found"
- Verify `GCS_BUCKET_NAME` matches your bucket
- Ensure bucket is in the correct project

## Cost Optimization

1. **Use lifecycle policies** to delete old images
2. **Enable compression** for all objects
3. **Use Nearline/Coldline storage** for archives
4. **Monitor storage usage** with Cloud Monitoring

```bash
# Set lifecycle policy
gcloud storage buckets update gs://artwork_uit \
  --lifecycle-file=lifecycle.json
```

Example `lifecycle.json`:
```json
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {
        "age": 365,
        "matchesPrefix": ["temp/"]
      }
    }
  ]
}
```

## Monitoring

View storage metrics:
```bash
gcloud monitoring dashboards create --config-from-file=storage-dashboard.json
```

## Support

For issues or questions:
- GCS Documentation: https://cloud.google.com/storage/docs
- Sharp Documentation: https://sharp.pixelplumbing.com
