// server.js
require('dotenv').config()
const app = require('./app');
const port = 80;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
