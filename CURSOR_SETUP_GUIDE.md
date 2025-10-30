# Cursor Setup Guide for Dental AI Agent

Complete guide to set up Cursor IDE to work seamlessly with your Replit project via GitHub sync and Supabase MCP integration.

---

## Overview

This guide will help you establish a professional development workflow:

**Cursor (Local Development)** ↔️ **GitHub (Version Control)** ↔️ **Replit (Production Deployment)**

Your project is already cloned locally at:
```
C:\Users\frontofc\Desktop\Cursor\Dental AI Agent\DentalAIAgent
```

The GitHub repository is:
```
https://github.com/beangarbonzobean/DentalAIAgent.git
```

---

## Part 1: Verify Git Configuration

Your local repository should already be connected to GitHub. Let's verify this.

### Step 1: Check Git Remote

Open a terminal in Cursor (`` Ctrl+` ``) and run:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/beangarbonzobean/DentalAIAgent.git (fetch)
origin  https://github.com/beangarbonzobean/DentalAIAgent.git (push)
```

### Step 2: Check Current Branch

```bash
git branch
```

You should be on the `main` branch (indicated by `*`).

### Step 3: Verify Git Status

```bash
git status
```

This shows any uncommitted changes in your local repository.

---

## Part 2: Configure Supabase MCP in Cursor

The Supabase MCP (Model Context Protocol) allows Cursor AI to directly interact with your Supabase database.

### Your Supabase Project Details

- **Project Name**: HBDC agent Project
- **Project ID**: `dpmwjmikdkcgjcmhdslc`
- **Project URL**: `https://dpmwjmikdkcgjcmhdslc.supabase.co`
- **Region**: us-east-2
- **Database Version**: PostgreSQL 17.6.1

### Step 1: Locate Cursor MCP Configuration File

The MCP configuration file location depends on your operating system:

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

Full path example:
```
C:\Users\frontofc\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**Mac:**
```
~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

**Linux:**
```
~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### Step 2: Get Your Supabase Database Password

You need your Supabase database password to create the connection string.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **HBDC agent Project**
3. Click **Project Settings** (gear icon in sidebar)
4. Click **Database** in the left menu
5. Under **Connection string**, find the **URI** format
6. Copy the connection string (it will have `[YOUR-PASSWORD]` placeholder)
7. Replace `[YOUR-PASSWORD]` with your actual database password

The connection string format:
```
postgres://postgres.dpmwjmikdkcgjcmhdslc:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Step 3: Create or Update MCP Configuration

Open the `cline_mcp_settings.json` file in a text editor (create it if it doesn't exist) and add:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "postgres://postgres.dpmwjmikdkcgjcmhdslc:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### Step 4: Restart Cursor

After saving the configuration file, completely close and restart Cursor for the changes to take effect.

### Step 5: Verify MCP Connection

After restarting Cursor, you can verify the Supabase MCP is working by asking Cursor AI:

```
"Show me all tables in the public schema"
```

Cursor should be able to query your database and show you the tables:
- `agent_memory`
- `automation_registry`
- `execution_logs`
- `labs`
- `lab_slip_templates`
- `lab_slips`
- `procedure_monitoring`
- `dental_knowledge_base`

---

## Part 3: Configure Environment Variables

Your local development server needs the same environment variables as Replit.

### Step 1: Create `.env` File

In your project root (`C:\Users\frontofc\Desktop\Cursor\Dental AI Agent\DentalAIAgent`), create a file named `.env`:

```bash
# Create .env file
touch .env
```

Or create it manually in Cursor.

### Step 2: Add Required Environment Variables

Copy these variables into your `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://dpmwjmikdkcgjcmhdslc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Model Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Open Dental Configuration (Optional)
OPENDENTAL_API_URL=https://api.opendental.com/api/v1
OPENDENTAL_DEVELOPER_KEY=your_opendental_developer_key_here
OPENDENTAL_CUSTOMER_KEY=your_opendental_customer_key_here
```

### Step 3: Get Your Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **HBDC agent Project**
3. Click **Project Settings** (gear icon)
4. Click **API** in the left menu
5. Under **Project API keys**, find **service_role** key
6. Click the eye icon to reveal it
7. Copy and paste it into your `.env` file

**⚠️ Security Warning:** The service_role key has full database access. Never commit this to GitHub!

### Step 4: Get Your API Keys from Replit

If you already have these keys configured in Replit:

1. Go to your Replit project
2. Click the **Secrets** tab (lock icon in left sidebar)
3. Copy the values for:
   - `ANTHROPIC_API_KEY`
   - `GEMINI_API_KEY` (if configured)
   - Any Open Dental keys (if configured)
4. Paste them into your local `.env` file

### Step 5: Verify `.env` is in `.gitignore`

Make sure your `.env` file is listed in `.gitignore` to prevent accidentally committing secrets:

```bash
cat .gitignore
```

You should see `.env` in the list. If not, add it:

```bash
echo ".env" >> .gitignore
```

---

## Part 4: Development Workflow

Now that everything is configured, here's your daily workflow.

### Local Development in Cursor

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Access your local server:**
   ```
   http://localhost:3000
   ```

3. **Make changes in Cursor:**
   - Edit code with full AI assistance
   - Cursor AI can now query your Supabase database directly
   - Test changes locally before pushing

4. **Check server status:**
   The server will show configuration status on startup:
   ```
   🔧 Service Configuration:
      Supabase: ✅ Configured
      Anthropic Claude: ✅ Configured
      Google Gemini: ✅ Configured
      Open Dental: ⚠️  Optional - not configured
   ```

### Git Workflow: Cursor → GitHub → Replit

#### Step 1: Check What Changed

```bash
git status
```

#### Step 2: Stage Your Changes

```bash
# Stage all changes
git add .

# Or stage specific files
git add src/api/someFile.ts
```

#### Step 3: Commit Your Changes

```bash
git commit -m "Feature: Add crown work order validation"
```

**Commit Message Best Practices:**
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Examples:
  - `Fix: Resolve Supabase connection timeout`
  - `Feature: Add patient search endpoint`
  - `Refactor: Improve error handling in lab slip routes`
  - `Docs: Update API documentation`

#### Step 4: Push to GitHub

```bash
git push origin main
```

#### Step 5: Replit Auto-Deploys

Replit is configured to automatically pull from GitHub and redeploy when you push changes. No manual action needed!

### Pull Latest Changes from Replit/GitHub

If changes were made in Replit or by someone else:

```bash
# Pull latest changes
git pull origin main
```

---

## Part 5: Cursor AI Features with Supabase MCP

With Supabase MCP configured, you can ask Cursor AI to:

### Database Queries

**Example prompts:**
- "Show me all crown work orders from the last week"
- "List all active labs in the database"
- "Count how many lab slips have status 'pending'"
- "Show me the schema for the lab_slips table"

### Database Modifications

**Example prompts:**
- "Add a new column 'priority' to the lab_slips table"
- "Create an index on procedure_code in lab_slips"
- "Write a migration to add a notes field to the labs table"

### Code Generation

**Example prompts:**
- "Generate a TypeScript function to create a new lab slip"
- "Write an API endpoint to update lab slip status"
- "Create a query to find all overdue lab slips"

### Database Analysis

**Example prompts:**
- "Analyze the lab_slips table and suggest performance improvements"
- "Check for missing indexes on foreign keys"
- "Show me all tables that don't have RLS enabled"

---

## Part 6: Troubleshooting

### Issue: "Supabase: ❌ Missing credentials"

**Solution:**
1. Check your `.env` file exists in the project root
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
3. Restart the dev server: `Ctrl+C` then `npm run dev`

### Issue: "Anthropic Claude: ❌ Missing API key"

**Solution:**
1. Add `ANTHROPIC_API_KEY` to your `.env` file
2. Get the key from Replit Secrets or create a new one at [Anthropic Console](https://console.anthropic.com/)
3. Restart the dev server

### Issue: Git push fails with "rejected"

**Solution:**
```bash
# Pull latest changes first
git pull origin main

# Resolve any conflicts
# Then push again
git push origin main
```

### Issue: Cursor AI can't access Supabase

**Solution:**
1. Verify MCP configuration file path is correct
2. Check the connection string has the correct password
3. Restart Cursor completely (close all windows)
4. Test with: "List all Supabase projects"

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Then restart
npm run dev
```

---

## Part 7: Quick Reference

### Essential Commands

```bash
# Start development server
npm run dev

# Check code for TypeScript errors
npm run check

# Build for production
npm run build

# Push database schema changes
npm run db:push

# Git workflow
git status                    # Check changes
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin main          # Push to GitHub
git pull origin main          # Pull latest changes
```

### Project Structure

```
DentalAIAgent/
├── src/                      # Main source code
│   ├── api/                  # API route handlers
│   ├── database/             # Database connections
│   ├── utils/                # Utility functions
│   └── index.ts              # Server entry point
├── server/                   # Server bootstrap
├── client/                   # Frontend code
├── migrations/               # Database migrations
├── .env                      # Environment variables (local only)
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key |
| `GEMINI_API_KEY` | No | Google Gemini API key (optional) |
| `OPENDENTAL_API_URL` | No | Open Dental API URL (optional) |
| `OPENDENTAL_DEVELOPER_KEY` | No | Open Dental developer key (optional) |
| `OPENDENTAL_CUSTOMER_KEY` | No | Open Dental customer key (optional) |

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API information and practice details |
| `GET /api/health` | Health check endpoint |
| `POST /api/agent` | AI agent chat endpoint |
| `POST /api/automation` | Automation execution |
| `POST /api/labslip` | Lab slip generation |
| `GET /api/work-orders` | List crown work orders |
| `POST /api/work-orders` | Create crown work order |
| `POST /api/ai-agent` | AI command execution |

---

## Part 8: Next Steps

### Recommended Setup Order

1. ✅ **Verify Git connection** (Part 1)
2. ✅ **Configure Supabase MCP** (Part 2)
3. ✅ **Set up environment variables** (Part 3)
4. ✅ **Test local development** (Part 4)
5. ✅ **Practice Git workflow** (Part 4)

### Advanced Features to Explore

1. **Database Migrations**
   - Learn to create and apply migrations
   - Use `npm run db:push` to sync schema changes

2. **Custom MCP Servers**
   - Create an Open Dental MCP server for direct API access
   - Add Notion MCP for documentation sync

3. **Testing**
   - Set up unit tests for API endpoints
   - Add integration tests for database operations

4. **CI/CD**
   - Configure GitHub Actions for automated testing
   - Set up automatic deployment to Replit on merge

---

## Support

If you encounter issues not covered in this guide:

1. Check the [Cursor Documentation](https://cursor.sh/docs)
2. Review [Supabase MCP Documentation](https://github.com/supabase/mcp-server-supabase)
3. Check the project's GitHub Issues
4. Ask in the Replit community forums

---

## Summary

You now have a complete development environment with:

- ✅ **Cursor IDE** for local development with AI assistance
- ✅ **Supabase MCP** for direct database access from Cursor AI
- ✅ **GitHub** for version control and collaboration
- ✅ **Replit** for automatic deployment
- ✅ **Environment variables** properly configured
- ✅ **Git workflow** for seamless sync

**Happy coding! 🚀**

---

*Last updated: October 30, 2025*
