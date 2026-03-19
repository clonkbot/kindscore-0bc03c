import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { childId: v.id("children") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return [];

    return await ctx.db
      .query("achievements")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .collect();
  },
});

export const checkAndAward = mutation({
  args: { childId: v.id("children") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) return [];

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .filter((q) => q.eq(q.field("status"), "done"))
      .collect();

    const existingAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .collect();

    const existingTypes = new Set(existingAchievements.map((a) => a.type));
    const newAchievements: Array<{type: string; title: string; description: string; iconName: string}> = [];

    // First Steps - first submission
    if (submissions.length >= 1 && !existingTypes.has("first_steps")) {
      newAchievements.push({
        type: "first_steps",
        title: "First Steps",
        description: "Completed your first submission!",
        iconName: "star",
      });
    }

    // Art Explorer - 5 art submissions
    const artCount = submissions.filter((s) => s.type === "art").length;
    if (artCount >= 5 && !existingTypes.has("art_explorer")) {
      newAchievements.push({
        type: "art_explorer",
        title: "Art Explorer",
        description: "Submitted 5 artworks!",
        iconName: "palette",
      });
    }

    // Music Star - 5 music submissions
    const musicCount = submissions.filter((s) => s.type === "music").length;
    if (musicCount >= 5 && !existingTypes.has("music_star")) {
      newAchievements.push({
        type: "music_star",
        title: "Music Star",
        description: "Submitted 5 music performances!",
        iconName: "music",
      });
    }

    // Perfect 10 - received a score of 10
    const hasPerfectScore = submissions.some((s) => s.score === 10);
    if (hasPerfectScore && !existingTypes.has("perfect_10")) {
      newAchievements.push({
        type: "perfect_10",
        title: "Perfect 10!",
        description: "Received a perfect score of 10!",
        iconName: "trophy",
      });
    }

    // Creative Superstar - 20 total submissions
    if (submissions.length >= 20 && !existingTypes.has("creative_superstar")) {
      newAchievements.push({
        type: "creative_superstar",
        title: "Creative Superstar",
        description: "Completed 20 submissions!",
        iconName: "sparkles",
      });
    }

    // Insert new achievements
    for (const achievement of newAchievements) {
      await ctx.db.insert("achievements", {
        childId: args.childId,
        type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        iconName: achievement.iconName,
        earnedAt: Date.now(),
      });
    }

    return newAchievements;
  },
});
