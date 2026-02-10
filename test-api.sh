#!/bin/bash

# Tech Tracker API Test Script
BASE_URL="http://localhost:3000"

echo "==================================="
echo "Testing Tech Tracker API"
echo "==================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s $BASE_URL/health
echo -e "\n"

# Test 2: Register Admin
echo "2️⃣  Registering Admin..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "admin@test.com",
    "password": "admin123"
  }')
echo $ADMIN_RESPONSE | jq '.'
ADMIN_ID=$(echo $ADMIN_RESPONSE | jq -r '.admin.id')
echo "Admin ID: $ADMIN_ID"
echo ""

# Test 3: Register Technician
echo "3️⃣  Registering Technician..."
TECH_RESPONSE=$(curl -s -X POST $BASE_URL/api/technician/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Technician",
    "email": "tech@test.com",
    "password": "tech123"
  }')
echo $TECH_RESPONSE | jq '.'
TECH_ID=$(echo $TECH_RESPONSE | jq -r '.technician.id')
echo "Technician ID: $TECH_ID"
echo ""

# Test 4: Assign Job
echo "4️⃣  Assigning Job..."
JOB_RESPONSE=$(curl -s -X POST $BASE_URL/api/admin/assign-job \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Fix Network Issue\",
    \"description\": \"Router not working properly\",
    \"address\": \"123 Main St, New York, NY\",
    \"adminId\": \"$ADMIN_ID\",
    \"techId\": \"$TECH_ID\"
  }")
echo $JOB_RESPONSE | jq '.'
JOB_ID=$(echo $JOB_RESPONSE | jq -r '.job.id')
echo "Job ID: $JOB_ID"
echo ""

# Test 5: Accept Job
echo "5️⃣  Technician Accepting Job..."
curl -s -X PUT $BASE_URL/api/jobs/$JOB_ID/accept | jq '.'
echo ""

# Test 6: Start Job
echo "6️⃣  Starting Job (Enable Tracking)..."
curl -s -X PUT $BASE_URL/api/jobs/$JOB_ID/start \
  -H "Content-Type: application/json" \
  -d "{\"techId\": \"$TECH_ID\"}" | jq '.'
echo ""

# Test 7: Get All Jobs
echo "7️⃣  Getting All Jobs..."
curl -s $BASE_URL/api/jobs | jq '.jobs[] | {id, title, status, techName: .technician.name}'
echo ""

# Test 8: Get Technician Details
echo "8️⃣  Getting Technician Details..."
curl -s $BASE_URL/api/technician/$TECH_ID | jq '.technician | {id, name, email, status, isTracking}'
echo ""

# Test 9: Complete Job
echo "9️⃣  Completing Job (Disable Tracking)..."
curl -s -X PUT $BASE_URL/api/jobs/$JOB_ID/complete \
  -H "Content-Type: application/json" \
  -d "{\"techId\": \"$TECH_ID\"}" | jq '.'
echo ""

echo "==================================="
echo "✅ All API Tests Completed!"
echo "==================================="
echo ""
echo "IDs for Postman:"
echo "Admin ID: $ADMIN_ID"
echo "Tech ID: $TECH_ID"
echo "Job ID: $JOB_ID"
