import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const list = query({
  args: { childId: v.id("children") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return [];

    return await ctx.db
      .query("submissions")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .order("desc")
      .collect();
  },
});

export const getRecent = query({
  args: { childId: v.id("children"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return [];

    return await ctx.db
      .query("submissions")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .order("desc")
      .take(args.limit ?? 5);
  },
});

export const get = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const submission = await ctx.db.get(args.id);
    if (!submission) return null;

    const child = await ctx.db.get(submission.childId);
    if (!child || child.parentId !== userId) return null;

    return submission;
  },
});

export const create = mutation({
  args: {
    childId: v.id("children"),
    type: v.union(v.literal("art"), v.literal("music")),
    fileId: v.string(),
    contestId: v.optional(v.id("contests")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) throw new Error("Not found");

    return await ctx.db.insert("submissions", {
      childId: args.childId,
      type: args.type,
      fileId: args.fileId,
      status: "pending",
      contestId: args.contestId,
      createdAt: Date.now(),
    });
  },
});

export const updateWithAnalysis = mutation({
  args: {
    id: v.id("submissions"),
    score: v.number(),
    sceneSummary: v.string(),
    goodFeedback: v.array(v.object({
      title: v.string(),
      category: v.string(),
      description: v.string(),
      pro_tips: v.string(),
    })),
    additionalFeedback: v.array(v.object({
      title: v.string(),
      category: v.string(),
      description: v.string(),
      pro_tips: v.string(),
    })),
    recommendedExercises: v.array(v.object({
      title: v.string(),
      category: v.string(),
      description: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.id);
    if (!submission) throw new Error("Submission not found");

    // Clamp score to 6-10 range
    const clampedScore = Math.max(6, Math.min(10, args.score));

    await ctx.db.patch(args.id, {
      score: clampedScore,
      sceneSummary: args.sceneSummary,
      goodFeedback: args.goodFeedback,
      additionalFeedback: args.additionalFeedback,
      recommendedExercises: args.recommendedExercises,
      status: "done",
    });

    // Award coins: 1 base + bonus for high scores
    let coinsToAdd = 1;
    if (clampedScore === 9) coinsToAdd += 2;
    if (clampedScore === 10) coinsToAdd += 5;

    const child = await ctx.db.get(submission.childId);
    if (child) {
      await ctx.db.patch(submission.childId, {
        coins: child.coins + coinsToAdd,
      });
    }

    return { score: clampedScore, coinsAwarded: coinsToAdd };
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("submissions"),
    status: v.union(v.literal("pending"), v.literal("analyzing"), v.literal("done"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const getStats = query({
  args: { childId: v.id("children") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return null;

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .filter((q) => q.eq(q.field("status"), "done"))
      .collect();

    if (submissions.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        artCount: 0,
        musicCount: 0,
      };
    }

    const scores = submissions.map((s) => s.score ?? 0);
    const artCount = submissions.filter((s) => s.type === "art").length;
    const musicCount = submissions.filter((s) => s.type === "music").length;

    return {
      totalSubmissions: submissions.length,
      averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      highestScore: Math.max(...scores),
      artCount,
      musicCount,
    };
  },
});
