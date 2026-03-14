#!/bin/bash
# ============================================================================
# TraderX Pro — One-Click Setup Script
# ============================================================================
# This script sets up the entire TraderX platform:
#   1. Backend server (Express API + SQLite DB)
#   2. Telegram bot connection
#   3. Next.js dashboard
#   4. Chrome extension preparation
#
# Usage:
#   chmod +x setup.sh && ./setup.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Helpers
print_header() {
    echo ""
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "  ${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "  ${RED}✗${NC} $1"
}

print_info() {
    echo -e "  ${BLUE}ℹ${NC} $1"
}

# ============================================================================
# BANNER
# ============================================================================

clear
echo -e "${CYAN}"
echo '  ████████╗██████╗  █████╗ ██████╗ ███████╗██████╗ ██╗  ██╗'
echo '  ╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗╚██╗██╔╝'
echo '     ██║   ██████╔╝███████║██║  ██║█████╗  ██████╔╝ ╚███╔╝ '
echo '     ██║   ██╔══██╗██╔══██║██║  ██║██╔══╝  ██╔══██╗ ██╔██╗ '
echo '     ██║   ██║  ██║██║  ██║██████╔╝███████╗██║  ██║██╔╝ ██╗'
echo '     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝'
echo -e "${NC}"
echo -e "  ${BOLD}One-Click Setup — AI-Powered Trading Intelligence${NC}"
echo ""

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

print_header "Pre-Flight Checks"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_step "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Install it from https://nodejs.org (v18+)"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_step "npm found: v$NPM_VERSION"
else
    print_error "npm not found."
    exit 1
fi

# Check we're in the right directory
if [ ! -f "manifest.json" ]; then
    print_error "Run this script from the trader-x-extension root directory."
    echo -e "  ${BLUE}cd /path/to/trader-x-extension && ./setup.sh${NC}"
    exit 1
fi
print_step "Project root detected"

# ============================================================================
# STEP 1: SETUP MODE SELECTION
# ============================================================================

print_header "What would you like to set up?"

echo ""
echo -e "  ${BOLD}[1]${NC} Full setup (Server + Telegram Bot + Dashboard)"
echo -e "  ${BOLD}[2]${NC} Server + Telegram Bot only"
echo -e "  ${BOLD}[3]${NC} Dashboard only"
echo -e "  ${BOLD}[4]${NC} Chrome Extension only (prepare for Web Store)"
echo ""
read -p "  Choose [1-4] (default: 1): " SETUP_MODE
SETUP_MODE=${SETUP_MODE:-1}

# ============================================================================
# STEP 2: TELEGRAM BOT SETUP (if needed)
# ============================================================================

TELEGRAM_TOKEN=""

if [[ "$SETUP_MODE" == "1" || "$SETUP_MODE" == "2" ]]; then
    print_header "Telegram Bot Setup (2 clicks!)"

    echo ""
    echo -e "  ${BOLD}To create your Telegram bot:${NC}"
    echo ""
    echo -e "  ${CYAN}Click 1:${NC} Open Telegram and search for ${BOLD}@BotFather${NC}"
    echo -e "           or click: ${BLUE}https://t.me/BotFather${NC}"
    echo ""
    echo -e "  ${CYAN}Click 2:${NC} Send the command: ${BOLD}/newbot${NC}"
    echo -e "           → Give it a name (e.g., 'TraderX Pro')"
    echo -e "           → Give it a username (e.g., 'traderx_pro_bot')"
    echo -e "           → BotFather will send you a ${BOLD}token${NC}"
    echo ""
    echo -e "  ${YELLOW}The token looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz${NC}"
    echo ""

    read -p "  Paste your Telegram Bot Token (or press Enter to skip): " TELEGRAM_TOKEN

    if [ -n "$TELEGRAM_TOKEN" ]; then
        print_step "Telegram token saved"
    else
        print_warn "Skipped — you can add it later in traderx-server/.env"
    fi
