## Troubleshooting & FAQs

### Common Issues

| Issue | Solution |
|-------|----------|
| HAPI server not available | `docker-compose -f docker-compose.hapi.yml up -d` |
| Main backend connection failed | Ensure Next.js is running on port 3000 |
| EMR frontend not loading | Verify EMR backend is running on port 5000 |
| No mappings found | Load terminology: `cd hapi-loader && npm run setup` |
| API key authentication failed | Check `X-API-Key` values and env files |

### Logs & Locations
- EMR Backend: console output from `EMR/terminology-service/src/app.js`
- Main Backend: Next.js server console; audit via `lib/audit.ts`
- HAPI Server: Docker container logs `docker logs <container>`

### Error Examples
- 401 Missing token: Ensure `Authorization: Bearer <ABHA_JWT>` is set.
- 403 Client authentication failed: Check `MAIN_BACKEND_API_KEY` and registered client.
- 404 No ICD-11 mapping: Confirm `ConceptMap` loaded via `hapi-loader`.

### FAQs
- Why is my HAPI server not loading?
  - Docker not running or port 8080 in use. Restart Docker and run the compose file.
- Where do I update API keys?
  - EMR→Main: `EMR/terminology-service/.env` (`MAIN_BACKEND_API_KEY`, `OUR_API_KEY` for frontend)
  - Frontend→EMR: `EMR/emr-frontend-clean/.env` (`VITE_API_KEY`)
- How do I test HAPI directly?
  - Use `$lookup` and `$translate` endpoints shown in API Reference.


