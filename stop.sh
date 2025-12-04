#!/bin/bash
# ============================================
# BrainTestStudio - Docker Stop Script
# ============================================

echo "🛑 BrainTestStudio wird gestoppt..."
docker compose down

echo ""
echo "✅ Alle Container wurden gestoppt."
echo ""
echo "💡 Hinweis: Die Daten in docker-data/ bleiben erhalten."
echo "   Zum vollständigen Löschen: rm -rf docker-data/"
