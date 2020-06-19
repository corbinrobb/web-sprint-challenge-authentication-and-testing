const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/dbConfig.js');
const secrets = require('../config/secrets.js');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const hash = bcryptjs.hashSync(password, process.env.HASH_ROUNDS || 8);

  try {
    await db('users').insert({ username, password: hash })
    const user = await db('users').where({ username }).first();
    res.status(201).json(user);
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: 'Could not add user to database' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db('users').where({ username }).first();
    if(user && bcryptjs.compareSync(password, user.password)) {
      const token = generateToken(user);
      res.status(200).json({ message: `Welcome ${user.username}`, token });
    } else {
      res.status(401).json({ error: 'Password is incorrect' });
    }
  } catch(err) {
    console.log(err);
    res.status(500).json({ message: "Could not find user in database" });
  }
});


function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  }

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}


module.exports = router;
