require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  testConnection()
    .then(() => {
      console.log('MySQL connection successful');
    })
    .catch((error) => {
      console.error(
        'MySQL connection failed:',
        error.code || error.message || 'unknown error'
      );
    });
});
