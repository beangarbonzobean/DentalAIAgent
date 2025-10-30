# Development Workflow Diagrams

Visual guides for understanding the Cursor + GitHub + Replit workflow.

---

## Complete Development Workflow

```mermaid
graph TB
    subgraph "Local Development (Cursor)"
        A[Edit Code in Cursor]
        B[Cursor AI with Supabase MCP]
        C[Test Locally: localhost:3000]
        D[Git Commit]
        
        A --> B
        B --> C
        C --> D
    end
    
    subgraph "Version Control (GitHub)"
        E[Git Push to GitHub]
        F[GitHub Repository]
        G[Version History]
        
        D --> E
        E --> F
        F --> G
    end
    
    subgraph "Production (Replit)"
        H[Replit Auto-Pull]
        I[Replit Auto-Deploy]
        J[Production Server]
        
        F --> H
        H --> I
        I --> J
    end
    
    subgraph "Database (Supabase)"
        K[(Supabase Database)]
        
        B -.Query via MCP.-> K
        C -.Test API.-> K
        J -.Production API.-> K
    end
    
    style A fill:#4CAF50
    style J fill:#2196F3
    style K fill:#FF9800
    style B fill:#9C27B0
```

---

## Git Workflow: Push Changes

```mermaid
sequenceDiagram
    participant Dev as Developer (Cursor)
    participant Git as Local Git
    participant GH as GitHub
    participant Replit as Replit Server
    
    Dev->>Dev: Make code changes
    Dev->>Dev: Test locally (npm run dev)
    Dev->>Git: git add .
    Dev->>Git: git commit -m "message"
    Dev->>Git: git push origin main
    Git->>GH: Push commits
    GH->>Replit: Webhook trigger
    Replit->>GH: Pull latest changes
    Replit->>Replit: Auto-deploy
    Replit-->>Dev: Deployment complete ✅
```

---

## Git Workflow: Pull Changes

```mermaid
sequenceDiagram
    participant Other as Other Developer/Replit
    participant GH as GitHub
    participant Git as Local Git
    participant Dev as Developer (Cursor)
    
    Other->>GH: Push changes to GitHub
    Dev->>Git: git pull origin main
    Git->>GH: Fetch latest changes
    GH->>Git: Download commits
    Git->>Dev: Update local files
    Dev->>Dev: Review changes
    Dev->>Dev: Test locally
```

---

## Cursor AI with Supabase MCP

```mermaid
graph LR
    subgraph "Cursor IDE"
        A[Developer Types Prompt]
        B[Cursor AI Agent]
    end
    
    subgraph "MCP Layer"
        C[Supabase MCP Server]
        D[MCP Protocol]
    end
    
    subgraph "Supabase"
        E[(PostgreSQL Database)]
        F[Supabase API]
    end
    
    A --> B
    B --> D
    D --> C
    C --> F
    F --> E
    E --> F
    F --> C
    C --> D
    D --> B
    B --> A
    
    style B fill:#9C27B0
    style C fill:#4CAF50
    style E fill:#FF9800
```

**Example Flow:**

1. Developer asks: "Show me all pending lab slips"
2. Cursor AI receives the prompt
3. AI determines it needs database access
4. AI calls Supabase MCP server
5. MCP executes SQL query on Supabase
6. Results returned to MCP
7. MCP sends data to Cursor AI
8. AI formats and displays results to developer

---

## Environment Configuration Flow

```mermaid
graph TB
    subgraph "Supabase Dashboard"
        A[Get Service Role Key]
        B[Get Database Password]
        C[Get Project URL]
    end
    
    subgraph "Replit Secrets"
        D[Get API Keys]
    end
    
    subgraph "Local Configuration"
        E[Create .env file]
        F[Add Supabase credentials]
        G[Add API keys]
        H[Configure MCP]
    end
    
    subgraph "Cursor Setup"
        I[Create MCP config file]
        J[Add connection string]
        K[Restart Cursor]
    end
    
    A --> F
    B --> J
    C --> F
    D --> G
    
    F --> E
    G --> E
    
    B --> J
    J --> I
    I --> K
    
    E --> L[npm run dev]
    K --> M[Cursor AI Ready]
    
    style E fill:#4CAF50
    style I fill:#9C27B0
    style L fill:#2196F3
    style M fill:#FF9800
```

---

## API Request Flow

```mermaid
sequenceDiagram
    participant Client as Client/Browser
    participant API as Express API Server
    participant DB as Supabase Database
    participant AI as AI Service (Claude/Gemini)
    
    Client->>API: POST /api/work-orders
    API->>API: Validate request
    API->>DB: Check existing records
    DB-->>API: Return data
    API->>AI: Process with AI (optional)
    AI-->>API: Return AI response
    API->>DB: Insert new record
    DB-->>API: Confirm insertion
    API-->>Client: Return success + data
```

