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

    it('should return a 400 error if missing username', async () => {
      const response = await request(server).post('/api/auth/register').send({ password: 'pass' });

      expect(response.status).toEqual(400);
    })

    it('should return a 500 error if username already taken', async () => {
      await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });
      const response = await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass2' });

      expect(response.status).toEqual(500);
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

    it('should return a 400 error if missing password', async () => {
      const response = await request(server).post('/api/auth/login').send({ username: 'test' });

      expect(response.status).toEqual(400);
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

    it('should return 400 status when no token provided', async () => {
      const response = await request(server).get('/api/jokes');

      expect(response.status).toEqual(400);
    })

    it('should return 401 status when wrong token provided', async () => {
      await request(server).post('/api/auth/register').send({ username: 'test', password: 'pass' });
      await request(server).post('/api/auth/login').send({ username: 'test', password: 'pass' });
      const response = await request(server).get('/api/jokes').set({ Authorization: 'badtoken4124lkj12l4kh145d343klh'});

      expect(response.status).toEqual(401);
    })
  })
})