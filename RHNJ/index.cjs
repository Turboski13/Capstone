const express = require('express');
const cors = require('cors'); // Import cors
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors()); // Added this line
app.use(express.json());

// JWT Verfication Middleware
const authMiddleware = (req, res, next) => {
  console.log('Request Headers:', req.headers);
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Authorization header missing or incorrectly formatted');
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Token is undefined');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Error with token:', token);
      return res.status(401).send({ message: 'Invalid token' });
    }
    req.user = decoded.id;
    console.log('Authenticated user:', req.user);
    next();
  });
};

// Create Express server

app.get('/test', (req, res) => {
  res.send('Server is up and running!');
});

// Sign-up
app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      console.error('Username already exists:', username);
      return res.status(409).send({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    res.status(201).json({ id: user.id, username: user.username });
  } catch (error) {
    console.error('Error during signup:', error);
    next(error);
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    // Log the JWT secret before signing
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    console.log('Generated Token:', token);
    return res.status(200).json({ username: user.username, token });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send({ error: 'Internal server error ' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.sendStatus(404);
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Delete current user
app.delete('/api/auth/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete related user characters first
    await prisma.userCharacter.deleteMany({
      where: { userId: userId },
    });

    // Then delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting user:', error);
    next(error);
  }
});
app.post('/api/user/characters/:id', authMiddleware, async(req, res, next)=> {
  const { characterId } = req.body;
  try{
    const character = await prisma.userCharacter.findUnique({
      where: { id: characterId}
    })
    res.status(201).json({character});
  }catch(err){
    console.error('Error finding characters', err);
    res.status(401).json({ message: 'couldnt get the character'});
  }

})


// Character routes
app.get('/api/characters', authMiddleware, async (req, res) => {
  try {
    const characters = await prisma.userCharacter.findMany({
      where: { userId: req.user.id }, // Ensure you're only fetching characters for the authenticated user
    });

    return res.status(200).json(characters);
  } catch (error) {
    console.error('Error retrieving characters:', error);
  }
});

app.post('/api/character', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']; //problem here
    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'missing or wrong jwt' });
    }
    const token = authHeader.split(' ')[1];
    console.log(token);
    let verifiedUser;
    try {
      verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT Verification Failed:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }

    console.log('Verified User:', verifiedUser);
    const userExists = await prisma.user.findUnique({
      where: { id: verifiedUser.id },
    });

    console.log('User Exists:', userExists);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const characterData = {
      ...req.body,
      userId: verifiedUser.id,
    };
    const character = await prisma.userCharacter.create({
      data: characterData,
    });
    console.log('character created!!: ', character);
    res.status(201).json(character);
  } catch (err) {
    console.error('Couldnt create char, stuck in index: ', err);
    res
      .status(500)
      .json({
        message: 'could not create the char successfully',
        error: err.message,
      });
  }
});

app.get('/api/teams', async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany();
    res.status(201).json(teams);
  } catch (err) {
    console.error('no teams returned', err);
    res.status(401).json({ message: "couldn't find any teams =(", err });
  }
});

app.post('/api/teams', authMiddleware, async (req, res, next) => {
  try {
    const { teamName, roomPassword, assets } = req.body;
    const dmId = req.user;

    const newTeam = await prisma.team.create({
      data: {
        name: teamName,
        password: roomPassword,
        dmId: parseInt(dmId),
        assets: assets ? JSON.parse(assets) : {},
      },
    });
    res.status(201).json(newTeam);
  } catch (err) {
    console.error('couldnt create a taem', err);
    res.status(401).json({ message: 'couldnt make a new team', err });
  }
});

app.post('/api/teams/:teamId/join', authMiddleware, async (req, res, next) => {
  try {
    const { teamPW } = req.body;
    const { teamId } = req.params;
    const userId = req.user;
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
    });

    if (!team) {
      return res.status(404).json({ message: 'No teams found!' });
    }

    if (team.password !== teamPW) {
      return res.status(401).json({ message: 'password is incorrect' });
    }

    const joinedTeam = await prisma.team.update({
      where: { id: parseInt(teamId) },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    });
    res.status(201).json({ message: 'Joined new team!: ', team: joinedTeam });
  } catch (err) {
    console.error('wrong info or error: ', err);
    res.status(401).json({ message: 'The credentials are incorrect. ', err });
  }
});

app.delete('/api/user/characters/:id', authMiddleware, async (req, res, next) => {
  try {
    const characterId = Number(req.params.id);
    const character = await prisma.userCharacter.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return res.status(404).send({ error: 'Character not found' });
    }

    if (character.userId !== req.user) {
      return res
        .status(403)
        .send({ error: 'Not authorized to delete this character' });
    }

    await prisma.userCharacter.delete({
      where: { id: characterId },
    });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting character:', error);
    next(error);
  }
});

app.put('/api/characters/:id', authMiddleware, async (req, res, next) => {
  try {
    const updatedCharacter = await prisma.userCharacter.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.send(updatedCharacter);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

app.get('/api/user/characters', authMiddleware, async (req, res) => {
  const characters = await prisma.userCharacter.findMany({
    where: { userId: req.user },

  });
  res.status(201).json(characters);
});

// Middleware error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res
    .status(500)
    .send({ error: 'Internal server error', message: err.message });
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

app.get('/test', (req, res) => {
  res.send('Server is up and running!');
});

module.exports = {
  prisma,
  createServer: () => app,
};
