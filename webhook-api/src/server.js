const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;
const bcrypt = require('bcrypt');

const app = express();

// use plain text for simplicity, you shouldn't put secrets in code :p
const ADMIN_SECRET = 'myadminsecretkey';
const SECRET = 'this is a secret';
const HASURA_URL = 'http://localhost:8080/v1/graphql';

const userQuery = `
query user($where: user_bool_exp) {
  user(where: $where) {
    id
    password
  }
}
`;

const createUserQuery = `
mutation createUser($object: user_insert_input!) {
  insert_user_one(object:$object) {
    id
    created_at
  }
}
`;

const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(hash);
    });
  });
};

const comparePassword = async (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function(err, res) {
      if (err) {
        reject(err);
        return;
      }
      resolve(res === true);
    });
  });
};

const createUser = async ({ username, password, full_name }) => {
  const response = await axios.post(HASURA_URL, {
    query: createUserQuery,
    variables: {
      object: {
        username, password, full_name
      }
    }
  }, {
    headers: {
      'x-hasura-admin-secret': ADMIN_SECRET,
    }
  });
  return response.data.data.insert_user_one;
};

const getUser = async (username, password) => {
  const response = await axios.post(HASURA_URL, {
    query: userQuery, variables: {
      where: {
        username: {
          _eq: username,
        },
        password: password ? {
          _eq: password,
        } : {}
      }
    },
  }, {
    headers: {
      'x-hasura-admin-secret': ADMIN_SECRET,
    }
  });
  const users = response.data.data.user;
  if (users && users.length > 0) {
    return users[0];
  }
  return null;
};

app.use(express.json());

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.post('/authenticate', async function (req, res) {
  const { user } = req.body.input;
  const username = user.username;
  const password = user.password;
  const existingUser = await getUser(username);
  const isValid = await comparePassword(password, existingUser.password);
  if (!isValid) {
    res.status(401).send({ message: 'incorrect username or password' });
    return;
  }
  const token = jwt.sign({ user_id: user.id }, SECRET);
  res.send({
    token,
  });
});

app.post('/register', async function (req, res) {
  const { user } = req.body.input;
  const username = user.username;
  const password = user.password;
  const full_name = user.full_name;
  const existingUser = await getUser(username);
  if (existingUser) {
    return res.status(400).send({
      message: 'user already exists!',
    });
  }

  const hashedPassword = await hashPassword(password);
  const response = await createUser({
    username, password: hashedPassword, full_name,
  });
  res.send(response);
});

app.get('/authorize', function (req, res) {
  if (!req.headers.authorization) {
    res.send({
      'X-Hasura-Role': 'guest'
    });
    return;
  }
  try {
    const token = req.headers.authorization.replace(/^Bearer /g, '');
    const decoded = jwt.verify(token, SECRET);
    res.send({
      'X-Hasura-User-Id': `${decoded.user_id}`,
      'X-Hasura-Role': 'user'
    });
  } catch (e) {
    res.send({
      'X-Hasura-Role': 'guest'
    });
  }
});

app.listen(3000);