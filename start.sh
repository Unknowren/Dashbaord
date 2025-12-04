#!/bin/bash
# ============================================
# BrainTestStudio - Docker Start Script
# ============================================

set -e

echo "🚀 BrainTestStudio wird gestartet..."
echo ""

# Prüfen ob .env existiert
if [ ! -f ".env" ]; then
    echo "❌ Fehler: .env Datei nicht gefunden!"
    echo "📋 Bitte kopiere .env.example zu .env und passe die Werte an:"
    echo "   cp .env.example .env"
    exit 1
fi

# Docker-Data Verzeichnisse erstellen
echo "📁 Erstelle Datenverzeichnisse..."
mkdir -p docker-data/postgres
mkdir -p docker-data/n8n
mkdir -p docker-data/supabase-storage

# Docker Compose starten
echo "🐳 Starte Docker Container..."
docker compose up -d --build

echo ""
echo "✅ BrainTestStudio wurde erfolgreich gestartet!"
echo ""
echo "🌐 Zugriff auf die Services:"
echo "   Frontend:        http://localhost:3000"
echo "   N8N:             http://localhost:5678"
echo "   Supabase Studio: http://localhost:3001"
echo "   Supabase API:    http://localhost:8000"
echo ""
echo "📊 Container Status:"
docker compose ps
echo ""
echo "📝 Logs anzeigen mit: docker compose logs -f"
echo "🛑 Stoppen mit: docker compose down"
