# Development Workflow Guide

## Problem: Why `killall node` breaks everything

When you run `killall node`, it kills **ALL** Node.js processes, including:
- ✅ Metro bundler (mobile app) - **this is what you want**
- ❌ API server - **this breaks the app!**
- ❌ Any other Node processes running on your system

## Solution: Proper Restart Workflow

### Option 1: Use the provided scripts (Recommended)

```bash
# Kill simulator and restart mobile app only
./scripts/restart-dev.sh --kill-simulator

# Or restart without killing simulator
./scripts/restart-dev.sh
```

**Note:** Make sure API server is running in a separate terminal before using this script.

---

### Option 2: Start everything from scratch

```bash
# Start both API and mobile (recommended for first time)
./scripts/start-all.sh
```

This will:
1. Start the API server in the background
2. Wait for it to be ready
3. Start the mobile app

---

### Option 3: Manual control (for advanced users)

#### Terminal 1: API Server
```bash
cd /Users/alican/projects/womens_wellness
pnpm --filter @wellness/api dev
```
Keep this terminal running. Don't kill it.

#### Terminal 2: Mobile App
```bash
cd /Users/alican/projects/womens_wellness
pnpm --filter @wellness/mobile start --ios
```

To restart just the mobile app:
```bash
# Kill only Metro/Expo processes, NOT the API server
pkill -f "expo start"
pkill -f "metro"
killall Simulator  # Optional: if you want to restart the simulator

# Then restart mobile
pnpm --filter @wellness/mobile start --ios
```

---

## Quick Reload (Fastest)

If the app is already running and you just want to reload:

1. **In the simulator:** Press `Cmd + R`
2. **In the Metro terminal:** Press `r`
3. **Via dev menu:** Shake simulator (Ctrl + Cmd + Z) → Tap "Reload"

---

## Troubleshooting

### "Network request failed" errors

**Cause:** API server is not running or not accessible.

**Solution:**
```bash
# Check if API is running
curl http://localhost:4000/healthz

# If no response, start the API server
pnpm --filter @wellness/api dev
```

### App redirects to home without login

**Cause:** Old auth tokens in storage that are now invalid.

**Solution:** This is now fixed automatically. The app will:
1. Validate stored tokens on startup
2. Clear invalid tokens automatically
3. Redirect to login if tokens are invalid

To manually clear auth storage during development:
- Shake simulator → Dev Menu → "Settings" → Clear auth data
- Or reinstall the app

### Port 4000 already in use

**Cause:** Another API server process is already running.

**Solution:**
```bash
# Find the process
lsof -i :4000

# Kill it
kill -9 <PID>

# Or kill all node processes (WARNING: kills everything)
killall node
```

---

## Best Practices

1. **Keep API server running** in a dedicated terminal window
2. **Only restart mobile app** when needed (via scripts or Metro commands)
3. **Use `Cmd + R`** for quick reloads instead of full restarts
4. **Check API health** before debugging mobile issues: `curl http://localhost:4000/healthz`

---

## Common Commands Reference

```bash
# Start everything
./scripts/start-all.sh

# Restart just mobile app
./scripts/restart-dev.sh

# Restart mobile + simulator
./scripts/restart-dev.sh --kill-simulator

# Check API status
curl http://localhost:4000/healthz

# View API logs (if started via start-all.sh)
tail -f /tmp/wellness-api.log

# Manual reload in Metro
# Press 'r' in the terminal running the mobile app
```
