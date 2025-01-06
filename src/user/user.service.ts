import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '../../prisma/__generated__'
import { hash } from 'argon2'

@Injectable()
export class UserService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }
  public async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    return user
  }

  public async create(data: Prisma.UserCreateInput) {
    const hashedPassword = await this.hashPassword(data.password)

    return await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    })
  }

  private async hashPassword(password: string): Promise<string | null> {
    if (!password) {
      return null
    }
    return await hash(password)
  }
}