fi

# ============================================================================
# STEP 3: OPTIONAL API KEYS
# ============================================================================

OPENAI_KEY=""
DISCORD_TOKEN=""

if [[ "$SETUP_MODE" == "1" || "$SETUP_MODE" == "2" ]]; then
    print_header "Optional API Keys"

    echo ""
    echo -e "  These are ${BOLD}optional${NC} — the server works without them."
    echo ""

    read -p "  OpenAI API Key (for AI digests, or Enter to skip): " OPENAI_KEY
    read -p "  Discord Bot Token (or Enter to skip): " DISCORD_TOKEN

    [ -n "$OPENAI_KEY" ] && print_step "OpenAI key saved" || print_info "Skipped OpenAI"
    [ -n "$DISCORD_TOKEN" ] && print_step "Discord token saved" || print_info "Skipped Discord"
fi

# ============================================================================
# STEP 4: INSTALL SERVER DEPENDENCIES
# ============================================================================

if [[ "$SETUP_MODE" == "1" || "$SETUP_MODE" == "2" ]]; then
    print_header "Setting Up Backend Server"

    echo -e "  Installing dependencies..."
    cd traderx-server
    npm install --silent 2>&1 | tail -1
    print_step "Dependencies installed"

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "traderx_$(date +%s)_$(od -An -N8 -tx1 /dev/urandom | tr -d ' ')")
    API_KEY_SALT=$(openssl rand -hex 16 2>/dev/null || echo "salt_$(date +%s)")

    # Create .env file
    cat > .env << ENVFILE
# ============================================================================
# TraderX Server — Environment Configuration
# Generated by setup.sh on $(date)
# ============================================================================

# Server
PORT=3001
NODE_ENV=development

# Database (SQLite — zero config!)
DB_PATH=./data/traderx.db

# Authentication
JWT_SECRET=$JWT_SECRET
API_KEY_SALT=$API_KEY_SALT

# Telegram Bot
TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN

# Discord Bot
DISCORD_BOT_TOKEN=$DISCORD_TOKEN
DISCORD_GUILD_ID=
DISCORD_ALERT_CHANNEL_ID=

# Twitter / X API (optional — works in demo mode without)
TWITTER_BEARER_TOKEN=
TWITTER_API_KEY=
TWITTER_API_SECRET=

# Price APIs (free, no key needed)
COINGECKO_API_KEY=demo
YAHOO_FINANCE_PROXY=https://query1.finance.yahoo.com

# OpenAI (optional — for AI digests/copilot)
OPENAI_API_KEY=$OPENAI_KEY
OPENAI_MODEL=gpt-4o-mini

# Stripe (add when ready for payments)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=

# Redis (optional — set USE_REDIS=true if running Redis)
REDIS_URL=redis://localhost:6379
USE_REDIS=false

# Frontend
FRONTEND_URL=http://localhost:3000
ENVFILE

    print_step ".env file created with secure random secrets"

    # Setup database
    echo -e "  Setting up database..."
    npm run setup-db 2>&1 | tail -1
    print_step "SQLite database initialized"

    # Seed data
    echo -e "  Seeding initial data..."
    npm run seed 2>&1 | tail -1
    print_step "Database seeded"

    cd ..
fi

# ============================================================================
# STEP 5: INSTALL DASHBOARD DEPENDENCIES
# ============================================================================

if [[ "$SETUP_MODE" == "1" || "$SETUP_MODE" == "3" ]]; then
    print_header "Setting Up Dashboard"

    cd traderx-dashboard
    echo -e "  Installing dependencies..."
    npm install --silent 2>&1 | tail -1
    print_step "Next.js dashboard dependencies installed"
    cd ..
fi

# ============================================================================
# STEP 6: CHROME EXTENSION PREPARATION
# ============================================================================

