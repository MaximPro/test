#!/bin/bash

# GitHub Repository Creator - Bash Wrapper
#
# This is a convenient wrapper around the create-github-repo.js script
# that loads environment variables from .env file

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${BLUE}📄 Loading environment from .env file...${NC}"
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | grep -v '^$' | xargs)
fi

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Error: GITHUB_TOKEN not found${NC}"
    echo ""
    echo "Please set your GitHub token in one of these ways:"
    echo "  1. Add GITHUB_TOKEN to your .env file"
    echo "  2. Set it as environment variable: export GITHUB_TOKEN=your_token"
    echo "  3. Pass it inline: GITHUB_TOKEN=your_token $0 repo-name"
    echo ""
    echo "To create a token, visit: https://github.com/settings/tokens"
    exit 1
fi

# Run the Node.js script with all arguments
echo -e "${GREEN}🚀 Creating GitHub repository...${NC}"
echo ""
node "$SCRIPT_DIR/create-github-repo.js" "$@"
