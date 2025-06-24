# 🔧 CORS Troubleshooting Guide

## 🚨 Current CORS Issues

Based on your logs, you're experiencing CORS issues in your local development environment. Here's how to fix them:

## ✅ **Solutions Implemented**

### 1. **Updated CORS Configuration**
- ✅ Added multiple allowed origins for development
- ✅ Configured proper headers and methods
- ✅ Added CORS test endpoint
- ✅ Updated Helmet security settings

### 2. **Allowed Origins**
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000', 
  'http://192.168.1.6:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);
```

### 3. **Enhanced Headers**
```typescript
allowedHeaders: [
  'Content-Type', 
  'Authorization', 
  'X-Requested-With',
  'Accept',
  'Origin',
  'Cache-Control',
  'X-File-Name'
],
```

## 🧪 **Testing CORS Configuration**

### **Step 1: Test with Browser**
1. Open `test-cors.html` in your browser
2. Click "Test Health Endpoint"
3. Check if requests succeed

### **Step 2: Test with cURL**
```bash
# Test health endpoint
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/api/health

# Test actual request
curl -H "Origin: http://localhost:3000" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/health
```

### **Step 3: Check Browser Console**
1. Open browser developer tools
2. Go to Network tab
3. Make a request from your frontend
4. Check for CORS errors

## 🔧 **Quick Fixes**

### **If CORS still fails:**

1. **Restart Backend Server**
```bash
cd cattleya-backend
npm run start:dev
```

2. **Clear Browser Cache**
- Hard refresh (Ctrl+F5)
- Clear browser cache
- Disable browser extensions

3. **Check Environment Variables**
```bash
# In cattleya-backend/.env
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. **Verify Ports**
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## 🐛 **Common CORS Issues**

### **Issue 1: "No 'Access-Control-Allow-Origin' header"**
**Solution**: Backend CORS not configured properly
```typescript
app.enableCors({
  origin: ['http://localhost:3000'],
  credentials: true,
});
```

### **Issue 2: "Credentials not supported"**
**Solution**: Enable credentials in both frontend and backend
```typescript
// Backend
app.enableCors({
  credentials: true,
});

// Frontend
withCredentials: true,
```

### **Issue 3: "Method not allowed"**
**Solution**: Add missing HTTP methods
```typescript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
```

### **Issue 4: "Headers not allowed"**
**Solution**: Add required headers
```typescript
allowedHeaders: [
  'Content-Type', 
  'Authorization', 
  'X-Requested-With',
  'Accept',
  'Origin'
],
```

## 🚀 **Development Workflow**

### **1. Start Backend First**
```bash
cd cattleya-backend
npm run start:dev
```

### **2. Start Frontend**
```bash
cd cattleya-app
npm run dev:fast
```

### **3. Test CORS**
- Open `test-cors.html` in browser
- Check all endpoints work

### **4. Monitor Logs**
- Watch backend console for CORS errors
- Check browser network tab
- Monitor frontend console

## 📊 **Expected Results**

### **Before Fix**
```
❌ CORS error: No 'Access-Control-Allow-Origin' header
❌ Request blocked by browser
❌ API calls failing
```

### **After Fix**
```
✅ CORS headers present
✅ Requests succeed
✅ API calls working
✅ No browser errors
```

## 🔍 **Debugging Steps**

1. **Check Backend Logs**
```bash
# Look for CORS-related errors
npm run start:dev
```

2. **Check Frontend Network Tab**
- Open DevTools → Network
- Look for failed requests
- Check response headers

3. **Test Individual Endpoints**
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/cors-test
```

4. **Verify Environment**
```bash
# Check if backend is running
netstat -an | findstr :3001

# Check if frontend is running  
netstat -an | findstr :3000
```

## 🎯 **Next Steps**

1. **Test the CORS configuration** using the provided test file
2. **Restart both servers** if issues persist
3. **Check browser console** for specific error messages
4. **Verify environment variables** are set correctly

## 📞 **If Issues Persist**

1. Check if MongoDB is running
2. Verify all dependencies are installed
3. Clear all caches (browser, npm, Next.js)
4. Check firewall settings
5. Try different browser/incognito mode

---

 