import database from '../../../../infra/database.js';

async function status(request, response) {
  const res = await database.query('SELECT 1 + 1;');
  console.log('Database response: ', res)
  response.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}

export default status;