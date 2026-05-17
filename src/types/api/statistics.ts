import type { APISuccessResponse } from "./request.js";

export type ChartFormat<Children extends string> = {
    [key in Children]: number[];
} & {
    labels: string[];
};

export type APISuccessfulStatisticsResponse = APISuccessResponse<{ data: GeneralStatistics }>;
export type APISuccessfulInteractionsResponse = APISuccessResponse<{ data: Interactions }>;
export type APISuccessfulEngagementsResponse = APISuccessResponse<{ data: Engagements }>;
export type APISuccessfulBiggestPostersResponse = APISuccessResponse<{ data: Biggest }>;
export type APISuccessfulBiggestLoversResponse = APISuccessResponse<{ data: Biggest }>;

export type Interactions = ChartFormat<"posts" | "comments" | "replies">;
export type Engagements = ChartFormat<"interactions" | "votes" | "loves">;

export type Biggest = ChartFormat<"users"> & { // biggest_posters, biggest_lovers... same format
    aaa: {
        id: string;
        username: string;
        count: number;
    }[];
}
export interface GeneralStatistics {
    users: number;
    posts: number;
    loves: number;
    votes: number;
    communities: number;
}