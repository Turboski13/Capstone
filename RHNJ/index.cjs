const express = require('express');
const cors = require('cors'); // Import cors
/* const { PrismaClient } = require('@prisma/client');
 */const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
/* const prisma = new PrismaClient();*/
const prisma = require('./prisma/client');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); // Added this line
app.use(express.json());

const secret = process.env.JWT_SECRET || 'itsLeviosaaaa';
const payload = { id: 1 };

const token = jwt.sign(payload, secret);
console.log('Generated Token:', token);

jwt.verify(token, secret, (err, decoded) => {
  if (err) {
    console.error('Verification Error:', err);
  } else {
    console.log('Decoded Token:', decoded);
  }
});

// JWT Verfication Middleware
function authMiddleware(req, res, next) {
  console.log('Request Headers:', req.headers);
  const authHeader = req.headers['authorization'];

  if (authHeader) {
    console.log('Authorization Header:', authHeader);
    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token);
    // console.log('Using JWT Secret:', process.env.JWT_SECRET, {
    //   expiresIn: '1h',
    // };
    if (!token) {
      console.error('Token is undefined');
      return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT Error:', err.message, 'Token:', token);
        return res.sendStatus(401);
      }
      req.user = user;
      console.log('Authenticated user:', req.user);
      next();
    });
  } else {
    console.error('No authorization header found');
    return res.sendStatus(401);
  }
}

// Create Express server
function createServer() {
 

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
      console.log('Attempting to delete user with ID:', req.user.id);

      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!userExists) {
        console.error('User not found for deletion:', req.user.id);
        return res.sendStatus(404);
      }

      await prisma.user.delete({ where: { id: req.user.id } });
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting user:', error);
      next(error);
    }
  });

  // Character routes
  app.post('/api/characters', authMiddleware, async (req, res, next) => {
    try {
      const characterData = {
        ...req.body,
        userId: req.user.id,
      };
      console.log('Character Data:', characterData);
      console.log('Request Body:', req.body);

      const character = await prisma.userCharacter.create({
        data: characterData,
      });
      console.log('Created Character:', character);
      res.status(201).json(character);
    } catch (error) {
      console.error('Error creating character:', error);
      next(error);
    }
  });


  app.delete('/api/characters/:id', authMiddleware, async (req, res, next) => {
    try {
      const characterId = Number(req.params.id);
      const character = await prisma.userCharacter.findUnique({
        where: { id: characterId },
      });

      if (!character) {
        return res.status(404).send({ error: 'Character not found' });
      }

      if (character.userId !== req.user.id) {
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
  
  app.post('http://localhost:3000/api/characters/save-character', async (req, res) => {
    try {
      const characterData = req.body;
      const savedCharacter = await prisma.userCharacter.create({
        data: characterData,
      });
      res.status(200).json(savedCharacter);
    } catch (error) {
      console.error("Error saving character:", error);
      res.status(500).json({ error: "Error saving character" });
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
      where: { userId: req.user.id },
    });
    res.status(200).json(characters);
  });

  // Middleware error handling
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res
      .status(500)
      .send({ error: 'Internal server error', message: err.message });
  });

  return app;
}

// Start the server
// const app = createServer();

const startServer = async () => {
  await prisma.$connect();
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
  
};

startServer();

module.exports = { prisma, createServer };
