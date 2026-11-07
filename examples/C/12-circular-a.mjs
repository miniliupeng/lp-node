import { bName, readADuringCall } from './12-circular-b.mjs';

export const aName = 'module-a';

export function fromB() {
  return { bName, seen: readADuringCall() };
}
