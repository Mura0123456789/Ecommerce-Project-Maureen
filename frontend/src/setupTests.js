// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Start the MSW mock server before all tests, reset handlers between
// tests so one test's mocked response can't leak into another, and
// close it down once the whole suite finishes.
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
