const request = require('supertest');
require('dotenv').config(); // Load .env file

const express = require('express');
const { createServer } = require('../index.cjs');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prismaClient = new PrismaClient();

let app;
let userId;
let token;
let characterId;

// Define userData
const userData = {
  username: `testuser-${Date.now()}`,
  password: 'testpassword',
};

beforeAll(async () => {
  app = createServer();
  await prismaClient.$connect();
  console.log('Connected to the database');
});

beforeEach(async () => {
  await prismaClient.userCharacter.deleteMany({});
  await prismaClient.user.deleteMany({});

  const existingUsers = await prismaClient.user.findMany();
  console.log('Existing Users After Cleanup:', existingUsers);

  // Generate a unique username for each test
  userData.username = `testuser-${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}`;
  console.log('Generated username for signup:', userData.username);

  // Sign up a new user
  const response = await request(app).post('/api/auth/signup').send(userData);
  console.log('Signup response:', response); // Log the response

  if (response.status === 409) {
    console.error('User already exists:', response.body);
    const existingUsersAfterSignup = await prismaClient.user.findMany();
    console.log(
      'Existing Users After Signup Attempt:',
      existingUsersAfterSignup
    );
  }

  expect(response.status).toBe(201);
  userId = response.body.id;

  // Log in to get the token
  const userResponse = await request(app)
    .post('/api/auth/login')
    .send(userData);
  token = userResponse.body.token;
  expect(token).toBeDefined(); // Check to ensure the token is set

  // Create a character
  const characterResponse = await request(app)
    .post('/api/characters')
    .set('Authorization', `Bearer ${token}`)
    .send({
      characterName: 'Test Character',
      characterClass: 'Rogue',
      characterLevel: 5,
      characterImage: 'image',
      strength: 10,
      dexterity: 20,
      constitution: 15,
      intelligence: 10,
      wisdom: 10,
      charisma: 15,
      statusPoints: 5,
      abilities: ['sneak', 'steal', 'stab'],
    });

  console.log('Character Creation Response:', characterResponse.body);
  characterId = characterResponse.body.id;
});

afterAll(async () => {
  await prismaClient.$disconnect();
});

test('Get current user', async () => {
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.username).toBe(userData.username);
});

describe('API Routes', () => {
  // const userData = {
  //   username: 'testuser',
  //   password: 'testpassword',
  // };

  test('POST /api/auth/signup - should create a new user', async () => {
    const response = await request(app).post('/api/auth/signup').send(userData);

    if (response.status === 409) {
      console.error('User already exists:', response.body);
      const existingUsers = await prismaClient.user.findMany();
      console.log('Existing Users:', existingUsers);
    }
    console.log('Signup response:', response.body);

    expect(response.status).toBe(201);
    // expect(response.body.username).toBe(userData.username);
    userId = response.body.id;
  });

  test('POST /api/auth/login - should log in the user', async () => {
    const response = await request(app).post('/api/auth/login').send(userData);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(userData.username);
    expect(response.body.token).toBeDefined();
    token = response.body.token;
    console.log('Generated token:', token);
  });

  test('GET /api/auth/me - should return the current user', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(userData.username);
  });

  test('POST /api/characters - should create a new character', async () => {
    const characterData = {
      characterName: 'May',
      characterClass: 'Rogue',
      characterLevel: 5,
      characterImage: 'image',
      strength: 10,
      dexterity: 20,
      constitution: 15,
      intelligence: 10,
      wisdom: 10,
      charisma: 15,
      statusPoints: 5,
      abilities: ['sneak', 'steal', 'stab'],
    };

    const response = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send(characterData);

    expect(response.status).toBe(201);
    expect(response.body.characterName).toBe(characterData.characterName);
    characterId = response.body.id;
  });

  test('GET /api/characters - should return all characters', async () => {
    const response = await request(app)
      .get('/api/characters')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });
});

test('DELETE /api/auth/me - should delete the current user', async () => {
  const response = await request(app)
    .delete('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(204);

  const deletedUser = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  expect(deletedUser).toBeNull();
});

test('DELETE /api/characters/:id - should delete the character', async () => {
  const deleteResponse = await request(app)
    .delete(`/api/characters/${characterId}`)
    .set('Authorization', `Bearer ${token}`);

  expect(deleteResponse.status).toBe(204);

  const getResponse = await request(app)
    .get(`/api/characters/${characterId}`)
    .set('Authorization', `Bearer ${token}`);

  expect(getResponse.status).toBe(404); // Should return 404 if character was deleted
});

test('PUT /api/characters/:id - should update the character', async () => {
  const characterData = {
    characterName: 'Updated Character',
    characterClass: 'Warrior',
    characterLevel: 6,
    characterImage: 'new-image',
    strength: 12,
    dexterity: 22,
    constitution: 16,
    intelligence: 12,
    wisdom: 12,
    charisma: 18,
    statusPoints: 6,
    abilities: ['sneak', 'steal', 'defend'],
  };

  const updateResponse = await request(app)
    .put(`/api/characters/${characterId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(characterData);

  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.characterName).toBe(characterData.characterName);
});

test('GET /api/users - should return all users', async () => {
  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

// Error handling tests
describe('Error Handling', () => {
  test('POST /api/auth/login - should return 401 for invalid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      username: 'wronguser',
      password: 'wrongpassword',
    });
    expect(response.status).toBe(401);
  });

  test('GET /api/auth/me - should return 401 if not logged in', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  test('GET /api/auth/me - should return 401 for invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_token');
    expect(response.status).toBe(401);
  });
});
