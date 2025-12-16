#!/bin/bash

# ================================================
# SRMK Oil Mill - Production Status Checker
# Quick diagnostic script to check API health
# ================================================

echo "🔍 ===== PRODUCTION STATUS CHECK ====="
echo ""

# Get your production domain
echo "Enter your Vercel domain (e.g., yoursite.vercel.app):"
read DOMAIN

if [ -z "$DOMAIN" ]; then
  echo "❌ Domain is required!"
  exit 1
fi

BASE_URL="https://$DOMAIN"

echo ""
echo "🌐 Testing: $BASE_URL"
echo "================================================"
echo ""

# Test 1: Products API (Public)
echo "1️⃣  Testing Products API..."
PRODUCTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/products")
if [ "$PRODUCTS_RESPONSE" = "200" ]; then
  PRODUCT_COUNT=$(curl -s "$BASE_URL/api/products" | jq '. | length' 2>/dev/null || echo "unknown")
  echo "   ✅ Products API: OK (Status: $PRODUCTS_RESPONSE)"
  echo "   📦 Products found: $PRODUCT_COUNT"
else
  echo "   ❌ Products API: FAILED (Status: $PRODUCTS_RESPONSE)"
fi
echo ""

# Test 2: Admin Orders API (Protected)
echo "2️⃣  Testing Admin Orders API..."
ORDERS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/orders")
if [ "$ORDERS_RESPONSE" = "401" ]; then
  echo "   ✅ Admin Orders API: OK (Status: $ORDERS_RESPONSE - Auth required, as expected)"
elif [ "$ORDERS_RESPONSE" = "200" ]; then
  echo "   ✅ Admin Orders API: OK (Status: $ORDERS_RESPONSE - Authenticated)"
else
  echo "   ❌ Admin Orders API: FAILED (Status: $ORDERS_RESPONSE)"
fi
echo ""

# Test 3: Delivery Users API (Protected)
echo "3️⃣  Testing Delivery Users API..."
DELIVERY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/delivery-users")
if [ "$DELIVERY_RESPONSE" = "401" ]; then
  echo "   ✅ Delivery Users API: OK (Status: $DELIVERY_RESPONSE - Auth required, as expected)"
elif [ "$DELIVERY_RESPONSE" = "200" ]; then
  echo "   ✅ Delivery Users API: OK (Status: $DELIVERY_RESPONSE - Authenticated)"
else
  echo "   ❌ Delivery Users API: FAILED (Status: $DELIVERY_RESPONSE)"
fi
echo ""

# Test 4: Products Page (Frontend)
echo "4️⃣  Testing Products Page..."
PRODUCTS_PAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/products")
if [ "$PRODUCTS_PAGE_RESPONSE" = "200" ]; then
  echo "   ✅ Products Page: OK (Status: $PRODUCTS_PAGE_RESPONSE)"
else
  echo "   ❌ Products Page: FAILED (Status: $PRODUCTS_PAGE_RESPONSE)"
fi
echo ""

# Test 5: Admin Dashboard (Frontend)
echo "5️⃣  Testing Admin Dashboard..."
ADMIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/dashboard")
if [ "$ADMIN_RESPONSE" = "200" ]; then
  echo "   ✅ Admin Dashboard: OK (Status: $ADMIN_RESPONSE)"
else
  echo "   ❌ Admin Dashboard: FAILED (Status: $ADMIN_RESPONSE)"
fi
echo ""

# Summary
echo "================================================"
echo "📊 SUMMARY"
echo "================================================"

# Count successes
SUCCESS_COUNT=0
if [ "$PRODUCTS_RESPONSE" = "200" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT+1)); fi
if [ "$ORDERS_RESPONSE" = "401" ] || [ "$ORDERS_RESPONSE" = "200" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT+1)); fi
if [ "$DELIVERY_RESPONSE" = "401" ] || [ "$DELIVERY_RESPONSE" = "200" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT+1)); fi
if [ "$PRODUCTS_PAGE_RESPONSE" = "200" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT+1)); fi
if [ "$ADMIN_RESPONSE" = "200" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT+1)); fi

echo "✅ Passed: $SUCCESS_COUNT/5 tests"
echo ""

if [ "$SUCCESS_COUNT" -eq 5 ]; then
  echo "🎉 All systems operational!"
elif [ "$SUCCESS_COUNT" -ge 3 ]; then
  echo "⚠️  Some issues detected. Check failures above."
else
  echo "❌ Critical issues! Multiple services are down."
  echo ""
  echo "Common fixes:"
  echo "  1. Check DATABASE_URL in Vercel (use port 6543 with pgbouncer)"
  echo "  2. Import products: npx tsx scripts/import-products-to-production.ts"
  echo "  3. Check Vercel function logs for errors"
fi

echo ""
echo "📖 For detailed fix instructions, see:"
echo "   PRODUCTION_500_ERROR_FIX.md"
echo ""

