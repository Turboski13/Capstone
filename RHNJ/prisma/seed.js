const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
require('dotenv').config();

const init = async () => {
  try {
    // Clear existing data
    await prisma.userCharacter.deleteMany();
    await prisma.user.deleteMany();

    // Create users with hashed passwords and isAdmin flag
    const users = await Promise.all([
      prisma.user.create({
        data: {
          username: 'turboski',
          password: await bcrypt.hash('testing123', 10),
          isAdmin: true, //user is an admin
        },
      }),
      prisma.user.create({
        data: {
          username: 'djoeyk',
          password: await bcrypt.hash('testing789', 10),
          isAdmin: true, //user is an admin
        },
      }),
      prisma.user.create({
        data: {
          username: 'sudosmurf',
          password: await bcrypt.hash('1234', 10),
          isAdmin: true, //user is an admin
        },
      }),
      prisma.user.create({
        data: {
          username: 'user1',
          password: await bcrypt.hash('getf@cked', 10),
          isAdmin: false, // regular user
        },
      }),
      prisma.user.create({
        data: {
          username: 'user2',
          password: await bcrypt.hash('likesisters', 10),
          isAdmin: false, // regular user
        },
      }),
      prisma.user.create({
        data: {
          username: 'user3',
          password: await bcrypt.hash('suckit', 10),
          isAdmin: false, // regular user
        },
      }),
    ]);

    console.log('Created users:', users.map(user => user.username));

    // Create characters for the users
    const characters = await Promise.all([
      prisma.userCharacter.create({
        data: {
          userId: users[5].id, // user1
          characterName: 'Archer John',
          description: 'A skilled archer with keen eyes.',
          characterClass: 'Ranger',
          level: 5,
          image: '/images/archer.png',
          attributes: {
            strength: 12,
            dexterity: 18,
            constitution: 14,
            intelligence: 10,
            wisdom: 16,
            charisma: 8,
            savingThrows: ['dexterity', 'wisdom'],
          },
          skills: ['archery', 'survival', 'stealth'],
          singleUseSkill: ['multiShot'],
          statusPoints: 20,
          attackRoll: '1 D8 per level',
          catchPhrases: ['You can run, but you can’t hide.'],
          abilities: ['keenSight'],
          ideals: 'Freedom',
          flaws: 'Overconfident',
          notes: 'Always ready for a challenge.',
        },
      }),
      prisma.userCharacter.create({
        data: {
          userId: users[4].id, // user2
          characterName: 'Mage Jane',
          description: 'A powerful mage who controls fire and ice.',
          characterClass: 'Sorcerer',
          level: 5,
          image: '/images/mage.png',
          attributes: {
            strength: 8,
            dexterity: 14,
            constitution: 12,
            intelligence: 18,
            wisdom: 14,
            charisma: 10,
            savingThrows: ['intelligence', 'charisma'],
          },
          skills: ['fireball', 'iceShard', 'teleport'],
          singleUseSkill: ['timeWarp'],
          statusPoints: 25,
          attackRoll: '1 D6 per level',
          catchPhrases: ['Magic is in the air.'],
          abilities: ['fireControl', 'frostNova'],
          ideals: 'Knowledge',
          flaws: 'Easily distracted',
          notes: 'A deep thinker but can be absent-minded.',
        },
      }),
    ]);

    console.log('Created characters:', characters.map(character => character.characterName));
    console.log('Data seeded');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
};

init();