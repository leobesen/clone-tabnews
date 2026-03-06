test("GET to /api/v1/status deve retornar status 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
});

test("GET to /api/v1/status deve retornar status 'ok'", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const data = await response.json();
  expect(data.status).toBe('ok');
});

test("GET to /api/v1/status deve retornar um timestamp válido", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const data = await response.json();
  expect(new Date(data.timestamp).toString()).not.toBe('Invalid Date');
});