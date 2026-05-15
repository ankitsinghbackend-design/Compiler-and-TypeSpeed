#!/bin/bash

# Purple Compiler & TypeSpeed Tracker - All-in-One Build Script
# This script builds the Typer (Svelte), moves it to the React frontend,
# and then builds the main production bundle.

# Set colors for better visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}>>> Starting Full Project Build...${NC}"

# 1. Build the Typer (Svelte)
echo -e "${BLUE}>>> [1/3] Building Typer (Svelte)...${NC}"
cd Typer
if [ -d "node_modules" ]; then
    npm run build
else
    npm install && npm run build
fi
cd ..

# 2. Sync Typer build to Frontend
echo -e "${BLUE}>>> [2/3] Synching Typer build to Frontend static folder...${NC}"
mkdir -p frontend/public/typer
cp -r Typer/dist/* frontend/public/typer/
echo -e "${GREEN}✓ Typer build successfully linked to Frontend.${NC}"

# 3. Build the Main Frontend (React)
echo -e "${BLUE}>>> [3/3] Building Main Frontend (React/Vite)...${NC}"
cd frontend
if [ -d "node_modules" ]; then
    npm run build
else
    npm install && npm run build
fi
cd ..

echo -e "${GREEN}>>> BUILD COMPLETE! <<<${NC}"
echo -e "Frontend production files are in: ${BLUE}./frontend/dist/${NC}"
echo -e "Backend is ready to be started in: ${BLUE}./backend/${NC}"
