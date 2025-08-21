import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email și parola sunt obligatorii' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilizator cu acest email există deja' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      }
    })

    return NextResponse.json({
      message: 'Utilizator creat cu succes',
      user: { id: user.id, email: user.email, name: user.name }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Eroare la înregistrare' },
      { status: 500 }
    )
  }
}