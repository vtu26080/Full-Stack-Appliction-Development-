#!/bin/bash
echo "================================================"
echo "  Vel Tech Campus Event Portal - Setup Script"
echo "================================================"
echo ""
echo "Step 1: Installing npm packages..."
npm install
echo ""
echo "Step 2: Creating .env file from example..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created .env — please edit it with your MySQL password!"
else
  echo "  .env already exists."
fi
echo ""
echo "Step 3: Ready to start!"
echo ""
echo "  Edit .env with your MySQL credentials, then run:"
echo "  npm start"
echo ""
echo "  App will be available at: http://localhost:3000"
echo "  Admin Panel: http://localhost:3000/admin/login"
echo "  Admin: veltech_admin / admin@veltech123"
echo ""
