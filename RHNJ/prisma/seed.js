const { PrismaClient } = require('@prisma/client');
// const { hash } = require('bcrypt');
const express = require('express');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
require('dotenv').config();

const init = async () => {
  try {
    // Clear existing data
    await prisma.userCharacter.deleteMany();
    await prisma.user.deleteMany();

    // Create users with hashed passwords
    const users = await Promise.all([
      prisma.user.create({
        data: {
          username: 'admin1',
          password: await bcrypt.hash('testing123', 10),
        },
      }),
      prisma.user.create({
        data: {
          username: 'admin2',
          password: await bcrypt.hash('testing789', 10),
        },
      }),
      prisma.user.create({
        data: {
          username: 'user1',
          password: await bcrypt.hash('getf@cked', 10),
        },
      }),
      prisma.user.create({
        data: {
          username: 'user2',
          password: await bcrypt.hash('likesisters', 10),
        },
      }),
      prisma.user.create({
        data: { username: 'user3', password: await bcrypt.hash('suckit', 10) },
      }),
    ]);
    console.log('Created users:', users);

    // Create characters
    const characters = await Promise.all([
      prisma.userCharacter.create({
        data: {
          characterName: 'May',
          characterClass: 'Rogue',
          level: 5,
          image: 'image',
          user: { connect: { id: users[2].id } },
          attributes: {
            strength: 10,
            dexterity: 20,
            constitution: 15,
            intelligence: 10,
            wisdom: 10,
            charisma: 15,
          },
          statusPoints: 5,
          attackRoll: '1 D8 per level',
          abilities: ['sneak', 'steal', 'stab'],
        },
      }),
      prisma.userCharacter.create({
        data: {
          characterName: 'Kristen',
          characterClass: 'Wizard',
          level: 5,
          image: 'image',
          user: { connect: { id: users[4].id } },
          attributes: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 20,
            wisdom: 15,
            charisma: 15,
          },
          statusPoints: 5,
          attackRoll: '1 D8 per level',
          abilities: ['cast', 'spell', 'fireball'],
        },
      }),
      prisma.userCharacter.create({
        data: {
          characterName: 'Ingrid',
          characterClass: 'Cleric',
          level: 5,
          image: 'image',
          user: { connect: { id: users[3].id } },
          attributes: {
            strength: 10,
            dexterity: 10,
            constitution: 15,
            intelligence: 10,
            wisdom: 20,
            charisma: 15,
          },
          statusPoints: 5,
          attackRoll: '1 D8 per level',
          abilities: ['heal', 'pray', 'smite'],
        },
      }),
      prisma.userCharacter.create({
        data: {
          characterName: 'Crystal',
          characterClass: 'Fighter',
          level: 5,
          image: 'image',
          user: { connect: { id: users[2].id } },
          attributes: {
            strength: 20,
            dexterity: 10,
            constitution: 15,
            intelligence: 10,
            wisdom: 10,
            charisma: 15,
          },
          statusPoints: 5,
          attackRoll: '1 D8 per level',
          abilities: ['swing', 'hit', 'block'],
        },
      }),
      prisma.userCharacter.create({
        data: {
          characterName: 'Destinee',
          characterClass: 'Bard',
          level: 5,
          image: 'image',
          user: { connect: { id: users[1].id } },
          attributes: {
            strength: 10,
            dexterity: 10,
            constitution: 15,
            intelligence: 15,
            wisdom: 10,
            charisma: 20,
          },
          statusPoints: 5,
          attackRoll: '1 D8 per level',
          abilities: ['sing', 'dance', 'charm'],
        },
      }),
    ]);
    

    console.log('Created characters:', characters);
    console.log('Data seeded');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
};

init();
