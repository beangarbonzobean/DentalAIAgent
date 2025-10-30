# Cursor Quick Start Checklist

Fast-track setup guide to get Cursor working with your Dental AI Agent project.

---

## ✅ Pre-Setup Checklist

Before you begin, make sure you have:

- [x] Cursor IDE installed
- [x] Project cloned to: `C:\Users\frontofc\Desktop\Cursor\Dental AI Agent\DentalAIAgent`
- [x] Node.js and npm installed
- [x] Git installed
- [x] Access to Supabase Dashboard
- [x] Access to Replit project

---

## 🚀 5-Minute Setup

### Step 1: Verify Git Connection (30 seconds)

Open terminal in Cursor and run:

```bash
git remote -v
```

Expected output:
```
origin  https://github.com/beangarbonzobean/DentalAIAgent.git (fetch)
origin  https://github.com/beangarbonzobean/DentalAIAgent.git (push)
```

✅ If you see this, Git is configured correctly!

---

### Step 2: Configure Supabase MCP (2 minutes)

#### 2.1 Get Your Database Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select **HBDC agent Project**
3. **Project Settings** → **Database**
4. Copy the **Connection string (URI)**
5. Note your password (you'll need it next)

#### 2.2 Create MCP Configuration

**Windows:** Open this file (create if it doesn't exist):
```
C:\Users\frontofc\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**Add this configuration:**

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

**Replace `[YOUR-PASSWORD]` with your actual database password!**

#### 2.3 Restart Cursor

Close Cursor completely and reopen it.

---

### Step 3: Set Up Environment Variables (2 minutes)

#### 3.1 Create `.env` File

In your project root, create a file named `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://dpmwjmikdkcgjcmhdslc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=

# AI Model Configuration
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Open Dental Configuration (Optional)
OPENDENTAL_DEVELOPER_KEY=
```

#### 3.2 Get Supabase Service Role Key

1. [Supabase Dashboard](https://supabase.com/dashboard) → **HBDC agent Project**
2. **Project Settings** → **API**
3. Under **Project API keys**, find **service_role**
4. Click eye icon to reveal
5. Copy and paste into `.env` file

#### 3.3 Get API Keys from Replit

1. Go to your Replit project
2. Click **Secrets** tab (lock icon)
3. Copy `ANTHROPIC_API_KEY` value
4. Paste into your `.env` file
5. Repeat for `GEMINI_API_KEY` if configured

---

### Step 4: Test Everything (30 seconds)

#### 4.1 Start Dev Server

```bash
npm run dev
```

#### 4.2 Check Output

You should see:

```
🚀 Dental AI Agent API Server started successfully
📍 Environment: development
🌐 Server running on port 3000
🔧 Service Configuration:
   Supabase: ✅ Configured
   Anthropic Claude: ✅ Configured
   Google Gemini: ✅ Configured
```

✅ If you see all green checkmarks, you're ready!

#### 4.3 Test in Browser

Open: http://localhost:3000

You should see API information with practice details.

---

## 🎯 Daily Workflow

### Make Changes

1. Edit code in Cursor
2. Save files (Cursor auto-saves)
3. Test locally at http://localhost:3000

### Push to GitHub/Replit

```bash
# Check what changed
git status

# Stage all changes
git add .

# Commit with a message
git commit -m "Feature: Add new functionality"

# Push to GitHub (Replit auto-deploys)
git push origin main
```

### Pull Latest Changes

```bash
git pull origin main
```

---

## 🤖 Test Cursor AI with Supabase

After setup, test Cursor AI's database access by asking:

**Try these prompts in Cursor:**

1. "Show me all tables in the public schema"
2. "List all lab slips with status 'pending'"
3. "What's the schema for the labs table?"
4. "Count how many records are in the lab_slips table"

If Cursor AI can answer these, your MCP is working! 🎉

---

## ⚠️ Common Issues

### Issue: "Supabase: ❌ Missing credentials"

**Fix:**
1. Check `.env` file exists
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are filled in
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: Cursor AI can't access database

**Fix:**
1. Verify MCP config file path is correct
2. Check password in connection string
3. Restart Cursor completely
4. Test with: "List all Supabase projects"

### Issue: Port 3000 already in use

**Fix (Windows):**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
npm run dev
```

---

## 📚 Full Documentation

For detailed information, see:
- **[CURSOR_SETUP_GUIDE.md](./CURSOR_SETUP_GUIDE.md)** - Complete setup guide
- **[CROWN_WORK_ORDER_README.md](./CROWN_WORK_ORDER_README.md)** - Crown work order system
- **[replit.md](./replit.md)** - Replit deployment guide

---

## ✨ You're All Set!

You now have:
- ✅ Cursor connected to GitHub
- ✅ Supabase MCP configured
- ✅ Environment variables set up
- ✅ Local dev server running
- ✅ Git workflow ready

**Start coding with AI superpowers! 🚀**

---

*Need help? Check the full [CURSOR_SETUP_GUIDE.md](./CURSOR_SETUP_GUIDE.md)*
