#!/bin/bash

# API Configuration
API_URL="http://localhost:54321"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check if jq is available
if command -v jq >/dev/null 2>&1; then
    FORMAT_JSON="jq '.'"
else
    FORMAT_JSON="cat"
    echo "💡 Tip: Install 'jq' for prettier JSON output"
    echo "    macOS: brew install jq"
    echo "    Ubuntu/Debian: sudo apt-get install jq"
fi

echo "🔍 Testing Supabase REST API..."

# Test 1: Get all users
echo -e "\n${GREEN}Test 1: Fetching users${NC}"
curl -s -X GET \
  "$API_URL/rest/v1/users" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  | eval $FORMAT_JSON

# Test 2: Get all tickets
echo -e "\n${GREEN}Test 2: Fetching tickets${NC}"
curl -s -X GET \
  "$API_URL/rest/v1/tickets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  | eval $FORMAT_JSON

# Get user ID (without jq)
USER_ID=$(curl -s -X GET "$API_URL/rest/v1/users?email=eq.customer@test.com" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Test 3: Create a new ticket
echo -e "\n${GREEN}Test 3: Creating new ticket${NC}"
curl -s -X POST \
  "$API_URL/rest/v1/tickets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "subject": "API Test Ticket",
    "description": "Testing ticket creation via API",
    "status": "open",
    "priority": "medium",
    "customer_id": "'$USER_ID'"
  }' \
  | eval $FORMAT_JSON

# Get first ticket ID (without jq)
TICKET_ID=$(curl -s -X GET "$API_URL/rest/v1/tickets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 4: Get messages for a specific ticket
echo -e "\n${GREEN}Test 4: Fetching messages for the first ticket${NC}"
curl -s -X GET \
  "$API_URL/rest/v1/ticket_messages?ticket_id=eq.$TICKET_ID" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  | eval $FORMAT_JSON

# Test 5: Add a message to a ticket
echo -e "\n${GREEN}Test 5: Adding message to ticket${NC}"
curl -s -X POST \
  "$API_URL/rest/v1/ticket_messages" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "ticket_id": "'$TICKET_ID'",
    "sender_id": "'$USER_ID'",
    "sender_type": "customer",
    "content": "Test message via API"
  }' \
  | eval $FORMAT_JSON 