import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '../../prisma/__generated__'

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

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  public async create(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data,
      select: {
        email: true,
        displayName: true,
        picture: true,
      },
    })
  }
}
