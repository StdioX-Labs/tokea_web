#!/bin/bash

# GitHub Actions Setup Script for Core Deployment
# This script helps you configure the required secrets for automated deployment

set -e

echo "=============================================="
echo "🔧 GitHub Actions Setup for Core Deployment"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed.${NC}"
    echo ""
    echo "Install it with:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    echo ""
    echo "Or visit: https://cli.github.com/"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to GitHub CLI${NC}"
    echo ""
    read -p "Would you like to login now? (yes/no): " LOGIN_NOW
    if [ "$LOGIN_NOW" = "yes" ]; then
        gh auth login
    else
        echo -e "${RED}Please run 'gh auth login' first${NC}"
        exit 1
    fi
fi

echo ""
echo "=============================================="
echo "📋 Required Secrets"
echo "=============================================="
echo ""
echo "1. VULTR_REGISTRY_USERNAME - Vultr container registry username"
echo "2. VULTR_REGISTRY_PASSWORD - Vultr container registry password"
echo "3. KUBECONFIG - Base64 encoded Kubernetes config"
echo ""

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")

if [ -z "$REPO" ]; then
    echo -e "${RED}❌ Not in a GitHub repository${NC}"
    exit 1
fi

echo "Repository: ${GREEN}${REPO}${NC}"
echo ""

read -p "Do you want to continue with setup? (yes/no): " CONTINUE
if [ "$CONTINUE" != "yes" ]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "=============================================="
echo "🔑 Setting up secrets"
echo "=============================================="
echo ""

# 1. Vultr Registry Username
echo "1️⃣ Vultr Registry Username"
read -p "Enter VULTR_REGISTRY_USERNAME: " VULTR_USERNAME
if [ -n "$VULTR_USERNAME" ]; then
    echo "$VULTR_USERNAME" | gh secret set VULTR_REGISTRY_USERNAME
    echo -e "${GREEN}✅ VULTR_REGISTRY_USERNAME set${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
fi

echo ""

# 2. Vultr Registry Password
echo "2️⃣ Vultr Registry Password"
read -sp "Enter VULTR_REGISTRY_PASSWORD (hidden): " VULTR_PASSWORD
echo ""
if [ -n "$VULTR_PASSWORD" ]; then
    echo "$VULTR_PASSWORD" | gh secret set VULTR_REGISTRY_PASSWORD
    echo -e "${GREEN}✅ VULTR_REGISTRY_PASSWORD set${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
fi

echo ""

# 3. Kubeconfig
echo "3️⃣ Kubeconfig"
echo ""
echo "This will encode your current kubeconfig (~/.kube/config)"
read -p "Use current kubeconfig? (yes/no): " USE_KUBECONFIG

if [ "$USE_KUBECONFIG" = "yes" ]; then
    if [ -f "$HOME/.kube/config" ]; then
        # Check OS for base64 command
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            KUBECONFIG_ENCODED=$(cat "$HOME/.kube/config" | base64)
        else
            # Linux
            KUBECONFIG_ENCODED=$(cat "$HOME/.kube/config" | base64 -w 0)
        fi
        
        echo "$KUBECONFIG_ENCODED" | gh secret set KUBECONFIG
        echo -e "${GREEN}✅ KUBECONFIG set${NC}"
    else
        echo -e "${RED}❌ Kubeconfig not found at ~/.kube/config${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
fi

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""

# List current secrets
echo "Current secrets in repository:"
gh secret list

echo ""
echo "=============================================="
echo "🚀 Next Steps"
echo "=============================================="
echo ""
echo "1. Verify secrets are set correctly"
echo "2. Make a commit to trigger the workflow:"
echo "   git add ."
echo "   git commit -m 'chore: setup automated deployment'"
echo "   git push origin master"
echo ""
echo "3. Watch the deployment:"
echo "   gh workflow view"
echo "   gh run watch"
echo ""
echo "4. Or visit: https://github.com/${REPO}/actions"
echo ""
echo "=============================================="

