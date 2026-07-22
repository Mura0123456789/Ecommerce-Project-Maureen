import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Used in tests via src/setupTests.js
export const server = setupServer(...handlers);
