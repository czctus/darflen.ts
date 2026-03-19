# darflen.ts
![TypeScript](https://img.shields.io/badge/typescript-5.2-blue.svg) 

typescript library that interacts with the [Darflen](https://darflen.com/) API

## installation
```bash
npm i darflen.ts 
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
| 1.0.0   | initial release |

## features
note that not marked = not implemented but planned

- [ ] posts
    - [x] class for posts
    - [x] get a post (by id)
    - [ ] get post's reposts
    - [ ] delete a post
    - [ ] create/edit a post
        - [ ] text
        - [ ] image
        - [ ] audience
- [ ] users
    - [x] class for users
    - [x] get a user (by id/username)
    - [x] follow/unfollow
    - [x] block/unblock
    - [x] ping /activity endpoint
    - [ ] edit profile
        - [x] display name
        - [x] description
        - [ ] username
        - [ ] profile picture
        - [ ] banner
    - [ ] get followers/following
    - [ ] get user's loves
    - [ ] get user's communities
    - [ ] get user's posts
- [ ] admin (see [this issue](https://github.com/czctus/darflen.ts/issues/1))
    - [ ] (un)ban user
    - [ ] customize user profile
        - [ ] display name
        - [ ] description
        - [ ] username
        - [ ] profile picture
        - [ ] banner
- [ ] comments/replies
- [ ] notifications
- [ ] communities
    - [ ] class for communities
    - [ ] get a community (by id/name)


## api
### `client.posts`
`client.posts.get(id: string): Post` - fetches an post by its id.

`client.posts.feed(type: string, page: number): Page<Post>` - gets a list of posts from a specific feed (e.g, "explore")