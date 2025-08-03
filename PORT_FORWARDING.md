# Port Forwarding Guide for PhysioCheck

This guide explains how to configure port forwarding for the PhysioCheck assessment system to make it accessible from external devices and networks.

## 🚀 Quick Start

### Option 1: Using the Startup Script (Recommended)
```bash
# Make the script executable (if not already done)
chmod +x start-server.sh

# Start with network access
./start-server.sh
```

### Option 2: Using npm Scripts
```bash
# For local development (localhost only)
npm run start:local

# For network access (accessible from other devices)
npm run start:network

# For production
npm run start:prod

# For development with custom settings
npm run dev
```

### Option 3: Manual Configuration
```bash
# Set environment variables and start
PORT=3001 HOST=0.0.0.0 NODE_ENV=development npm start
```

## 🌐 Access URLs

Once the server is running with network access, you can access it via:

- **Local Machine**: `http://localhost:3001`
- **Same Network**: `http://YOUR_IP_ADDRESS:3001`
- **Admin Dashboard**: `http://YOUR_IP_ADDRESS:3001/admin`

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port number |
| `HOST` | `0.0.0.0` | Server host (0.0.0.0 = all interfaces) |
| `NODE_ENV` | `development` | Environment mode |

### Server Configuration File

Edit `config/server-config.json` to customize server settings:

```json
{
  "server": {
    "port": 3001,
    "host": "0.0.0.0",
    "environment": "development"
  }
}
```

## 🔍 Finding Your IP Address

### On macOS/Linux:
```bash
# Get your local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or use
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
```

### On Windows:
```cmd
ipconfig
```

Look for your local IP address (usually starts with 192.168.x.x or 10.x.x.x).

## 🔒 Security Considerations

### Development Environment
- CORS is configured to allow all origins
- Suitable for local development and testing

### Production Environment
- Update CORS origins in `src/index.ts`
- Replace `yourdomain.com` with your actual domain
- Consider using HTTPS
- Implement proper authentication if needed

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3002 npm start
```

### Can't Access from Other Devices

1. **Check Firewall Settings**
   ```bash
   # macOS - allow incoming connections
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   
   # Linux - open port
   sudo ufw allow 3001
   
   # Windows - add firewall rule
   netsh advfirewall firewall add rule name="PhysioCheck" dir=in action=allow protocol=TCP localport=3001
   ```

2. **Check Network Configuration**
   - Ensure devices are on the same network
   - Try accessing via IP address instead of hostname
   - Check router settings if needed

3. **Verify Server is Running**
   ```bash
   # Check if server is listening on all interfaces
   netstat -an | grep 3001
   ```

### CORS Issues
If you see CORS errors in the browser console:

1. Check the CORS configuration in `src/index.ts`
2. Ensure the correct origin is allowed
3. For development, set `NODE_ENV=development`

## 🌍 External Access (Internet)

To make your PhysioCheck server accessible from the internet:

### Option 1: Port Forwarding (Router)
1. Access your router's admin panel
2. Find port forwarding settings
3. Forward external port 80/443 to internal port 3001
4. Configure your domain DNS to point to your public IP

### Option 2: Cloud Deployment
Deploy to cloud platforms like:
- **Heroku**: `heroku create && git push heroku main`
- **Vercel**: `vercel --prod`
- **Railway**: `railway up`
- **DigitalOcean**: Use App Platform or Droplets

### Option 3: Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📱 Mobile Access

To access PhysioCheck from mobile devices:

1. Ensure your phone is on the same WiFi network
2. Use your computer's IP address: `http://YOUR_IP:3001`
3. The responsive design will automatically adapt to mobile screens

## 🔄 Restarting the Server

After making configuration changes:

```bash
# Stop the server (Ctrl+C)
# Then restart with new settings
npm run start:network
```

## 📊 Monitoring

Check server status:
```bash
# Health check
curl http://localhost:3001/api/health

# Check if server is responding
curl http://localhost:3001/api/config
```

## 🆘 Getting Help

If you're still having issues:

1. Check the server logs for error messages
2. Verify your network configuration
3. Test with a simple HTTP server first
4. Check if your antivirus/firewall is blocking the connection

## 📝 Example Configurations

### Local Development Only
```bash
HOST=localhost PORT=3001 npm start
```

### Network Access for Testing
```bash
HOST=0.0.0.0 PORT=3001 NODE_ENV=development npm start
```

### Production Ready
```bash
HOST=0.0.0.0 PORT=80 NODE_ENV=production npm start
```

---

**Note**: Always ensure you have proper security measures in place when exposing your server to external networks. 