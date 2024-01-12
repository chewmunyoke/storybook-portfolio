import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

import '@testing-library/jest-dom';
