const express = require('express');
const cors = require('cors'); // Import cors
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const path = require('path');
const csv = require('csvtojson');
const http = require("http");
const { Server } = require("socket.io");


const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.use(cors()); 
app.use(express.json());

app.use(express.static(path.join(__dirname, 'client/dist')));

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
    req.user = decoded;
    console.log('Authenticated user:', req.user);
    next();
  });
};

// Middleware to check if the user is an admin
const authenticateAdmin = (req, res, next) => {
  console.log('Authorization Header:', req.headers.authorization);

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the decoded token has an "admin" role
    if (!decoded.isAdmin) {
      return res.status(403).send('Forbidden: Admin access required');
    }

    req.user = decoded; // Attach the decoded user to the request
    next(); // Proceed to the next middleware or route
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
};

// Create Express server

app.get('/test', (req, res) => {
  res.send('Server is up and running!');
});

// Protected admin route
app.get(`/admin-home`, authenticateAdmin, (req, res, next) => {
  res.send('Welcome to Admin Home');
});

// Verify Token Route
app.post(`${process.env.DEV_URL}/api/verify-token`, (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({
      message: 'Authorization header is missing or incorrectly formatted',
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: 'Token is undefined' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Invalid or expired token' });
    }

    // If token is valid, send success message
    res.status(200).json({ message: 'Token is valid', user: decoded });
  });
});

// Sign-up
app.post(`/api/auth/signup`, async (req, res, next) => {
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
app.post(`/api/auth/login`, async (req, res) => {
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

// Admin Login
app.post('/admin/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid Login');
    }

    if (!user.isAdmin) {
      return res.status(403).send('Forbidden: Admin access required');
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ token });
  } catch (error) {
    console.error('Error during admin login', error);
    return res.status(500).send('Internal Server Error');
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

app.post('/api/user/characters/:id', authMiddleware, async (req, res, next) => {
  const { characterId } = req.body;
  try {
    const character = await prisma.userCharacter.findUnique({
      where: { id: characterId },
    });
    res.status(201).json({ character });
  } catch (err) {
    console.error('Error finding characters', err);
    res.status(401).json({ message: 'couldnt get the character' });
  }
});

// Character routes
app.post('/api/user/characters/:id', authMiddleware, async (req, res, next) => {
  const { characterId } = req.body;
  try {
    const character = await prisma.userCharacter.findUnique({
      where: { id: characterId },
    });
    res.status(201).json({ character });
  } catch (err) {
    console.error('Error finding characters', err);
    res.status(401).json({ message: 'couldnt get the character' });
  }
});

app.get('/api/users/:userId/characters', authMiddleware, async (req, res) => {
  console.log('Accessing /api/users/:userId/characters route');
  console.log(
    'Authenticated user ID:',
    req.user.id,
    'Requested user ID:',
    req.params.userId
  );

  try {
    const characters = await prisma.userCharacter.findMany({
      where: { userId: parseInt(req.params.userId, 10) }, // Ensuring the requested user ID matches the parameter
    });

    console.log('Fetched characters from DB:', characters);
    return res.status(200).json(characters);
  } catch (error) {
    console.error('Error retrieving characters:', error);
    return res.status(500).json({ error: 'Error retrieving characters' });
  }
});

app.get('/api/users/characters', authMiddleware, async (req, res) => {
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
    res.status(500).json({
      message: 'could not create the char successfully',
      error: err.message,
    });
  }
});

//Team routes
app.get('/api/teams', async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany();
    res.status(201).json(teams);
  } catch (err) {
    console.error('no teams returned', err);
    res.status(401).json({ message: "couldn't find any teams =(", err });
  }
});

//create team
app.post('/api/teams', authMiddleware, async (req, res, next) => {
  try {
    const { teamName, roomPassword, assets } = req.body;
    // const dmId = req.user;
    const userId = req.user.id;

    const newTeam = await prisma.team.create({
      data: {
        name: teamName,
        password: roomPassword,
        dmId: userId,
        assets: assets || {},
      },
    });
    res.status(201).json({ team: newTeam });
  } catch (err) {
    console.error('couldnt create a team', err);
    res
      .status(500)
      .json({ message: 'couldnt make a new team', error: err.message });
  }
});

//join team
app.post('/api/teams/:teamId/join', authMiddleware, async (req, res, next) => {
  try {
    const { teamPW } = req.body;
    const { teamId } = req.params;
    const userId = req.user.id;
    console.log('Joining team with:', { teamId, teamPW, userId });

    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
    });

    if (!team) {
      return res.status(404).json({ message: 'No teams found!' });
    }

    if (team.password && team.password !== teamPW) {
      return res.status(401).json({ message: 'password is incorrect' });
    }

    const joinedTeam = await prisma.team.update({
      where: { id: parseInt(teamId) },
      data: {
        users: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        users: true,
      },
    });
    res.status(201).json({ message: 'Joined new team!: ', team: joinedTeam });
  } catch (err) {
    console.error('wrong info or error: ', err);
    res.status(401).json({ message: 'The credentials are incorrect.', err });
  }
});

app.post('/api/teams/:teamId/char-join', authMiddleware, async(req, res, next) => {
  const { teamPW, charId } = req.body;
  const { id } = req.user;
  const { teamId } = req.params;

  try{
    const team = await prisma.team.findUnique({
      where: { id: +teamId },
    });

    if(!team || team.password !== teamPW){
      return res.status(404).json({message: 'couldnt find the team or incorrect PW'});
    }

    const isTheirChar = await prisma.userCharacter.findUnique({
      where: { id: +charId },
      include: { user: true },
    });
    console.log(isTheirChar);
    if(isTheirChar.userId !== id){
      return res.status(403).json({message: "unauthorized to add this character to this team"});
    }

    const joinTeam = await prisma.userCharacter.update({ //this will actually equal the character that joined. 
      where: { id: +charId },
      data: {
        teamId: +teamId
      },
    });
    res.status(201).json({message: 'successfully joined the team'});

  }catch(err){
    console.error('Couldnt add the char to the current team', err);
  }
})

