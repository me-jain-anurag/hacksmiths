## Deployment Guide

### Containers
```bash
# Build images
docker build -t emr-main-backend .
docker build -t emr-backend ./EMR/terminology-service
docker build -t emr-frontend ./EMR/emr-frontend-clean

# HAPI stack
docker-compose -f docker-compose.hapi.yml up -d
```

### Environment (Production)
- Configure production `DATABASE_URL`
- `HAPI_BASE_URL` pointing to internal network URL
- Rotate and store API keys in secrets manager
- Set `NODE_ENV=production`

### SSL/CORS
- Terminate TLS at reverse proxy (Nginx/Traefik)
- Restrict CORS origins to prod domains
- Forward `Authorization` and `X-API-Key` headers

### Monitoring & Logging
- Container logs collection (e.g., Loki/ELK)
- Health checks: `/api/health`, HAPI `/fhir/metadata`
- Alert on non-200 rates, latency, and HAPI errors


