#!/bin/bash

API_URL="http://localhost:54321"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Simple health check
echo "Testing API health..."
curl -i -X GET \
  "$API_URL/rest/v1/" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Test users table with explicit schema
echo -e "\n\nTesting users table..."
curl -i -X GET \
  "$API_URL/rest/v1/users" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Accept: application/json" 