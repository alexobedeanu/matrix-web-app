import { PrismaClient } from '@prisma/client'
import { seedPuzzles, seedMissions } from '../src/lib/seedData'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Clear existing data (optional, for development)
    console.log('🧹 Cleaning existing data...')
    await prisma.userMission.deleteMany({})
    await prisma.userPuzzle.deleteMany({})
    await prisma.mission.deleteMany({})
    await prisma.puzzle.deleteMany({})
    
    // Seed puzzles
    console.log('🧩 Seeding puzzles...')
    await seedPuzzles()
    console.log('✅ Puzzles seeded successfully')
    
    // Seed missions
    console.log('🎯 Seeding missions...')
    await seedMissions()
    console.log('✅ Missions seeded successfully')
    
    // Count seeded data
    const puzzleCount = await prisma.puzzle.count()
    const missionCount = await prisma.mission.count()
    
    console.log(`🎉 Seeding completed successfully!`)
    console.log(`   📊 ${puzzleCount} puzzles created`)
    console.log(`   📊 ${missionCount} missions created`)
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  })