# 🚀 Quick Deployment Checklist

## Immediate Actions (Today)

### Frontend (Amplify)
- [ ] **Deploy optimized Next.js config** ✅
  - Bundle splitting enabled
  - Image optimization configured
  - Caching headers added
- [ ] **Install React Query** ✅
  - API caching implemented
  - Optimistic updates ready
- [ ] **Deploy amplify.yml** ✅
  - Build caching configured
  - Custom headers set
- [ ] **Set environment variables in Amplify Console**
  ```bash
  NEXT_PUBLIC_API_URL=https://your-ec2-instance.com/api
  NODE_ENV=production
  ```

### Backend (EC2)
- [ ] **Run Nginx setup script**
  ```bash
  chmod +x deployment/optimization-scripts/setup-nginx.sh
  ./deployment/optimization-scripts/setup-nginx.sh
  ```
- [ ] **Run PM2 setup script**
  ```bash
  chmod +x deployment/optimization-scripts/setup-pm2.sh
  ./deployment/optimization-scripts/setup-pm2.sh
  ```
- [ ] **Run Redis setup script**
  ```bash
  chmod +x deployment/optimization-scripts/setup-redis.sh
  ./deployment/optimization-scripts/setup-redis.sh
  ```
- [ ] **Add database indexes**
  ```sql
  -- Add to your MongoDB collections
  db.products.createIndex({ "categoryId": 1 })
  db.products.createIndex({ "price": 1 })
  db.products.createIndex({ "createdAt": -1 })
  db.orders.createIndex({ "userId": 1 })
  db.orders.createIndex({ "status": 1 })
  ```

## This Week

### Infrastructure
- [ ] **Set up CloudFront distribution**
  - Origin: Your EC2 instance
  - Cache policy: CachingOptimized
  - Price class: Use only North America and Europe
- [ ] **Configure S3 for static assets**
  - Create bucket for images
  - Set up CloudFront origin
  - Configure CORS
- [ ] **Set up SSL certificates**
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d your-domain.com
  ```

### Monitoring
- [ ] **Set up CloudWatch monitoring**
  - CPU utilization
  - Memory usage
  - Network traffic
  - Application logs
- [ ] **Configure alerts**
  - High CPU usage (>80%)
  - High memory usage (>85%)
  - API response time (>2s)
  - Error rate (>5%)

## Performance Testing

### Before Optimization
- [ ] Record current metrics:
  - API response times
  - Page load times
  - Database query times
  - Memory usage

### After Optimization
- [ ] Test and compare:
  - API response times (should be <500ms)
  - Page load times (should be 50% faster)
  - Database load (should be 80% reduced)
  - Cache hit rates (>90%)

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API Response Time | 6-21s | 200-500ms | 95% faster |
| Page Load Time | 3-5s | 1-2s | 60% faster |
| Database Queries | 100% | 20% | 80% reduction |
| Static Assets | Direct | CDN | 90% faster |

## Troubleshooting

### Common Issues
1. **Redis connection failed**
   - Check if Redis is running: `sudo systemctl status redis-server`
   - Verify port 6379 is open: `netstat -tlnp | grep 6379`

2. **PM2 not starting**
   - Check logs: `pm2 logs`
   - Verify build: `npm run build`
   - Check memory: `pm2 monit`

3. **Nginx errors**
   - Test config: `sudo nginx -t`
   - Check logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify ports: `sudo netstat -tlnp | grep :80`

4. **Amplify build fails**
   - Check build logs in Amplify Console
   - Verify amplify.yml syntax
   - Check environment variables

## Next Steps

After completing this checklist:
1. Monitor performance for 24-48 hours
2. Adjust cache TTL values based on usage patterns
3. Implement advanced caching strategies
4. Set up automated performance testing
5. Plan for auto-scaling configuration

## Support

If you encounter issues:
1. Check the detailed optimization guide: `PERFORMANCE_OPTIMIZATION_GUIDE.md`
2. Review deployment scripts in `deployment/optimization-scripts/`
3. Monitor application logs for errors
4. Test each component individually

**Remember**: Start with Phase 1 optimizations first, then move to Phase 2 and 3 as needed. 