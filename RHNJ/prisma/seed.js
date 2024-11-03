const { PrismaClient } = require('@prisma/client');
// const { hash } = require('bcrypt');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
require('dotenv').config();

const init = async () => {
  try {
    // Clear existing data
    await prisma.user.deleteMany();
    await prisma.userCharacter.deleteMany();
    
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
          userId: 20,
          level: 5,
          characterName: 'May',  
          class: 'The Flirt',
          image: '/Images/BardImage.png',
          description:
      'The Flirt is the life of the party, always knowing exactly what to say (or sing) to capture attention. This Diva uses her charm, wit, seduction and connections to navigate the social scene, throwing extravagant parties and spreading gossip with finesse. She’s the one who smooths over conflicts—or fans the flames with a sly word—while keeping the spotlight on herself. Known for her performances, whether it’s breaking into song at a dinner party or giving a dramatic toast, she thrives in the limelight.',
        strength: 8,
        dexterity: 14,
        constitution: 13,
        intelligence: 10,
        wisdom: 12,
        charisma: 15,
        savingThrows: ['dexterity', 'charisma'],
        skills: [
          'minorIllusion',
          'viciousMockery',
          'charmPerson',
          'detectMagic',
          'healingWord',
        ],
        singleUseSkill: ['thunderwave'],
        statusPoints: 10,
        attackRoll: '1 D8 per level',
        catchPhrases: [
      'I don’t just make headlines, darling—I am them.',
      'When I speak, everyone listens—whether they want to or not.',
       ],
       ideals: 'family first, Gucci forever'    
       flaws: 'the Book!!!, was a stripper, got that movie part by sleeping with the producer'    
       notes: 'blah blah blah'
       } 
      })

      prisma.userCharacter.create({
        data: {
          userId: 21,
          level: 5,
          characterName: 'Betty-Sue',  
          class: 'The Empath',
          image: '/Images/ClericImage.png',
          description:
      'The Empath is the self-righteous Diva who believes she's the moral compass of the group. She's quick to judge, especially when someone else’s behavior doesn’t align with her version of right and wrong. Constantly preaching about loyalty, family, or faith, she’s often at the center of disputes over values and respect. Whether hosting a charity event or defending her 'sacred' family name, the Empath positions herself as above the petty drama—until she gets dragged into it, of course.',
        strength: 13,
        dexterity: 10,
        constitution: 14,
        intelligence: 8,
        wisdom: 15,
        charisma: 12,
        savingThrows: ['wisdom', 'charisma'],
        skills: ['guidance', 'mending', 'bless', 'healingWord', 'shieldOfFaith'],
        singleUseSkill: ['guidingBolt'],
        statusPoints: 10,
        attackRoll: '1 D8 per level',
        catchPhrases: [
      'In my world, loyalty is law—and I’m judge, jury, and executioner.',
      'I don’t preach—I protect, and heaven help anyone who crosses me.',
       ],
       ideals: 'God, family, country. Kids should not be spoiled.'    
       flaws: 'is a boy-mom. will lie to protect family. gaslights constantly'    
       notes: 'blahdy blah blah'
        },
      })

      prisma.userCharacter.create({
        data: {
          userId: 22,
          level: 5,
          characterName: 'Coachella',  
          class: 'The Backstabber',
          image: '/Images/RogueImage.png',
          description:
      'The Backstabber is the Diva who thrives on being one step ahead of everyone else, operating from the shadows with subtle schemes. She’s always got something going on behind the scenes—whether it’s a secret alliance, a hidden agenda, or a bit of sabotage to take down a rival. She’s the one to plant seeds of doubt or spread information discreetly, letting others take the fall while she keeps her hands clean. Master of the side-eye and whispered asides, she excels in sneaky maneuvers that others may not even notice until it’s too late.',
        strength: 8,
        dexterity: 15,
        constitution: 10,
        intelligence: 14,
        wisdom: 12,
        charisma: 13,
        savingThrows: ['dexterity', 'intelligence'],
        skills: [
          'sneakAttack',
          'thevesCant',
          'disguise',
          'cunningAction',
          'sleightOfHand',
        ],
        singleUseSkill: ['poison'],
        statusPoints: 15,
        attackRoll: '1 D8 per level',
        catchPhrases: [
      'Keep your enemies close—especially when you know their secrets.',
      'You may not see me coming, but you’ll definitely feel the sting.',
       ],
       ideals: 'Put yourself first. A happy mother makes for happy children.'    
       flaws: 'diagnosed sociopath. Killed her last ex dog and blamed her ex mother because she was bored.'    
       notes: 'put more stuff here'
        },
      })
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
