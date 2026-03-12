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
  expect(databaseInfo.version).toEqual("16.0");
  expect(databaseInfo.max_connections).toBeDefined();
  expect(databaseInfo.opened_connections).toBeDefined();
  expect(databaseInfo.opened_connections).toBeGreaterThanOrEqual(1);
});
