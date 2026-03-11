#!/bin/bash

echo "🚀 LabBuddy Production Monitoring Deployment Guide"
echo "================================================"
echo

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Please run this script from the labbuddy-backend directory"
    exit 1
fi

echo "📋 Pre-deployment Checklist:"
echo "✅ 1. Grafana Cloud account created"
echo "✅ 2. Remote write endpoint obtained"
echo "✅ 3. Environment variables added to Render"
echo "✅ 4. Code changes applied"
echo

echo "🔧 Required Environment Variables in Render:"
echo "PROMETHEUS_REMOTE_WRITE=true"
echo "GRAFANA_CLOUD_ENDPOINT=https://prometheus-prod-xx-prod-xx-xx.grafana.net/api/prom/push"
echo "GRAFANA_CLOUD_USERNAME=123456"
echo "GRAFANA_CLOUD_PASSWORD=glc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo

echo "📦 Next Steps:"
echo "1. Commit and push these changes to your repository"
echo "2. Wait for Render deployment to complete"
echo "3. Check Render logs for 'Grafana Cloud remote write enabled' message"
echo "4. Verify metrics in your Grafana Cloud dashboard"
echo

echo "🔍 Verification Commands (run after deployment):"
echo "# Check if your backend is exposing metrics:"
echo "curl https://your-render-app.onrender.com/metrics"
echo
echo "# Check backend health:"
echo "curl https://your-render-app.onrender.com/api/health"
echo

echo "🏁 Deployment Commands:"
echo "git add ."
echo "git commit -m 'Add Grafana Cloud monitoring integration'"
echo "git push origin main"
