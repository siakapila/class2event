import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database with mock data...');

  // Hash password for seeds
  const password = await bcrypt.hash('password123', 12);

  // 1. Create a Fake Club
  const club = await prisma.club.upsert({
    where: { email: 'techclub@muj.manipal.edu' },
    update: {},
    create: {
      name: 'Tech Innovators Club',
      email: 'techclub@muj.manipal.edu',
      password,
      isVerified: true,
    },
  });
  console.log(`Created club: ${club.name} (${club.email})`);

  // 2a. Create a Fake Student
  const student = await prisma.student.upsert({
    where: { email: 'john.doe@muj.manipal.edu' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@muj.manipal.edu',
      password,
      registrationNo: '200901001',
      className: undefined, // remove old property
      department: 'CSE',
      section: 'A',
      year: 3,
      isVerified: true,
    },
  });
  console.log(`Created student: ${student.name} (${student.email})`);

  // 2b. Create another Fake Student
  const student2 = await prisma.student.upsert({
    where: { email: 'jane.smith@muj.manipal.edu' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@muj.manipal.edu',
      password,
      registrationNo: '200901111',
      className: undefined, // remove old property
      department: 'CSE',
      section: 'B',
      year: 2,
      isVerified: true,
    },
  });
  console.log(`Created student: ${student2.name} (${student2.email})`);

  // 2c. Create a third Fake Student
  const student3 = await prisma.student.upsert({
    where: { email: 'alex.jones@muj.manipal.edu' },
    update: {},
    create: {
      name: 'Alex Jones',
      email: 'alex.jones@muj.manipal.edu',
      password,
      registrationNo: '200901222',
      className: undefined, // remove old property
      department: 'IT',
      section: 'A',
      year: 4,
      isVerified: true,
    },
  });
  console.log(`Created student: ${student3.name} (${student3.email})`);

  // 3. Create a Fake Teacher
  const teacher = await prisma.teacher.upsert({
    where: { email: 'prof.smith@jaipur.manipal.edu' },
    update: {},
    create: {
      name: 'Prof. Smith',
      email: 'prof.smith@jaipur.manipal.edu',
      password,
      isVerified: true,
    },
  });
  console.log(`Created teacher: ${teacher.name} (${teacher.email})`);

  // 4. Create an Event
  const event = await prisma.event.create({
    data: {
      name: 'Annual Hackathon 2026',
      venue: 'TMA Pai Auditorium',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 1440, // 24 hours
      description: 'Join us for a 24-hour coding marathon building the future of event management tools!',
      clubId: club.id,
    },
  });
  console.log(`Created event: ${event.name}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
