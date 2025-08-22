#!/bin/bash

# Setup for local development with SQLite
echo "Setting up development environment with SQLite..."

# Copy development schema
cp prisma/schema-dev.prisma prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Seed the database
node -e "
const { seedPuzzles, seedAchievements } = require('./src/lib/seedData.js');
async function run() {
  await seedPuzzles();
  await seedAchievements();
  console.log('Database seeded successfully!');
}
run().catch(console.error);
"

echo "Development environment ready!"