export enum Code {
    /** the api request was successful */
    Success = "success",
    /** the api request failed */
    Fail = "fail",
    
}

export enum Audience {
    /** the post will be visible to everyone, including on the explore page and in search results. */
    Public = "public",
    /** the post will only be visible to followers, and won't appear on the explore page or in search results, only on profile or feed */
    Followers = "followers",
    /** the post will only be visible to the author, and won't appear on the explore page or in search results, only on profile */
    Private = "private",
    /** the post will be visible to everyone with the link, but won't appear on the explore page or in search results */
    Unlisted = "unlisted"
}

export enum UserStatus {
    /** the user is currently online */
    Online = "active",
    /** the user is currently idle (and not on the site in general) */
    Idle = "inactive",
    /** the user is currently offline */
    Offline = "offline"
}

export enum FeedType {
    /** the feed will be sorted by creation date (newest first) */
    Recent = "recent",
    /** the feed will be sorted by engagement (most engagements first) */
    Trending = "trending",
    /** the feed will be sorted by loves (most liked first) */
    Loves = "loved",
    /** the feed will be sorted by views (most viewed first) */
    Views = "popular"
}

export enum NotificationType {
    /** someone you're following posted something */
    Post = "post",
    /** someone you're following reposted something */
    Repost = "repost",
    /** someone loved your post */
    PostLove = "post_love",
    /** someone commented on your post */
    Comment = "comment",
    /** someone loved your reply */
    ReplyLove = "reply_love",
    /** someone loved your comment */
    CommentLove = "comment_love",
    /** someone replied to your reply */
    Reply = "reply",
    /** someone followed you */
    Follow = "user_follow",
    /** someone mentioned you in a comment */
    CommentMention = "comment_mention",
    /** someone mentioned you in a post */
    PostMention = "post_mention",
    /** someone invited you to a community */
    CommunityInvite = "community_invite"
}