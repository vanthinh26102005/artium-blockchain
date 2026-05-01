#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BE_DIR="$PROJECT_ROOT/BE"
FE_DIR="$PROJECT_ROOT/FE/artium-web"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Artium Full Stack Dev Startup ===${NC}"

# --- Check Docker ---
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Starting Docker Desktop...${NC}"
  open -a Docker
  echo -e "${YELLOW}Waiting for Docker to start...${NC}"
  while ! docker info > /dev/null 2>&1; do
    sleep 2
  done
fi
echo -e "${GREEN}Docker is running.${NC}"

# --- Start Docker Infrastructure (shared profile) ---
echo -e "${YELLOW}Starting Docker infrastructure (shared profile)...${NC}"
cd "$BE_DIR"
yarn docker:up:shared
echo -e "${GREEN}Docker infrastructure started.${NC}"

# --- Wait for services to be ready ---
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 8

# --- Check services ---
echo -e "${YELLOW}Checking service status...${NC}"
docker compose -f docker-compose.yml -f docker-compose.shared.yml --profile shared ps

# --- Start Backend Services in separate terminal tabs ---
echo -e "${YELLOW}Starting Backend services in separate tabs...${NC}"

# Tab 1: API Gateway
osascript <<EOF
tell application "Terminal"
  activate
  tell application "System Events" to keystroke "t" using command down
  delay 1
  do script "cd $BE_DIR && yarn dev:gateway" in front window
end tell
EOF

sleep 2

# Tab 2: Identity Service
osascript <<EOF
tell application "Terminal"
  activate
  tell application "System Events" to keystroke "t" using command down
  delay 1
  do script "cd $BE_DIR && yarn dev:identity" in front window
end tell
EOF

sleep 2

# Tab 3: Artwork Service
osascript <<EOF
tell application "Terminal"
  activate
  tell application "System Events" to keystroke "t" using command down
  delay 1
  do script "cd $BE_DIR && yarn dev:artwork" in front window
end tell
EOF

sleep 2

# Tab 4: Orders Service
osascript <<EOF
tell application "Terminal"
  activate
  tell application "System Events" to keystroke "t" using command down
  delay 1
  do script "cd $BE_DIR && yarn dev:orders" in front window
end tell
EOF

sleep 2

# Tab 5: Start Frontend
osascript <<EOF
tell application "Terminal"
  activate
  tell application "System Events" to keystroke "t" using command down
  delay 1
  do script "cd $FE_DIR && npm run dev" in front window
end tell
EOF

echo ""
echo -e "${GREEN}=== All services starting ===${NC}"
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "API Gateway: ${GREEN}http://localhost:8081/api${NC}"
echo -e "Artwork Service: ${GREEN}http://localhost:3002${NC}"
echo -e "RabbitMQ UI: ${GREEN}http://localhost:15672${NC}"
echo -e "MailHog: ${GREEN}http://localhost:8025${NC}"
echo ""
echo -e "${YELLOW}Check the new Terminal tabs for service output.${NC}"
echo -e "${YELLOW}If RabbitMQ error occurs, run:${NC}"
echo -e "  cd $BE_DIR"
echo -e "  docker compose -f docker-compose.yml -f docker-compose.shared.yml --profile shared restart identity-service artwork-service orders-service${NC}"
