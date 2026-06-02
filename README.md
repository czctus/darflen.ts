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

## features
note that not marked = not implemented but planned
- [ ] cache
    - [ ] users
    - [ ] posts
    - [ ] communities
    - [ ] comments/replies
- [ ] statistics api
    - [ ] get general stats ( add note: posts includes private posts )
    - [ ] interactions stats
    - [ ] engagement stats
    - [ ] biggest lovers
    - [ ] biggest posters
- [ ] jsdoc comments for all methods
    - [ ] posts
        - [ ] class
        - [x] namespace
    - [ ] users
        - [ ] class
        - [ ] namespace
    - [ ] communities
        - [ ] class
        - [ ] namespace
    - [ ] darflen moderation
        - [ ] class
        - [ ] namespace
    - [ ] notifications
        - [ ] class
        - [ ] namespace
    - [ ] comments
        - [ ] class
        - [ ] namespace
- [x] posts
    - [x] class for posts
    - [x] get a post ( by id )
    - [x] get post's reposts
    - [X] pin / unpin a post
    - [x] love / unlove a post
    - [x] delete a post
        - [x] from post instance
        - [x] from client.posts
    - [x] get feeds
        - [x] recent
        - [x] loved
        - [x] trending
        - [x] popular
        - [x] following
    - [x] create
        - [x] repost
        - [x] edit
        - [x] text
        - [x] media
        - [x] audience
        - [x] polls
- [ ] users
    - [x] class for users
    - [x] get a user ( by id / username )
    - [x] follow / unfollow
    - [x] block / unblock
    - [x] ping activity endpoint
    - [x] reset password
    - [x] deactivate / reactivate account
    - [x] edit profile
        - [x] display name
        - [x] description
        - [x] username
        - [x] profile picture
        - [x] banner
    - [x] stats
        - [x] get post count
        - [x] get followers count
        - [x] get following count
        - [x] get loves count
        - [x] get community count
    - [ ] um whatever this is called
        - [ ] get user's communities
        - [ ] get user's followers
        - [ ] get user's following
        - [ ] get user's lovers
    - [x] logout
- [ ] comments
    - [ ] class for comments
    - [ ] get replies of a comment
    - [ ] get comments under a post
    - [ ] get a comment
    - [ ] delete a comment
    - [ ] create / edit a comment
        - [ ] reply to a comment
        - [ ] text
        - [ ] media
- [ ] darflen moderation ( see [this issue](https://github.com/czctus/darflen.ts/issues/1) )
    - [ ] class for reports
    - [ ] edit a ban reason
    - [ ] discard token
    - [ ] discard report
    - [ ] (un)ban user
    - [ ] customize post
        - [ ] text
        - [ ] image
        - [ ] audience
    - [ ] customize community
        - [ ] badges ( verified, disabled )
    - [ ] customize user profile
        - [ ] display name
        - [ ] description
        - [ ] username
        - [ ] profile picture
        - [ ] banner
        - [ ] badges ( admin, bug hunter, verified )
- [ ] notifications
    - [ ] class for notifications
    - [ ] get notifications
- [ ] communities
    - [ ] class for communities
    - [ ] get posts in a community
    - [ ] get members of a community
    - [ ] get loves of a community
    - [ ] join / leave a community
    - [ ] get a community ( by id / name )
    - [ ] invite a user to a community
    - [ ] transfer a community to another user
    - [ ] customize / create a community
        - [ ] name
        - [ ] display name
        - [ ] description
        - [ ] profile picture
        - [ ] banner
        - [ ] visibility ( public / private )
        - [ ] external links
    - [ ] community admin features
        - [ ] set rank
        - [ ] delete post
        - [ ] kick / ban user