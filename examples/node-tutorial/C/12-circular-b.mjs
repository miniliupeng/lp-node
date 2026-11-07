import { aName } from './12-circular-a.mjs';

export const bName = 'module-b';

export function readADuringCall() {
  return aName;
}
