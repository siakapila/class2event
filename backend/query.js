import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany({ select: { email: true, registrationNo: true } })
  console.log('--- ALL STUDENTS ---')
  console.log(students)
}
main()
