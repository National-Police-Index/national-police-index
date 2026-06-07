#!/bin/bash

echo "=== Verifying and Creating Firebase Index for full_name_lower ==="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Error: Firebase CLI not found. Install it with:"
    echo "  npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
echo "Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Not logged in to Firebase. Running login..."
    firebase login
fi

echo ""
echo "Current Firebase Indexes:"
echo "-------------------------"
firebase firestore:indexes | grep -A 5 "full_name_lower" || echo "No full_name_lower index found"

echo ""
echo "Required Index:"
echo "---------------"
cat firestore-indexes-full-name-lower.json

echo ""
read -p "Do you want to deploy this index? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying index..."
    firebase deploy --only firestore:indexes --non-interactive --config firestore-indexes-full-name-lower.json

    echo ""
    echo "✓ Index deployment initiated!"
    echo ""
    echo "Note: Index creation can take several minutes to hours depending on data size."
    echo "Check status at: https://console.firebase.google.com/project/_/firestore/indexes"
else
    echo "Skipped index deployment"
fi
