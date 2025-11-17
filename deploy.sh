#!/bin/bash
cd /var/www/lotus-front

echo "🚀 Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "📦 Exporting project..."
npm run export || { echo "❌ Export failed"; exit 1; }

echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

echo "🔄 Restarting lotus-front service..."
sudo systemctl restart lotus-front

echo "✅ Deployment complete!"
