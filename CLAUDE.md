# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agents Liminals** is a collection of interactive web applications that provide spiritual/psychological consultations through AI-powered "Liminal Agents". Each agent specializes in different emotional territories and offers guided rituals with AI-generated insights.

### Core Architecture

- **Frontend**: Standalone HTML files with embedded CSS and JavaScript
- **Backend**: n8n workflows that handle AI processing via OpenAI API
- **Integration**: Web interfaces communicate with n8n webhooks for AI consultations

### Agent Types

1. **L'Accordeur de Sens** (`accordeur.html`) - Territory of Confusion ("I don't understand what's happening to me")
2. **Le Peseur d'Ambigus** (`peseur.html`) - Territory of Doubt ("I'm torn between options")
3. **Le Denoueur** (`denoueur.html`) - Territory of Tension
4. **L'Evideur** (`evideur.html`) - Territory of Revelation
5. **L'Habitant du Creux** (`habitant.html`) - Territory of Emptiness
6. **L'Observatoire des États Intérieurs** (`observatoire.html`) - Central hub

## Development Guidelines

### File Structure
- Each agent has its own HTML file with self-contained styling and functionality
- N8n workflows in `workflows-n8n/` directory contain AI prompt engineering and webhook configurations
- No build process - files are served directly

### Key Technical Patterns

#### Webhook Integration
- Each agent connects to specific n8n webhook endpoints: `https://n8n.memoapp.eu/webhook/{agent-name}`
- Payload structure: `{situation: string, rituel: string, timestamp: ISO string}`
- Response format: `{consultation: string, signature: string, session_id: string, timestamp: ISO string}`

#### Daily Usage Limits
- Each agent implements 3 consultations per day limit via localStorage
- Counter format: `{AGENT_NAME}_consultations_{dateString}`
- Visual feedback changes color based on usage (green → yellow → red)

#### Local Storage Management
- Consultation history: `{AGENT_NAME}_history` (keeps last 10 consultations)
- Daily counters reset automatically based on date string comparison

#### Styling Approach
- Each agent has unique color scheme and visual identity
- Consistent CSS pattern with agent-specific color variables
- Responsive design with mobile-first approach
- Custom animations for consultation reveals

### AI Prompt Architecture (n8n workflows)
- System prompts define agent personality and response format
- Temperature typically set to 0.4 for consistent but creative responses
- Max tokens around 500 for concise consultations
- Each agent has specific response format templates

### Common Debugging Steps
1. Check browser console for JavaScript errors
2. Verify n8n webhook URLs are accessible
3. Test localStorage functionality for consultation limits
4. Validate JSON payload structure for webhook calls

### Adding New Agents
1. Create new HTML file following existing pattern
2. Set up corresponding n8n workflow with webhook
3. Define unique agent personality and response format in system prompt
4. Implement consultation limits and history management
5. Create distinct visual identity with custom CSS

### File Naming Conventions
- Agent HTML files: lowercase with descriptive names (`accordeur.html`)
- N8n workflows: Title case with "Agent Liminal" suffix
- CSS classes: kebab-case with agent-specific prefixes where needed

## Technical Notes

- No external dependencies or frameworks
- Pure vanilla JavaScript with ES6+ features
- CSS uses modern features (grid, flexbox, custom properties)
- French language interface throughout
- Keyboard shortcuts: Ctrl+Enter submits consultation forms