app.get('/api/teams/:teamId', authMiddleware, async (req, res) => {
  const { id } = req.user;
  const { teamId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: +id },
    include: { teams: true },
  });

  const isOnTeam = user.teams.some((team) => team.id === parseInt(teamId));

  if(!isOnTeam){
    return res.status(401).json({message: 'Unauthorized to this team!'});
  }

  const team = await prisma.team.findUnique({
    where: { id: parseInt(teamId) },
    include: { users: true, characters: true, }, // Include users (players) and assets
  });

  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }

  res.status(201).json({ message: `Team details for ${teamId}`, team, id });
});

// Delete team
app.delete('/api/teams/:teamId', authMiddleware, async (req, res) => {
  const { teamId } = req.params;

  const team = await prisma.team.findUnique({
    where: { id: parseInt(teamId) },
    include: { dm: true }, // Ensure dm is included in the response
  });

  if (!team || !team.dm || team.dm.id !== req.user.id) {
    return res.status(403).json({
      message: 'Only the DM can delete the team',
    });
  }

  try {
    await prisma.team.delete({
      where: { id: parseInt(teamId) },
    });

    res.status(200).json({ message: 'Team successfully deleted' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ message: 'Failed to delete team' });
  }
});

//upload info to a team
app.post('/api/teams/upload', authMiddleware, async(req, res, next) => {

  const { teamId, csvData } = req.body;
  try{
    const jsonData = await csv().fromString(csvData);
    const infoUpload = await prisma.team.update({
      where: { id: +teamId},
      data: {
        assets: jsonData,
      },
    });
    res.status(201).json({message: 'upload success!', infoUpload});

  }catch(err){
    console.error('couldnt add the info to the team', err);
  }
})


app.delete(
  '/api/teams/:teamId/users/:userId',
  authMiddleware,
  async (req, res) => {
    const { teamId, userId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
      include: { dm: true }, // Check if the logged-in user is the DM
    });

    if (!team || team.dm.id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Only the DM can remove players from the team' });
    }

    // Remove the player from the team
    const updatedTeam = await prisma.team.update({
      where: { id: parseInt(teamId) },
      data: {
        users: {
          disconnect: { id: parseInt(userId) },
        },
      },
      include: { users: true },
    });

    res.json(updatedTeam);
  }
);


app.delete('/api/user/characters/:id', authMiddleware, async (req, res, next) => {
  try {
    const characterId = Number(req.params.id);
    const character = await prisma.userCharacter.findUnique({
      where: { id: characterId },
    });
    console.log('Requesting user ID:', req.user);
console.log('Character owner ID:', character.userId);

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
    res.status(201).json({ message: 'Character deleted successfully' });
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
    where: { userId: req.user.id },
  });
  res.status(201).json(characters);
});

// Admin routes (for users)
app.get('/api/users', authenticateAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).send({ message: 'Error fetching users' });
  }
});

app.put('/api/users/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, password, isAdmin } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const updatedData = {
      username: username || user.username,
      isAdmin: isAdmin !== undefined ? isAdmin : user.isAdmin,
    };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).send({ message: 'Error updating user' });
  }
});

app.delete('/api/users/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    await prisma.userCharacter.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).send({ message: 'Error deleting user' });
  }
});

// Admin routes (for characters)
app.get('/api/characters', authenticateAdmin, async (req, res, next) => {
  try {
    const characters = await prisma.userCharacter.findMany();
    return res.status(200).json(characters);
  } catch (err) {
    console.error('Error fetching characters:', err);
    return res.status(500).send({ message: 'Error fetching characters' });
  }
});

app.put('/api/characters/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const characterId = parseInt(req.params.id);
    const { name, description, stats } = req.body;

    const character = await prisma.userCharacter.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return res.status(404).send({ message: 'Character not found' });
    }

    const updatedCharacter = await prisma.userCharacter.update({
      where: { id: characterId },
      data: {
        name: name || character.name,
        description: description || character.description,
        stats: stats || character.stats,
      },
    });

    return res.status(200).json(updatedCharacter);
  } catch (err) {
    console.error('Error updating character:', err);
    return res.status(500).send({ message: 'Error updating character' });
  }
});

app.delete('/api/characters/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const characterId = parseInt(req.params.id);

    const character = await prisma.userCharacter.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return res.status(404).send({ message: 'Character not found' });
    }

    await prisma.userCharacter.delete({
      where: { id: characterId },
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting character:', err);
    return res.status(500).send({ message: 'Error deleting character' });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("updateStatusPoints", async ({ characterId, change }) => {
    try {
      // Update the database
      const updatedCharacter = await prisma.userCharacter.update({
        where: { id: characterId },
        data: {
          statusPoints: {
            increment: change, // Increment or decrement
          },
        },
      });

      // Broadcast the updated character to all clients
      io.emit("updateCharacterStatus", updatedCharacter);
    } catch (error) {
      console.error("Error updating character status points:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.get('/', (req, res, next)=>{
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.get('*', (req, res, next)=> {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Middleware error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send({ error: 'Internal server error', message: err.message });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${PORT}`);
  });

app.get('/test', (req, res) => {
  res.send('Server is up and running!');
});

module.exports = {
  prisma,
  createServer: () => app,
};
