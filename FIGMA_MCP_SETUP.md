# Figma MCP Server Setup Guide

Complete guide to integrate Figma designs with Cursor using Model Context Protocol (MCP).

---

## 🎯 Two Options Available

### Option 1: Desktop MCP Server (Recommended)
- Works with Figma Desktop App
- Local connection (faster)
- No authentication needed after initial setup

### Option 2: Remote MCP Server
- Works with Figma in browser
- Cloud-based connection
- Requires authentication

---

## 📦 Option 1: Desktop MCP Server Setup

### Prerequisites
- Figma Desktop App (latest version)
- Figma file you want to access

### Step 1: Install Figma Desktop App

Download from: https://www.figma.com/downloads/

### Step 2: Enable MCP in Figma

1. **Open your Figma file** in the desktop app
2. **Switch to Dev Mode:**
   - Click the "Dev Mode" toggle in toolbar, OR
   - Press `Shift + D`
3. **Enable MCP Server:**
   - Look for MCP server option in the right sidebar
   - Click to enable it
   - Server will start at: `http://127.0.0.1:3845/mcp`
4. **Copy the server URL**

### Step 3: Configure Cursor

#### Method A: Using Cursor UI (Easiest)

1. Open **Cursor Settings** (`Cmd/Ctrl + ,`)
2. Go to **Features** → **Model Context Protocol**
3. Click **"Add Server"**
4. Select **"HTTP"**
5. Enter:
   ```
   Server URL: http://127.0.0.1:3845/mcp
   Server ID: figma-desktop
   ```
6. Click **Save**
7. Restart Cursor

#### Method B: Manual Configuration

1. Create/edit `~/.cursor/mcp_config.json`:

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp",
      "type": "http"
    }
  }
}
```

2. Restart Cursor

### Step 4: Verify Connection

1. In Cursor, open command palette (`Cmd/Ctrl + Shift + P`)
2. Type "MCP" to see available commands
3. You should see Figma-related MCP resources

---

## 🌐 Option 2: Remote MCP Server Setup

### Step 1: Get Figma Personal Access Token

1. Go to https://www.figma.com/settings
2. Scroll to **"Personal access tokens"** section
3. Click **"Create new token"**
4. Configure:
   - **Name:** "MCP Server" or "Cursor Integration"
   - **Scopes:**
     - ✅ File content (read)
     - ✅ File metadata (read)
     - ✅ Comments (optional)
5. Click **"Generate token"**
6. **Copy the token immediately!** (You won't see it again)

### Step 2: Install Figma MCP Package

```bash
npm install -g @modelcontextprotocol/server-figma
```

### Step 3: Configure Cursor

#### Method A: Using Deep Link (Easiest)

1. Open your Figma file in browser
2. Switch to **Dev Mode** (`Shift + D`)
3. In right sidebar, click **"Set up an MCP client"**
4. Click the **Cursor deep link**
5. Follow the authentication prompts
6. Authorize access

#### Method B: Manual Configuration

Create `~/.cursor/mcp_config.json`:

```json
{
  "mcpServers": {
    "figma-remote": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_FIGMA_TOKEN_HERE"
      }
    }
  }
}
```

Replace `YOUR_FIGMA_TOKEN_HERE` with your actual token.

### Step 4: Restart Cursor

Close and reopen Cursor for changes to take effect.

---

## 🧪 Testing Your Setup

### 1. Check Available Resources

In your AI chat, you should now be able to:

```
Can you list available Figma resources?
```

### 2. Access Figma File

```
Can you fetch the Figma file: 
https://www.figma.com/design/KR7CIVPouZWKLSGvocgGPd/Untitled
```

### 3. Get Component Details

```
Show me all frames in the Figma file
```

---

## 📋 Available MCP Commands

Once connected, you can:

### List Files
```
Show me all my Figma files
```

### Get File Details
```
Get details of Figma file: [FILE_URL]
```

### Extract Components
```
List all components in the file
```

### Get Design Tokens
```
Extract colors and typography from the design
```

### Export Assets
```
Export images from frame [FRAME_NAME]
```

---

## 🔧 Troubleshooting

### Desktop Server Not Connecting

**Issue:** Can't connect to `http://127.0.0.1:3845/mcp`

**Solutions:**
1. Make sure Figma Desktop app is running
2. Ensure Dev Mode is enabled in Figma
3. Check that MCP server is enabled in the sidebar
4. Try restarting Figma Desktop app

### Remote Server Authentication Failed

**Issue:** Token not working

**Solutions:**
1. Verify token has correct scopes:
   - File content (read)
   - File metadata (read)
2. Generate a new token if expired
3. Check token is correctly pasted in config
4. Ensure no extra spaces in token string

### MCP Server Not Showing in Cursor

**Solutions:**
1. Check config file location: `~/.cursor/mcp_config.json`
2. Verify JSON syntax is correct (no trailing commas)
3. Restart Cursor completely
4. Check Cursor Settings → Features → MCP

### Connection Timeout

**Solutions:**
1. For Desktop: Make sure Figma app is not sleeping
2. For Remote: Check your internet connection
3. Try increasing timeout in config:
   ```json
   {
     "url": "...",
     "timeout": 30000
   }
   ```

---

## 🎨 Usage Examples

### Example 1: Get Design System Colors

```
Extract all color tokens from my Figma design system
```

### Example 2: Component Specs

```
Get the specifications for the Button component including:
- Dimensions
- Colors
- Typography
- Spacing
```

### Example 3: Export Assets

```
Export all icons as SVG from the Icons frame
```

### Example 4: Generate Code

```
Generate React Native code for the Login screen component
```

---

## 🔐 Security Best Practices

### For Personal Access Tokens

1. **Never commit tokens to git**
   - Add `mcp_config.json` to `.gitignore`
   - Use environment variables for CI/CD

2. **Rotate tokens regularly**
   - Create new tokens every 90 days
   - Revoke old tokens immediately

3. **Use minimal scopes**
   - Only enable scopes you actually need
   - Avoid write access unless necessary

4. **Store securely**
   - Use password managers for token storage
   - Don't share tokens via insecure channels

### For Desktop Server

1. **Only enable when needed**
   - Disable MCP server when not in use
   - Close Figma when done designing

2. **Trust your local network**
   - Desktop server only accessible on localhost
   - No external access by default

---

## 📚 Additional Resources

- [Figma MCP Documentation](https://www.figma.com/developers/mcp)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Cursor MCP Guide](https://docs.cursor.com/mcp)
- [Figma API Reference](https://www.figma.com/developers/api)

---

## ✅ Quick Setup Checklist

### Desktop Server Setup
- [ ] Install Figma Desktop App
- [ ] Open your Figma file
- [ ] Enable Dev Mode (`Shift + D`)
- [ ] Enable MCP Server in sidebar
- [ ] Note the server URL
- [ ] Add server to Cursor settings
- [ ] Restart Cursor
- [ ] Test connection

### Remote Server Setup
- [ ] Get Figma Personal Access Token
- [ ] Install `@modelcontextprotocol/server-figma`
- [ ] Create `mcp_config.json` with token
- [ ] Restart Cursor
- [ ] Test connection with a file URL
- [ ] Verify you can fetch file data

---

## 🎉 You're Ready!

Once configured, you can seamlessly access Figma designs directly in Cursor and:
- Extract design specifications
- Generate code from designs
- Export assets
- Get design tokens
- Sync design and code

Happy designing and coding! 🚀






