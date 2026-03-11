# darflen.ts
![TypeScript](https://img.shields.io/badge/typescript-5.2-blue.svg) 

typescript library that interacts with the [Darflen](https://darflen.com/) API

## installation
```bash
npm i darflen.ts 
```

## usage
```typescript
import { Darflen } from 'darflen.ts'; // or const { Darflen } = require('darflen.ts');

const darflen = new Darflen({
    token: "your_api_token" // optional. you can also set it later via darflen.login("your_api_token")
});
```

## version history
| version | changes |
|---------|---------|
| 1.0.0   | initial release |

## api
### `client.posts`
`client.posts.get(id: string): Post` - fetches an post by its id.

`client.posts.feed(type: string, page: number): Page<Post>` - gets a list of posts from a specific feed (e.g, "explore")