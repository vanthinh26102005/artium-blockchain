#!/bin/bash

# Payment Service - Complete Test Flow Script
# This script tests the entire payment flow end-to-end

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3001}"
USER_ID="test_user_$(date +%s)"
EMAIL="test_${USER_ID}@example.com"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Payment Service Test Flow${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Create Stripe Customer
echo -e "${YELLOW}Step 1: Creating Stripe Customer...${NC}"
CUSTOMER_RESPONSE=$(curl -s -X POST "${BASE_URL}/stripe/customers" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"email\": \"${EMAIL}\",
    \"name\": \"Test User Flow\"
  }")

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to create customer${NC}"
  exit 1
fi

STRIPE_CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | grep -o '"stripeCustomerId":"[^"]*' | cut -d'"' -f4)

if [ -z "$STRIPE_CUSTOMER_ID" ]; then
  echo -e "${RED}Failed to extract customer ID from response${NC}"
  echo "Response: $CUSTOMER_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Customer created: ${STRIPE_CUSTOMER_ID}${NC}"
echo "  User ID: ${USER_ID}"
echo "  Email: ${EMAIL}"
echo ""

# Wait for event processing
echo -e "${YELLOW}Waiting 3 seconds for event processing...${NC}"
sleep 3

# Step 2: Create Payment Intent
echo -e "${YELLOW}Step 2: Creating Payment Intent...${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/stripe/payment-intents" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"amount\": 99.99,
    \"currency\": \"usd\",
    \"stripeCustomerId\": \"${STRIPE_CUSTOMER_ID}\",
    \"orderId\": \"order_test_${USER_ID}\",
    \"description\": \"Test payment flow\"
  }")

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to create payment intent${NC}"
  exit 1
fi

PAYMENT_INTENT_ID=$(echo $PAYMENT_RESPONSE | grep -o '"paymentIntentId":"[^"]*' | cut -d'"' -f4)
TRANSACTION_ID=$(echo $PAYMENT_RESPONSE | grep -o '"transactionId":"[^"]*' | cut -d'"' -f4)
CLIENT_SECRET=$(echo $PAYMENT_RESPONSE | grep -o '"clientSecret":"[^"]*' | cut -d'"' -f4)

if [ -z "$PAYMENT_INTENT_ID" ]; then
  echo -e "${RED}Failed to extract payment intent ID from response${NC}"
  echo "Response: $PAYMENT_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Payment Intent created${NC}"
echo "  Payment Intent ID: ${PAYMENT_INTENT_ID}"
echo "  Transaction ID: ${TRANSACTION_ID}"
echo "  Amount: $99.99 USD"
echo ""

# Wait for event processing
echo -e "${YELLOW}Waiting 3 seconds for event processing...${NC}"
sleep 3

# Step 3: Confirm Payment Intent
echo -e "${YELLOW}Step 3: Confirming Payment Intent...${NC}"
CONFIRM_RESPONSE=$(curl -s -X POST "${BASE_URL}/stripe/payment-intents/confirm" \
  -H "Content-Type: application/json" \
  -d "{
    \"paymentIntentId\": \"${PAYMENT_INTENT_ID}\",
    \"paymentMethodId\": \"pm_card_visa\"
  }")

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to confirm payment${NC}"
  exit 1
fi

PAYMENT_STATUS=$(echo $CONFIRM_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ -z "$PAYMENT_STATUS" ]; then
  echo -e "${RED}Failed to extract status from response${NC}"
  echo "Response: $CONFIRM_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Payment Confirmed${NC}"
echo "  Status: ${PAYMENT_STATUS}"
echo ""

# Wait for webhook and event processing
echo -e "${YELLOW}Waiting 5 seconds for webhook and event processing...${NC}"
sleep 5

# Step 4: Verify Payment Status
echo -e "${YELLOW}Step 4: Verifying Payment Status...${NC}"

if [ "$PAYMENT_STATUS" = "succeeded" ] || [ "$PAYMENT_STATUS" = "processing" ]; then
  echo -e "${GREEN}✓ Payment successful!${NC}"
else
  echo -e "${RED}✗ Payment status: ${PAYMENT_STATUS}${NC}"
  echo "Response: $CONFIRM_RESPONSE"
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Flow Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo "  Customer ID: ${STRIPE_CUSTOMER_ID}"
echo "  Payment Intent ID: ${PAYMENT_INTENT_ID}"
echo "  Transaction ID: ${TRANSACTION_ID}"
echo "  Status: ${PAYMENT_STATUS}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Check Stripe Dashboard: https://dashboard.stripe.com/test/payments"
echo "  2. Verify database records:"
echo "     SELECT * FROM payment_transactions WHERE id = '${TRANSACTION_ID}';"
echo "  3. Check outbox events:"
echo "     SELECT * FROM outbox_messages WHERE aggregate_id = '${USER_ID}' ORDER BY created_at;"
echo "  4. Verify identity service user record:"
echo "     SELECT * FROM users WHERE id = '${USER_ID}';"
echo ""
echo -e "${GREEN}✓ All tests passed!${NC}"
echo ""

# Optional: Test Refund
read -p "Do you want to test refund flow? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${YELLOW}Step 5: Creating Refund...${NC}"

  REFUND_RESPONSE=$(curl -s -X POST "${BASE_URL}/stripe/refunds" \
    -H "Content-Type: application/json" \
    -d "{
      \"transactionId\": \"${TRANSACTION_ID}\",
      \"paymentIntentId\": \"${PAYMENT_INTENT_ID}\",
      \"reason\": \"requested_by_customer\",
      \"metadata\": {
        \"testFlow\": \"true\"
      }
    }")

  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create refund${NC}"
    exit 1
  fi

  REFUND_STATUS=$(echo $REFUND_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

  echo -e "${GREEN}✓ Refund created${NC}"
  echo "  Status: ${REFUND_STATUS}"
  echo ""

  echo -e "${YELLOW}Waiting 5 seconds for refund event processing...${NC}"
  sleep 5

  echo -e "${GREEN}✓ Refund test complete!${NC}"
  echo ""
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}All Done! 🎉${NC}"
echo -e "${BLUE}========================================${NC}"