---

## Development vs Production

```mermaid
graph TB
    subgraph "Development (Cursor - Local)"
        A[Local Code]
        B[Local .env]
        C[npm run dev]
        D[localhost:3000]
        E[Test & Debug]
    end
    
    subgraph "Production (Replit)"
        F[GitHub Code]
        G[Replit Secrets]
        H[Auto Deploy]
        I[Production URL]
        J[Live Users]
    end
    
    subgraph "Shared Resources"
        K[(Supabase Database)]
        L[AI APIs]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    
    F --> H
    G --> H
    H --> I
    I --> J
    
    D -.-> K
    I --> K
    
    D -.-> L
    I --> L
    
    A -->|git push| F
    
    style A fill:#4CAF50
    style F fill:#2196F3
    style K fill:#FF9800
```

**Key Differences:**

| Aspect | Development (Cursor) | Production (Replit) |
|--------|---------------------|---------------------|
| **Code Source** | Local files | GitHub repository |
| **Environment** | .env file | Replit Secrets |
| **Server** | npm run dev | npm run start |
| **URL** | localhost:3000 | Replit production URL |
| **Purpose** | Testing & debugging | Live users |
| **Database** | Shared Supabase | Shared Supabase |

---

## Troubleshooting Decision Tree

```mermaid
graph TD
    A[Issue Detected] --> B{What's the problem?}
    
    B -->|Server won't start| C{Check .env file}
    C -->|Missing| D[Create .env from .env.example]
    C -->|Exists| E{Check credentials}
    E -->|Invalid| F[Update from Supabase Dashboard]
    E -->|Valid| G[Check port 3000 availability]
    
    B -->|Git push fails| H{Check error message}
    H -->|Rejected| I[git pull origin main first]
    H -->|Auth failed| J[Check GitHub credentials]
    
    B -->|Cursor AI can't access DB| K{Check MCP config}
    K -->|Missing| L[Create MCP config file]
    K -->|Wrong path| M[Verify file location]
    K -->|Wrong password| N[Update connection string]
    
    B -->|Replit not deploying| O{Check GitHub}
    O -->|Not pushed| P[git push origin main]
    O -->|Pushed| Q[Check Replit logs]
    
    D --> R[Restart server]
    F --> R
    G --> S[Kill process on port 3000]
    S --> R
    
    I --> T[Resolve conflicts]
    T --> U[git push again]
    
    L --> V[Restart Cursor]
    M --> V
    N --> V
    
    P --> W[Wait for auto-deploy]
    Q --> X[Debug from logs]
    
    style A fill:#f44336
    style R fill:#4CAF50
    style V fill:#4CAF50
    style W fill:#4CAF50
```

---

## File Structure Overview

```mermaid
graph TB
    subgraph "Project Root"
        A[DentalAIAgent/]
    end
    
    subgraph "Source Code"
        B[src/]
        B1[src/api/]
        B2[src/database/]
        B3[src/utils/]
        B4[src/index.ts]
    end
    
    subgraph "Configuration"
        C[.env]
        C1[.env.example]
        C2[package.json]
        C3[tsconfig.json]
        C4[.gitignore]
    end
    
    subgraph "Documentation"
        D[CURSOR_SETUP_GUIDE.md]
        D1[CURSOR_QUICK_START.md]
        D2[WORKFLOW_DIAGRAM.md]
        D3[CROWN_WORK_ORDER_README.md]
    end
    
    subgraph "Database"
        E[migrations/]
        E1[supabase-schema.sql]
        E2[drizzle.config.ts]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    
    B --> B1
    B --> B2
    B --> B3
    B --> B4
    
    C --> C1
    C --> C2
    C --> C3
    C --> C4
    
    D --> D1
    D --> D2
    D --> D3
    
    E --> E1
    E --> E2
    
    style A fill:#2196F3
    style B fill:#4CAF50
    style C fill:#FF9800
    style D fill:#9C27B0
    style E fill:#00BCD4
```

---

## Summary

These diagrams illustrate:

1. **Complete Workflow** - How Cursor, GitHub, and Replit work together
2. **Git Operations** - Push and pull workflows
3. **Cursor AI + MCP** - How AI accesses your database
4. **Environment Setup** - Configuration flow
5. **API Requests** - How requests are processed
6. **Dev vs Prod** - Differences between environments
7. **Troubleshooting** - Decision tree for common issues
8. **File Structure** - Project organization

Use these as reference when working with the project!

---

*For detailed setup instructions, see [CURSOR_SETUP_GUIDE.md](./CURSOR_SETUP_GUIDE.md)*
