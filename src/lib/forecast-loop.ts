import type { PostEntry } from "./content";
import type { ForecastLoopData } from "./content/schemas";

export type { ForecastLoopData };
export type ForecastScore = ForecastLoopData["score"];

export const FORECAST_SCORE_LABEL: Record<ForecastScore, string> = {
  hit: "맞음",
  partial: "부분",
  miss: "틀림",
  pending: "미채점",
};

export function postSlug(post: Pick<PostEntry, "id">): string {
  return post.id.replace(/\.md$/, "");
}

export function isGuidePost(post: Pick<PostEntry, "data">): boolean {
  return post.data.tags.includes("교육");
}

export function isScorecardPost(post: Pick<PostEntry, "id" | "data">): boolean {
  return post.id.includes("scorecard") || post.data.title.includes("채점");
}

export function hasForecastLoop(post: Pick<PostEntry, "data">): post is PostEntry & {
  data: PostEntry["data"] & { loop: ForecastLoopData };
} {
  return post.data.loop != null;
}

export function latestPostWithLoop(posts: PostEntry[]): PostEntry | undefined {
  return [...posts]
    .filter(hasForecastLoop)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())[0];
}

export function latestDailyWithLoop(posts: PostEntry[]): PostEntry | undefined {
  return [...posts]
    .filter((post) => hasForecastLoop(post) && !isGuidePost(post) && !isScorecardPost(post))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())[0];
}

export function scorecardPosts(posts: PostEntry[]): PostEntry[] {
  return [...posts]
    .filter((post) => isScorecardPost(post))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
