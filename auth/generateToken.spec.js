const generateToken = require('./generateToken.js');
const { expectCt } = require('helmet');

describe('Generate Token', () => {
  describe('tests that function works as expected', () => {
    it('returns a token', async () => {
      const token = await generateToken({ username: 'name' });

      expect(token).toBeTruthy();
    })
  })
})