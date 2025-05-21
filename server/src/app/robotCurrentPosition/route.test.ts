/**
 * @jest-environment node
 */
import { GET, POST } from './route';

it('should return data with status 200', async () => {
  const mockRequest = new Request('http://localhost');
  const response = await GET(mockRequest);
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      x: expect.any(Number),
      y: expect.any(Number),
      direction: expect.any(String),
    })
  );
});

it('should return data with status 201', async () => {
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // POST request payload
      x: 4,
      y: 1,
      direction: 'south',
    }),
  });
  const response = await POST(mockRequest);
  const body = await response.json();

  expect(response.status).toBe(201);
  expect(body).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      x: expect.any(Number),
      y: expect.any(Number),
      direction: expect.any(String),
    })
  );
});

it('should return 400 if x, y, or direction is missing', async () => {
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x: 3, direction: 'north' }), // Missing y
  });
  const response = await POST(mockRequest);
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body).toEqual(
    expect.objectContaining({
      error: 'x, y, and direction are required',
    })
  );
});

it('should return 400 if direction is invalid', async () => {
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x: 3, y: 3, direction: 'invalid' }), // Invalid direction
  });
  const response = await POST(mockRequest);
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body).toEqual(
    expect.objectContaining({
      error: 'Invalid direction',
    })
  );
});

it('should return 400 if x or y is not a number', async () => {
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x: 'not-a-number', y: 3, direction: 'north' }), // x is not a number
  });
  const response = await POST(mockRequest);
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body).toEqual(
    expect.objectContaining({
      error: 'x and y must be numbers',
    })
  );
});

it('should return 400 if x or y is out of range', async () => {
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x: 6, y: 3, direction: 'north' }), // x is out of range
  });
  const response = await POST(mockRequest);
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body).toEqual(
    expect.objectContaining({
      error: 'x and y must be between 0 and 4',
    })
  );
});