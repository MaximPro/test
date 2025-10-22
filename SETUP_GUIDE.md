# 🚀 Setup Guide
## Local AI CRM & SuperSynergy Development Environment

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js**: v18+ ([download](https://nodejs.org/))
- **Docker**: Latest version ([download](https://www.docker.com/))
- **Docker Compose**: v2+ (included with Docker Desktop)
- **Git**: Latest version

### Optional (but recommended):
- **VS Code**: With extensions for TypeScript, Docker, PostgreSQL
- **Postman** or **Insomnia**: For API testing

---

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/MaximPro/test.git
cd test
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and update:
# - DB_PASSWORD (change from 'changeme')
# - ENCRYPTION_KEY (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
# - JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
# - N8N_PASSWORD (change from 'changeme')
```

### 3. Start Services with Docker

```bash
# Start all services (PostgreSQL, Redis, Ollama, n8n, Next.js)
docker-compose up -d

# Check service status
docker-compose ps
```

Expected output:
```
NAME                IMAGE                       STATUS
crm-nextjs          test-app                    Up
crm-postgres        postgres:16-alpine          Up (healthy)
crm-redis           redis:7-alpine              Up (healthy)
crm-ollama          ollama/ollama:latest        Up
crm-n8n             n8nio/n8n:latest            Up
```

### 4. Initialize Database

```bash
# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### 5. Download AI Models

```bash
# Pull LLaMA2-13B model (recommended for development)
docker exec crm-ollama ollama pull llama2:13b

# Alternative: LLaMA2-70B (higher quality, requires more resources)
# docker exec crm-ollama ollama pull llama2:70b

# Alternative: Mistral-7B (faster, lighter)
# docker exec crm-ollama ollama pull mistral:7b
```

### 6. Access Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| **Main App** | http://localhost:3000 | N/A |
| **n8n Workflows** | http://localhost:5678 | admin / changeme |
| **PostgreSQL** | localhost:5432 | crm_user / changeme |
| **Redis** | localhost:6379 | No password |
| **Ollama API** | http://localhost:11434 | No auth |

---

## Development Workflow

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
# Option 1: With Docker (recommended)
docker-compose up

# Option 2: Local development (without Docker)
npm run dev
```

### Run Database Migrations

```bash
# Create new migration
npm run db:migrate:create -- --name=add_custom_fields

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:down
```

### Seed Sample Data

```bash
# Seed all data
npm run db:seed

# Seed specific tables
npm run db:seed -- --table=contacts
npm run db:seed -- --table=workflows
```

### Test API Endpoints

```bash
# Using curl
curl http://localhost:3000/api/v1/contacts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Using Postman
# Import collection: docs/api/postman_collection.json
```

---

## Service Configuration

### PostgreSQL Setup

```bash
# Access PostgreSQL shell
docker exec -it crm-postgres psql -U crm_user -d crm

# Useful commands
\dt          # List tables
\d contacts  # Describe contacts table
SELECT COUNT(*) FROM contacts;
```

### Redis Setup

```bash
# Access Redis CLI
docker exec -it crm-redis redis-cli

# Useful commands
KEYS *       # List all keys
GET key_name # Get value
FLUSHALL     # Clear all data (careful!)
```

### Ollama (Local LLM) Setup

```bash
# List installed models
docker exec crm-ollama ollama list

# Test model
docker exec crm-ollama ollama run llama2:13b "Hello, how are you?"

# Monitor GPU usage (if using GPU)
nvidia-smi
```

### n8n Workflow Setup

1. **Access n8n**: http://localhost:5678
2. **Login**: admin / changeme (from .env)
3. **Import workflows**:
   - Click "Import from File"
   - Navigate to `docs/workflows/n8n_templates/`
   - Import desired workflows

**Pre-built workflows**:
- `001_lead_scoring.json` - AI lead qualification
- `002_abandoned_cart.json` - Abandoned cart recovery
- `003_email_campaign.json` - Email campaign automation
- ... (100 total workflows)

---

## Troubleshooting

### Docker Issues

**Problem**: `docker-compose up` fails
```bash
# Solution: Clean up and restart
docker-compose down -v
docker system prune -a
docker-compose up --build
```

**Problem**: Port already in use
```bash
# Check what's using the port
lsof -i :3000  # or :5432, :6379, etc.

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Issues

**Problem**: "Connection refused" error
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

**Problem**: Migrations fail
```bash
# Reset database (WARNING: destroys all data)
docker-compose down -v
docker volume rm test_postgres_data
docker-compose up -d postgres
npm run db:migrate
```

### Ollama Issues

**Problem**: Model download is slow
```bash
# Check download progress
docker-compose logs -f ollama

# Alternative: Pre-download models
# Download to local machine first, then copy to container
```

**Problem**: Out of memory
```bash
# Use smaller model
docker exec crm-ollama ollama pull mistral:7b

# Or increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory
```

### n8n Issues

**Problem**: Can't access n8n UI
```bash
# Check if n8n is running
docker-compose ps n8n

# View logs
docker-compose logs n8n

# Restart n8n
docker-compose restart n8n
```

**Problem**: Workflows not executing
```bash
# Check workflow status in n8n UI
# Enable workflow (toggle switch)
# Check execution logs in n8n
```

---

## Production Deployment

See [docs/implementation/PRODUCTION_DEPLOYMENT.md](./docs/implementation/PRODUCTION_DEPLOYMENT.md) for production setup.

**Key differences**:
- Use environment-specific .env files
- Enable SSL/TLS
- Configure production database (managed PostgreSQL)
- Set up monitoring (Prometheus + Grafana)
- Enable backup automation
- Configure CDN for static assets

---

## Next Steps

1. **Review Documentation**:
   - [API Specification](./docs/api/API_SPECIFICATION.md)
   - [Database Schema](./docs/database/DATABASE_SCHEMA.md)
   - [Workflow Templates](./docs/workflows/WORKFLOW_TEMPLATES.md)

2. **Explore Features**:
   - Create your first contact via API
   - Test AI lead scoring
   - Set up an abandoned cart workflow
   - Build a custom workflow in n8n

3. **Customize**:
   - Modify contact fields
   - Add custom workflows
   - Integrate with your existing tools
   - Customize UI components

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

# Database
npm run db:migrate       # Run migrations
npm run db:migrate:down  # Rollback migration
npm run db:seed          # Seed data
npm run db:reset         # Reset database (caution!)

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop all services
docker-compose ps        # List running services
docker-compose logs      # View logs
docker-compose exec <service> sh  # Access service shell

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Production
npm run build:production # Build for production
docker-compose -f docker-compose.prod.yml up  # Production mode
```

---

## Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/MaximPro/test/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MaximPro/test/discussions)
- **Email**: support@yourcompany.com

---

**Setup Guide Version**: 1.0
**Last Updated**: October 2025
**Estimated Setup Time**: 15-30 minutes
**Status**: Ready for Development
