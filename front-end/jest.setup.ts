import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock XMLHttpRequest
const mockXMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: JSON.stringify({}),
  onreadystatechange: jest.fn(),
}));

// Add static properties to the mock using Object.defineProperty
Object.defineProperty(mockXMLHttpRequest, 'UNSENT', { value: 0, writable: false });
Object.defineProperty(mockXMLHttpRequest, 'OPENED', { value: 1, writable: false });
Object.defineProperty(mockXMLHttpRequest, 'HEADERS_RECEIVED', { value: 2, writable: false });
Object.defineProperty(mockXMLHttpRequest, 'LOADING', { value: 3, writable: false });
Object.defineProperty(mockXMLHttpRequest, 'DONE', { value: 4, writable: false });

// Assign the mock to global.XMLHttpRequest
global.XMLHttpRequest = mockXMLHttpRequest as unknown as typeof XMLHttpRequest;