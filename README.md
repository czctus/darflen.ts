# darflen.ts
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg) 

typescript library that interacts with the [Darflen](https://darflen.com/) API

## installation
```bash
# npm
npm i darflen.ts 
# pnpm
pnpm add darflen.ts
# yarn
yarn add darflen.ts
```

## usage
```typescript
import { DarflenClient } from 'darflen.ts'; // ...or const { Darflen } = require('darflen.ts');

const darflen = new DarflenClient();
await darflen.login("token"); // ...or darflen.login("email", "password");
```

## version history
| version | changes |
|---------|---------|
| 0.1.0   | initial release |