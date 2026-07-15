# darflen.ts
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg) 

typescript library that interacts with the [Darflen](https://darflen.com/) API

## disclaimer

> [!WARNING]
> this project is not affiliated with, nor endorsed by, darflen or its developers; this is an independent project.

> [!WARNING]
> this repo is in initial development; everything is subjected to change, you are expected to watch out for breaking changes and update your code accordingly.

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

## license
[MIT](LICENSE)