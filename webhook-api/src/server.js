const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;

const app = express();

// use plain text for simplicity, you shouldn't put secrets in code :p
const ADMIN_SECRET = 'myadminsecretkey';
const SECRET = 'this is a secret';

const userQuery = `
query user($where: user_bool_exp) {
  user(where: $where) {
    id
  }
}
`;


const getUser = async (username, password) => {
  const response = await axios.post('http://localhost:8080/v1/graphql', {
    'query': userQuery, 'variables': {
      where: {
        username: {
          _eq: username,
        },
        password: {
          _eq: password,
        }
      }
    },
  }, {
    headers: {
      'x-hasura-admin-secret': ADMIN_SECRET,
    }
  });
  const users = response.data?.data?.user;
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
  const username = req.body.username;
  const password = req.body.password;
  const user = await getUser(username, password);
  if (user.length === 0) {
    res.status(401).send({ error: 'incorrect username or password' });
    return;
  }
  const token = jwt.sign({ user_id: user.id }, SECRET);
  res.send({
    token,
  });
});

app.post('/authorize', function (req, res) {
  const token = req.headers.authorization.replace(/^Bearer /g, '');
  const decoded = jwt.verify(token, SECRET);
  res.send({
    'X-Hasura-User-Id': decoded.user_id,
    'X-Hasura-Role': 'user'
  });
});

app.listen(3000);