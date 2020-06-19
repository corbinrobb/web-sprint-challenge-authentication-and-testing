const request = require('supertest');

const server = require('./server.js');
const db = require('../database/dbConfig.js');
const { intersect } = require('../database/dbConfig.js');


describe('auth-router.js', () => {
  beforeEach(async () => {
    await db('users').truncate();
  })

  it('should use testing environment', () => {
    expect(process.env.DB_ENV).toBe('testing');
  })

  describe('should register and return new user', () => {
    it('should recieve 201 status on success', async () => {
      const response = await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });

      expect(response.status).toEqual(201);
    })

    it('should return object with username on success', async () => {
      const response = await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });

      expect(response.body).toHaveProperty('username', "test");
    })
  })

  describe('should login user and return token', () => {
    it('should recieve 200 status on success', async () => {
      await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });
      const response = await request(server).post('/api/auth/login').send({ username: 'test', password: 'pass' });

      expect(response.status).toEqual(200);
    })

    it('should return message on success', async () => {
      await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });
      const response = await request(server).post('/api/auth/login').send({ username: 'test', password: 'pass' });

      expect(response.body).toHaveProperty('message', "Welcome test");
    })

    it('should return token on success', async () => {
      await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });
      const response = await request(server).post('/api/auth/login').send({ username: 'test', password: 'pass' });

      expect(response.body).toHaveProperty('token');
    })
  })


  describe('should return jokes on /api/jokes get request', () => {
    it('should recieve 200 status on success', async () => {
      await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });
      const userResponse = await request(server).post('/api/auth/login').send({ username: 'test', password: 'pass' });
      const response = await request(server).get('/api/jokes').set({ Authorization: userResponse.body.token });

      expect(response.status).toEqual(200);
    })

    it('should return  array of 20 jokes', async () => {
      await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });
      const userResponse = await request(server).post('/api/auth/login').send({ username: 'test', password: 'pass' });
      const response = await request(server).get('/api/jokes').set({ Authorization: userResponse.body.token });

      expect(response.body).toHaveLength(20);
    })
  })
})