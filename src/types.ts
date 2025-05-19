import type { Stats } from 'fs';

export interface Entry {
  basename: string;
  path: string;
  fullPath: string;
  stats?: Stats;
}
