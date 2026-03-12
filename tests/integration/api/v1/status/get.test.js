test("GET to /api/v1/status deve retornar status 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.updated_at).toBeDefined();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(parsedUpdatedAt).toEqual(responseBody.updated_at);
  
  expect(responseBody.dependencies).toBeDefined();
  const databaseInfo = responseBody.dependencies.database;
  expect(databaseInfo).toBeDefined();
  expect(databaseInfo.version).toBeDefined();
  expect(databaseInfo.version).toEqual('16.0');
  expect(databaseInfo.max_connections).toBeDefined();
  expect(databaseInfo.connections_used).toBeDefined();

});

// test("GET to /api/v1/status deve retornar status 'ok'", async () => {
//   const response = await fetch("http://localhost:3000/api/v1/status");
//   const data = await response.json();
//   expect(data.status).toBe('ok');
// });

// test("GET to /api/v1/status deve retornar um timestamp válido", async () => {
//   const response = await fetch("http://localhost:3000/api/v1/status");
//   const data = await response.json();
//   expect(new Date(data.timestamp).toString()).not.toBe('Invalid Date');
// });