if [[ "$SETUP_MODE" == "4" ]]; then
    print_header "Chrome Extension — Web Store Preparation"

    # Check for required icons
    MISSING_ICONS=0
    for size in 16 48 128; do
        if [ ! -f "assets/icons/icon-${size}.png" ]; then
            print_error "Missing: assets/icons/icon-${size}.png"
            MISSING_ICONS=1
        else
            print_step "Found: assets/icons/icon-${size}.png"
        fi
    done

    if [ "$MISSING_ICONS" -eq 1 ]; then
        print_warn "Some icons are missing — you'll need them for the Chrome Web Store."
    fi

    # Create the zip for upload
    echo -e "  Creating extension package..."

    ZIP_NAME="traderx-pro-v$(grep '"version"' manifest.json | head -1 | sed 's/[^0-9.]//g').zip"

    # Files to include (exclude server, dashboard, git, etc.)
    zip -r "$ZIP_NAME" \
        manifest.json \
        background.js \
        popup.html \
        popup.js \
        suggested.js \
        utils.js \
        accounts.json \
        content/ \
        settings/ \
        icons/ \
        assets/icons/ \
        -x "*.DS_Store" "*.git*" "node_modules/*" 2>/dev/null

    print_step "Extension packaged: $ZIP_NAME ($(du -h "$ZIP_NAME" | cut -f1))"
    echo ""
    echo -e "  ${BOLD}Upload this file to the Chrome Web Store:${NC}"
    echo -e "  ${BLUE}https://chrome.google.com/webstore/devconsole${NC}"
fi

# ============================================================================
# STEP 7: LAUNCH!
# ============================================================================

print_header "Setup Complete! 🎉"

echo ""

if [[ "$SETUP_MODE" == "1" || "$SETUP_MODE" == "2" ]]; then
    echo -e "  ${BOLD}Start the backend server:${NC}"
    echo -e "  ${CYAN}cd traderx-server && npm run dev${NC}"
    echo -e "  → API:  ${BLUE}http://localhost:3001${NC}"
    if [ -n "$TELEGRAM_TOKEN" ]; then
        echo -e "  → Bot:  ${BLUE}https://t.me/YOUR_BOT_USERNAME${NC}"
    fi
    echo ""
fi

if [[ "$SETUP_MODE" == "1" || "$SETUP_MODE" == "3" ]]; then
    echo -e "  ${BOLD}Start the dashboard:${NC}"
    echo -e "  ${CYAN}cd traderx-dashboard && npm run dev${NC}"
    echo -e "  → Web:  ${BLUE}http://localhost:3000${NC}"
    echo ""
fi

echo -e "  ${BOLD}Load the Chrome Extension:${NC}"
echo -e "  ${CYAN}1. Open chrome://extensions/${NC}"
echo -e "  ${CYAN}2. Enable 'Developer mode'${NC}"
echo -e "  ${CYAN}3. Click 'Load unpacked' → select this folder${NC}"
echo -e "  ${CYAN}4. Visit https://x.com — sidebar appears!${NC}"
echo ""

if [ -n "$TELEGRAM_TOKEN" ]; then
    echo -e "  ${BOLD}Test your Telegram bot:${NC}"
    echo -e "  ${CYAN}1. Start the server: cd traderx-server && npm run dev${NC}"
    echo -e "  ${CYAN}2. Open your bot in Telegram${NC}"
    echo -e "  ${CYAN}3. Send /start — you should get a welcome message!${NC}"
    echo ""
fi

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${BOLD}Quick Launch (both servers):${NC}"
echo ""
echo -e "  ${CYAN}# Terminal 1 — Backend${NC}"
echo -e "  cd traderx-server && npm run dev"
echo ""
echo -e "  ${CYAN}# Terminal 2 — Dashboard${NC}"
echo -e "  cd traderx-dashboard && npm run dev"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}Need help?${NC} Check the docs: ${BLUE}http://localhost:3000/docs${NC}"
echo ""
