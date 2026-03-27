#!/bin/bash
# Setup script for Phase 1 GitHub Project Board
# This script helps create GitHub issues and organize them on a project board

set -e

echo "🚀 Setting up Phase 1 GitHub Project Board for Avalanche DEX Router"
echo "====================================================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d ".github/phase1-issues" ]; then
    echo -e "${RED}❌ Error: .github/phase1-issues directory not found${NC}"
    echo "Please run this script from the root of the dex-router repository"
    exit 1
fi

# Create project board configuration
if [ ! -f ".github/project.yml" ]; then
    echo -e "${YELLOW}⚠️  .github/project.yml not found, creating...${NC}"
    # This would be created by the previous step
    echo "Project configuration would be created here"
else
    echo -e "${GREEN}✅ Project configuration already exists${NC}"
fi

echo
echo -e "${BLUE}📋 Phase 1 Tickets Summary:${NC}"
echo "================================="
echo

# List all tickets with their details
for ticket in .github/phase1-issues/*.md; do
    if [ -f "$ticket" ]; then
        ticket_name=$(basename "$ticket" .md)
        ticket_num=${ticket_name:0:2}
        ticket_title=$(head -n 1 "$ticket" | sed 's/^# //')
        
        # Extract key information
        priority=$(grep -i "^\*\*priority\*\*:" "$ticket" | head -1 | cut -d: -f2 | xargs || echo "Not specified")
        estimated_time=$(grep -i "^\*\*estimated time\*\*:" "$ticket" | head -1 | cut -d: -f2 | xargs || echo "Not specified")
        dependencies=$(grep -i "^\*\*dependencies\*\*:" "$ticket" | head -1 | cut -d: -f2 | xargs || echo "None")
        
        echo -e "${BLUE}Ticket ${ticket_num}:${NC} ${ticket_title}"
        echo "  Priority: ${priority}"
        echo "  Est. Time: ${estimated_time}"
        echo "  Dependencies: ${dependencies}"
        echo
    fi
done

# Dependencies chart
echo -e "${BLUE}🔗 Dependencies Chart:${NC}"
echo "======================="
echo
cat << 'DEPENDENCIES'
Ticket 1 (Discovery) → Tickets 2, 3, 4, 5
Ticket 2 (Token Addresses) → Tickets 3, 4, 5, 6
Ticket 3 (TJ V1) → Ticket 6 (API)
Ticket 4 (TJ V2) → Ticket 6 (API)
Ticket 5 (Third DEX) → Ticket 6 (API)
All tickets → Ticket 7 (Testing)
All tickets → Ticket 8 (Documentation)
DEPENDENCIES

echo
echo -e "${BLUE}📊 Suggested Workflow:${NC}"
echo "======================="
echo
cat << 'WORKFLOW'
1. Create GitHub issues from ticket files
2. Create GitHub Project board
3. Add issues to project board
4. Assign team members based on skills:
   - Smart Contract Engineer: Tickets 3, 4, 5
   - Backend/API Engineer: Tickets 2, 6
   - QA/Testing Engineer: Ticket 7
   - Technical Writer: Ticket 8
   - All: Ticket 1 (critical path)
5. Start with Ticket 1 (DEX Address Discovery)
6. Daily standups to track progress
WORKFLOW

echo
echo -e "${BLUE}🔧 GitHub CLI Commands (if you have gh installed):${NC}"
echo "============================================================"
echo
cat << 'GH_COMMANDS'
# Create a new project
gh project create --owner danaszova --title "Phase 1: Infrastructure Recovery" \
  --description "Fix root cause issues with DEX addresses and adapters" \
  --visibility PUBLIC

# Or use the web interface:
# 1. Go to https://github.com/danaszova/avax-router
# 2. Click on "Projects" tab
# 3. Click "New project"
# 4. Choose "Board" template
# 5. Name it "Phase 1: Infrastructure Recovery"

# To create issues from ticket files manually:
# For each .github/phase1-issues/*.md file:
# 1. Copy the content
# 2. Go to Issues tab
# 3. Click "New issue"
# 4. Paste content and create
GH_COMMANDS

echo
echo -e "${GREEN}✅ Setup instructions generated!${NC}"
echo
echo "Next steps:"
echo "1. Review the tickets in .github/phase1-issues/"
echo "2. Create GitHub issues from each ticket"
echo "3. Create a GitHub Project board"
echo "4. Add issues to the project board"
echo "5. Assign team members and start working!"

exit 0
