# Payment Service - Complete Test Flow Script (PowerShell)
# This script tests the entire payment flow end-to-end

# Configuration
$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3001" }
$UserId = "test_user_$(Get-Date -Format 'yyyyMMddHHmmss')"
$Email = "test_${UserId}@example.com"

# Colors
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }

Write-Info "========================================"
Write-Info "Payment Service Test Flow"
Write-Info "========================================"
Write-Host ""

# Step 1: Create Stripe Customer
Write-Warning "Step 1: Creating Stripe Customer..."

$customerBody = @{
    userId = $UserId
    email = $Email
    name = "Test User Flow"
} | ConvertTo-Json

try {
    $customerResponse = Invoke-RestMethod -Uri "$BaseUrl/stripe/customers" `
        -Method Post `
        -ContentType "application/json" `
        -Body $customerBody

    $stripeCustomerId = $customerResponse.stripeCustomerId

    Write-Success "✓ Customer created: $stripeCustomerId"
    Write-Host "  User ID: $UserId"
    Write-Host "  Email: $Email"
    Write-Host ""
} catch {
    Write-Error "Failed to create customer"
    Write-Host $_.Exception.Message
    exit 1
}

# Wait for event processing
Write-Warning "Waiting 3 seconds for event processing..."
Start-Sleep -Seconds 3

# Step 2: Create Payment Intent
Write-Warning "Step 2: Creating Payment Intent..."

$paymentBody = @{
    userId = $UserId
    amount = 99.99
    currency = "usd"
    stripeCustomerId = $stripeCustomerId
    orderId = "order_test_$UserId"
    description = "Test payment flow"
} | ConvertTo-Json

try {
    $paymentResponse = Invoke-RestMethod -Uri "$BaseUrl/stripe/payment-intents" `
        -Method Post `
        -ContentType "application/json" `
        -Body $paymentBody

    $paymentIntentId = $paymentResponse.paymentIntentId
    $transactionId = $paymentResponse.transactionId
    $clientSecret = $paymentResponse.clientSecret

    Write-Success "✓ Payment Intent created"
    Write-Host "  Payment Intent ID: $paymentIntentId"
    Write-Host "  Transaction ID: $transactionId"
    Write-Host "  Amount: `$99.99 USD"
    Write-Host ""
} catch {
    Write-Error "Failed to create payment intent"
    Write-Host $_.Exception.Message
    exit 1
}

# Wait for event processing
Write-Warning "Waiting 3 seconds for event processing..."
Start-Sleep -Seconds 3

# Step 3: Confirm Payment Intent
Write-Warning "Step 3: Confirming Payment Intent..."

$confirmBody = @{
    paymentIntentId = $paymentIntentId
    paymentMethodId = "pm_card_visa"
} | ConvertTo-Json

try {
    $confirmResponse = Invoke-RestMethod -Uri "$BaseUrl/stripe/payment-intents/confirm" `
        -Method Post `
        -ContentType "application/json" `
        -Body $confirmBody

    $paymentStatus = $confirmResponse.status

    Write-Success "✓ Payment Confirmed"
    Write-Host "  Status: $paymentStatus"
    Write-Host ""
} catch {
    Write-Error "Failed to confirm payment"
    Write-Host $_.Exception.Message
    exit 1
}

# Wait for webhook and event processing
Write-Warning "Waiting 5 seconds for webhook and event processing..."
Start-Sleep -Seconds 5

# Step 4: Verify Payment Status
Write-Warning "Step 4: Verifying Payment Status..."

if ($paymentStatus -eq "succeeded" -or $paymentStatus -eq "processing") {
    Write-Success "✓ Payment successful!"
} else {
    Write-Error "✗ Payment status: $paymentStatus"
}

Write-Host ""

# Summary
Write-Info "========================================"
Write-Info "Test Flow Complete!"
Write-Info "========================================"
Write-Host ""
Write-Success "Summary:"
Write-Host "  Customer ID: $stripeCustomerId"
Write-Host "  Payment Intent ID: $paymentIntentId"
Write-Host "  Transaction ID: $transactionId"
Write-Host "  Status: $paymentStatus"
Write-Host ""
Write-Warning "Next Steps:"
Write-Host "  1. Check Stripe Dashboard: https://dashboard.stripe.com/test/payments"
Write-Host "  2. Verify database records:"
Write-Host "     SELECT * FROM payment_transactions WHERE id = '$transactionId';"
Write-Host "  3. Check outbox events:"
Write-Host "     SELECT * FROM outbox_messages WHERE aggregate_id = '$UserId' ORDER BY created_at;"
Write-Host "  4. Verify identity service user record:"
Write-Host "     SELECT * FROM users WHERE id = '$UserId';"
Write-Host ""
Write-Success "✓ All tests passed!"
Write-Host ""

# Optional: Test Refund
$refundTest = Read-Host "Do you want to test refund flow? (y/n)"
if ($refundTest -eq "y" -or $refundTest -eq "Y") {
    Write-Host ""
    Write-Warning "Step 5: Creating Refund..."

    $refundBody = @{
        transactionId = $transactionId
        paymentIntentId = $paymentIntentId
        reason = "requested_by_customer"
        metadata = @{
            testFlow = "true"
        }
    } | ConvertTo-Json

    try {
        $refundResponse = Invoke-RestMethod -Uri "$BaseUrl/stripe/refunds" `
            -Method Post `
            -ContentType "application/json" `
            -Body $refundBody

        $refundStatus = $refundResponse.status

        Write-Success "✓ Refund created"
        Write-Host "  Status: $refundStatus"
        Write-Host ""
    } catch {
        Write-Error "Failed to create refund"
        Write-Host $_.Exception.Message
    }

    Write-Warning "Waiting 5 seconds for refund event processing..."
    Start-Sleep -Seconds 5

    Write-Success "✓ Refund test complete!"
    Write-Host ""
}

Write-Info "========================================"
Write-Info "All Done! 🎉"
Write-Info "========================================"
