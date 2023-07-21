// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
// Create app
const app = express();
// Add other middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
// Routes
app.use('/posts', require('./routes/posts'));
// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```
posts.js
```
// Path: routes/posts.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

const posts = {};
router.get('/', (req, res) => {
  res.send(posts);
});

router.post('/', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;
  posts[id] = {
    id,
    title,
  };
  await axios.post('http://localhost:4005/events', {
    type: 'PostCreated',
    data: {
      id,
      title,
    },
  });
  res.status(201).send(posts[id]);
});

router.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);
  res.send({});
});

module.exports = router;
```
events.js
```
// Path: events.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

app.post('/events', (req, res) => {
  const event = req.body;
  axios.post('http://localhost:4000/events', event);
  axios.post('http://localhost:4001/events', event);
  axios.post('http://localhost:4002/events', event);
  res.send({ status: 'OK' });
});

app.listen(4005, () => {
  console.log('Listening on