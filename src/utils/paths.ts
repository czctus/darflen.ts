import { PrimitiveFeedType } from "../types/api/post.js";

export const urlPath = {
    post: {
        create: () => `/posts/create`,
        repost: (id: string) => `/posts/${id}/repost`,
        data: (id: string) => `/posts/${id}`,
        love: (id: string) => `/posts/${id}/love`,
        pin: (id: string) => `/posts/${id}/pin`,
        delete: (id: string) => `/posts/${id}/delete`,
        edit: (id: string) => `/posts/${id}/edit`,
        feed: (feedType: PrimitiveFeedType, page: number, size?: number) => `/explore/${feedType}/get/${page}${size ? `/${size}` : ""}`,
        reposts: (id: string, page: number, size?: number) => `/posts/${id}/reposts/${page}${size ? `/${size}` : ""}`
    },
    polls: {
        vote: (postId: string) => `/polls/${postId}/vote`
    },
    user: {
        activity: () => `/activity`,
        data: (username: string) => `/users/${username}`,
        dataById: (id: string) => `/users/$${id}`, // $ is intentional here, because the api uses it to differentiate between username and id
        posts: (username: string, page: number, size?: number) => `/users/${username}/posts/${page}${size ? `/${size}` : ""}`,
        follow: (username: string) => `/users/${username}/follow`,
        block: (username: string) => `/users/${username}/block`,
        myself: () => `/me`
    },
    auth: {
        login: () => `/auth/login`,
        logout: () => `/auth/logout`,
        register: () => `/auth/register`,
        updateUsername: () => `/auth/username/change`,
        updatePassword: () => `/auth/password/change`
    },
    settings: {
        customization: () => `/settings/customization`
    },
    statistics: {
        general: () => `/statistics`,
        engagement: (user?: string) => `/statistics/engagements${user ? `?user=${user}` : ""}`,
        interactions: (user?: string) => `/statistics/interactions${user ? `?user=${user}` : ""}`,
        biggestPosters: () => `/statistics/biggest_posters`,
        biggestLovers: () => `/statistics/biggest_lovers`
    }
} as const;