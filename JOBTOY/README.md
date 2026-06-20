# 🎮 JOBTOY - Job Portal Platform

A production-ready job portal platform built with Node.js, React, and MongoDB.

## Features

- ✅ 5,000+ real-world job listings
- ✅ 50+ companies directory
- ✅ Advanced job search & filtering
- ✅ User authentication & profiles
- ✅ Job applications tracking
- ✅ Saved jobs management
- ✅ Responsive design
- ✅ RESTful API
- ✅ Docker support
- ✅ CI/CD pipeline

## Tech Stack

**Backend:**
- Node.js 18+
- Express.js
- MongoDB
- Redis
- JWT

**Frontend:**
- React 18
- React Router v6
- CSS3
- Axios

**DevOps:**
- Docker
- Kubernetes
- GitHub Actions
- Nginx

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional)

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/jobtoy.git
cd jobtoy

# Install dependencies
npm install --prefix backend
npm install --prefix frontend

# Start databases
docker-compose up -d

# Seed data
npm run --prefix backend seed

# Start services
npm run --prefix backend dev
npm run --prefix frontend start