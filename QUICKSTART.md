# Starting the project

## Full stack (Docker)
1. Open Docker Desktop and wait for it to say "Running"
2. From repo root: `npm run docker:up` or `docker-compose up -d`
3. Wait ~30 seconds for all services to start
4. Access points:
   - Public site:    http://localhost  (via nginx)
   - Dashboard:      http://client.localhost  (via nginx subdomain)
   - Dashboard alt:  http://localhost:3001  (direct)
   - API:            http://localhost:4000
   - MinIO console:  http://localhost:9001
   - Adminer (DB):   http://localhost:8080
5. Check logs: `docker logs bhavana_dashboard --tail=50`
6. Stop everything: `docker-compose down`

## Local dev (no Docker)
First start only the infrastructure:
```
docker-compose up -d postgres redis minio image-processing
```
Then in separate terminals:
```
cd apps/api && npm run dev
cd apps/web && npm run dev
cd apps/client-dashboard && npm run dev
```
