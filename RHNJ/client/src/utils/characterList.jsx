import React, { useState, useEffect } from 'react';

const characters = [
  {
    id: 1,
    level: 1,
    characterClass: 'The Flirt',
    description:
      'The Flirt is the life of the party, always knowing exactly what to say (or sing) to capture attention. This Diva uses her charm, wit, seduction and connections to navigate the social scene, throwing extravagant parties and spreading gossip with finesse. She’s the one who smooths over conflicts—or fans the flames with a sly word—while keeping the spotlight on herself. Known for her performances, whether it’s breaking into song at a dinner party or giving a dramatic toast, she thrives in the limelight.',
    catchPhrases: [
      'I don’t just make headlines, darling—I am them.',
      'When I speak, everyone listens—whether they want to or not.',
    ],

    image: '/Images/BardImage.png',
    attributes: {
      strength: 8,
      dexterity: 14,
      constitution: 13,
      intelligence: 10,
      wisdom: 12,
      charisma: 15,
      savingThrows: ['dexterity', 'charisma'],
    },

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
  },

  {
    id: 2,
    level: 1,
    characterClass: 'The Empath',
    description:
      "The Empath is the self-righteous Diva who believes she's the moral compass of the group. She's quick to judge, especially when someone else’s behavior doesn’t align with her version of right and wrong. Constantly preaching about loyalty, family, or faith, she’s often at the center of disputes over values and respect. Whether hosting a charity event or defending her 'sacred' family name, the Empath positions herself as above the petty drama—until she gets dragged into it, of course.",
    catchPhrases: [
      'In my world, loyalty is law—and I’m judge, jury, and executioner.',
      'I don’t preach—I protect, and heaven help anyone who crosses me.',
    ],

    image: '/Images/ClericImage.png',
    attributes: {
      strength: 13,
      dexterity: 10,
      constitution: 14,
      intelligence: 8,
      wisdom: 15,
      charisma: 12,
      savingThrows: ['wisdom', 'charisma'],
    },

    skills: ['guidance', 'mending', 'bless', 'healingWord', 'shieldOfFaith'],
    singleUseSkill: ['guidingBolt'],
    statusPoints: 10,
    attackRoll: '1 D8 per level',
  },

  {
    id: 3,
    level: 1,
    characterClass: 'The Confronter',
    description:
      'The Confronter is the Diva who isn’t afraid to get loud or physical if needed. She’s the one who charges into every confrontation, never backing down from a fight—whether it’s with words or, on rare occasions, a table-flip. She’s fiercely loyal to her friends (as long as they don’t cross her) and is known for settling disputes with a no-nonsense, in-your-face attitude. Direct and fiery, she’s the ultimate force to be reckoned with when things get heated.',
    catchPhrases: [
      'I don’t start fights, but you better believe I finish them.',
      'Mess with me or mine, and you’ll wish you hadn’t.',
    ],
    image: '/Images/FighterImage.png',
    attributes: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 8,
      wisdom: 10,
      charisma: 12,
      savingThrows: ['strength', 'charisma'],
    },

    skills: [
      'intimidation',
      'attack',
      'duel',
      'twoHandedWeapon',
      'investigation',
    ],
    singleUseSkill: ['actionSurge'],
    statusPoints: 12,
    attackRoll: '1 D10 per level',
  },

  {
    id: 4,
    level: 1,
    characterClass: 'The Backstabber',
    description:
      'The Backstabber is the Diva who thrives on being one step ahead of everyone else, operating from the shadows with subtle schemes. She’s always got something going on behind the scenes—whether it’s a secret alliance, a hidden agenda, or a bit of sabotage to take down a rival. She’s the one to plant seeds of doubt or spread information discreetly, letting others take the fall while she keeps her hands clean. Master of the side-eye and whispered asides, she excels in sneaky maneuvers that others may not even notice until it’s too late.',
    catchPhrases: [
      'Keep your enemies close—especially when you know their secrets.',
      'You may not see me coming, but you’ll definitely feel the sting.',
    ],
    image: '/Images/RogueImage.png',
    attributes: {
      strength: 8,
      dexterity: 15,
      constitution: 10,
      intelligence: 14,
      wisdom: 12,
      charisma: 13,
      savingThrows: ['dexterity', 'intelligence'],
    },

    skills: [
      'sneakAttack',
      'thevesCant',
      'disguise',
      'cunningAction',
      'sleightOfHand',
    ],
    singleUseSkill: ['poison'],
    statusPoints: 10,
    attackRoll: '1 D8 per level',
  },

  {
    id: 5,
    level: 1,
    characterClass: 'The Professional',
    description:
      'The Professional is the Diva with the sharpest mind and the most strategic approach to social dominance. She’s always three steps ahead, calculating her every move and often orchestrating drama from behind the scenes. Whether she’s crafting the perfect comeback, planning a power play, or conjuring the ultimate social scheme, she’s the brain behind the group’s most iconic moments. Unlike the Rogue, who operates sneakily, the Wizard’s moves are bold and deliberate, with a clear long-term vision of control.',
    catchPhrases: [
      'I don’t play games, I write the rules.',
      'They call me calculating, but honey, that’s just called being smarter than you.',
    ],

    image: '/Images/WizardImage.png',
    attributes: {
      strength: 10,
      dexterity: 13,
      constitution: 14,
      intelligence: 15,
      wisdom: 12,
      charisma: 8,
      savingThrows: ['intelligence', 'wisdom'],
    },

    skills: ['light', 'mageHand', 'rayOfFrost', 'charmPerson', 'shield'],
    singleUseSkill: ['magicMissle'],
    statusPoints: 8,
    attackRoll: '1 D6 per level',
  },
];

export default characters;
