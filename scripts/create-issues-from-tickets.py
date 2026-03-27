#!/usr/bin/env python3
"""
Create GitHub issues from ticket files in .github/phase1-issues/
This script helps automate the creation of GitHub issues.
"""

import os
import re
import json
from pathlib import Path

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def parse_ticket_file(file_path):
    """Parse a ticket markdown file and extract metadata."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract metadata using regex
    metadata = {}
    
    # Ticket title (first line without #)
    lines = content.split('\n')
    if lines and lines[0].startswith('#'):
        metadata['title'] = lines[0].replace('# ', '').strip()
    
    # Parse key-value pairs with **key**: value format
    pattern = r'\*\*(\w+\s*\w*)\*\*:\s*(.+)'
    matches = re.findall(pattern, content)
    for key, value in matches:
        metadata[key.lower().replace(' ', '_')] = value.strip()
    
    # Extract acceptance criteria
    ac_section = False
    acceptance_criteria = []
    for line in lines:
        if '## Acceptance Criteria' in line:
            ac_section = True
            continue
        if ac_section and line.strip().startswith('##'):
            ac_section = False
            continue
        if ac_section and line.strip().startswith('- ['):
            acceptance_criteria.append(line.strip())
    
    metadata['acceptance_criteria'] = acceptance_criteria
    metadata['content'] = content
    
    return metadata

def generate_issue_body(metadata):
    """Generate a formatted GitHub issue body from metadata."""
    body = f"""{metadata.get('content', '')}

---

## GitHub Issue Metadata (Auto-generated)

**Status:** Backlog  
**Priority:** {metadata.get('priority', 'Not specified')}  
**Estimated Time:** {metadata.get('estimated_time', 'Not specified')}  
**Dependencies:** {metadata.get('dependencies', 'None')}  
**Labels:** {metadata.get('labels', 'phase1')}  

## Workflow

1. Assign this issue to a team member
2. Move to 'In Progress' when work starts
3. Move to 'In Review' when ready for review
4. Move to 'Done' when acceptance criteria are met

## Notes for Implementation
- Check dependencies before starting
- Update status in GitHub Project board
- Link related PRs to this issue
"""
    return body

def generate_gh_cli_commands(tickets):
    """Generate GitHub CLI commands to create issues."""
    commands = []
    
    for ticket_num, metadata in tickets.items():
        title = metadata['title']
        body = generate_issue_body(metadata)
        labels = metadata.get('labels', 'phase1')
        
        # Escape quotes in body
        body_escaped = body.replace('"', '\\"').replace('`', '\\`')
        
        cmd = f"gh issue create --title \"{title}\" --body \"{body_escaped}\" --label \"{labels}\""
        commands.append(cmd)
    
    return commands

def main():
    print(f"{Colors.HEADER}📋 GitHub Issue Creation Script{Colors.END}")
    print(f"{Colors.HEADER}================================{Colors.END}\n")
    
    # Find all ticket files
    ticket_dir = Path(".github/phase1-issues")
    if not ticket_dir.exists():
        print(f"{Colors.RED}❌ Error: Directory {ticket_dir} not found{Colors.END}")
        return
    
    ticket_files = list(ticket_dir.glob("*.md"))
    print(f"{Colors.GREEN}✅ Found {len(ticket_files)} ticket files{Colors.END}\n")
    
    # Parse all tickets
    tickets = {}
    for ticket_file in sorted(ticket_files):
        ticket_num = ticket_file.stem[:2]
        metadata = parse_ticket_file(ticket_file)
        tickets[ticket_num] = metadata
        
        print(f"{Colors.BLUE}📄 Ticket {ticket_num}: {metadata.get('title', 'No title')}{Colors.END}")
        print(f"   Priority: {metadata.get('priority', 'Not specified')}")
        print(f"   Est. Time: {metadata.get('estimated_time', 'Not specified')}")
        print(f"   Dependencies: {metadata.get('dependencies', 'None')}")
        print()
    
    # Generate GitHub CLI commands
    print(f"{Colors.HEADER}🔧 GitHub CLI Commands:{Colors.END}")
    print(f"{Colors.HEADER}======================{Colors.END}\n")
    
    commands = generate_gh_cli_commands(tickets)
    for i, cmd in enumerate(commands, 1):
        print(f"# Command for Ticket {list(tickets.keys())[i-1]}:")
        print(cmd)
        print()
    
    # Generate manual creation instructions
    print(f"{Colors.HEADER}📝 Manual Creation Instructions:{Colors.END}")
    print(f"{Colors.HEADER}==============================={Colors.END}\n")
    
    for ticket_num, metadata in tickets.items():
        print(f"For Ticket {ticket_num}: {metadata['title']}")
        print(f"1. Go to: https://github.com/danaszova/avax-router/issues/new")
        print(f"2. Title: {metadata['title']}")
        print(f"3. Labels: {metadata.get('labels', 'phase1')}")
        print(f"4. Paste the content from: .github/phase1-issues/{ticket_num}-*.md")
        print(f"5. Click 'Submit new issue'")
        print()
    
    # Generate project board setup
    print(f"{Colors.HEADER}🏗️  Project Board Setup:{Colors.END}")
    print(f"{Colors.HEADER}====================={Colors.END}\n")
    
    project_setup = """
1. Create a new GitHub Project:
   - Go to https://github.com/danaszova/avax-router/projects
   - Click "New project"
   - Choose "Board" template
   - Name: "Phase 1: Infrastructure Recovery"
   - Description: "Fix root cause issues with DEX addresses and adapters"

2. Add custom fields:
   - Status (Single select: Backlog, Ready, In Progress, In Review, Done, Blocked)
   - Priority (Single select: Critical, High, Medium-High, Medium, Low)
   - Estimated Days (Number)
   - Milestone (Single select: Week 1-2: Core Functionality, Week 3: Testing & Documentation)
   - Dependencies (Text)

3. Add all Phase 1 issues to the project

4. Set up columns:
   - Backlog
   - Ready for Work
   - In Progress
   - In Review
   - Done
   - Blocked

5. Assign team members:
   - Smart Contract Engineer: Tickets 3, 4, 5
   - Backend/API Engineer: Tickets 2, 6
   - QA/Testing Engineer: Ticket 7
   - Technical Writer: Ticket 8
   - All: Ticket 1 (critical path)
    """
    
    print(project_setup)
    
    # Save commands to file
    with open("scripts/gh-create-issues.sh", "w") as f:
        f.write("#!/bin/bash\n\n")
        f.write("# GitHub CLI commands to create Phase 1 issues\n")
        f.write("# Make sure you're logged in: gh auth login\n\n")
        for cmd in commands:
            f.write(f"{cmd}\n")
        f.write("\necho \"✅ All issues created! Now add them to your project board.\"\n")
    
    os.chmod("scripts/gh-create-issues.sh", 0o755)
    print(f"{Colors.GREEN}✅ Generated script: scripts/gh-create-issues.sh{Colors.END}")
    print(f"{Colors.GREEN}✅ Run 'bash scripts/gh-create-issues.sh' to create all issues{Colors.END}")

if __name__ == "__main__":
    main()
