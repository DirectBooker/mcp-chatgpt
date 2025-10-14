import { createTypeScriptResource } from './typescript-resource-factory.js';

// Export the resource definition using the factory
export const typescriptReactSampleResource = createTypeScriptResource({
  filename: 'react-sample',
  uriId: 'react-sample',
  name: 'React TypeScript Sample',
  description: 'React TypeScript component with JSX, hooks, event handling, and modern React patterns including useState, useCallback, useMemo, and Google search integration'
});
