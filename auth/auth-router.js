const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const db = require('../database/dbConfig.js');
const generateToken = require('./generateToken.js');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if(!username || !password) return res.status(400).json({ error: 'Provide both a username and password' });

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

  if (!username || !password) return res.status(400).json({ error: 'Provide both a username and password' });

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


module.exports = router;
