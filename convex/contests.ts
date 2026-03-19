import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contests")
      .withIndex("by_status")
      .order("desc")
      .collect();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const contests = await ctx.db.query("contests").collect();
    return contests.filter(
      (c) => c.status === "active" && c.endDate > now
    );
  },
});

export const get = query({
  args: { id: v.id("contests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getLeaderboard = query({
  args: { contestId: v.id("contests") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("contestEntries")
      .withIndex("by_contest", (q) => q.eq("contestId", args.contestId))
      .collect();

    const leaderboard = await Promise.all(
      entries
        .filter((e) => e.score !== undefined)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 10)
        .map(async (entry) => {
          const child = await ctx.db.get(entry.childId);
          return {
            childName: child?.name ?? "Unknown",
            avatarId: child?.avatarId ?? 0,
            score: entry.score ?? 0,
          };
        })
    );

    return leaderboard;
  },
});

export const enter = mutation({
  args: {
    contestId: v.id("contests"),
    childId: v.id("children"),
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== userId) throw new Error("Not authorized");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");

    // Check if already entered
    const existingEntry = await ctx.db
      .query("contestEntries")
      .withIndex("by_contest", (q) => q.eq("contestId", args.contestId))
      .filter((q) => q.eq(q.field("childId"), args.childId))
      .first();

    if (existingEntry) throw new Error("Already entered this contest");

    return await ctx.db.insert("contestEntries", {
      contestId: args.contestId,
      childId: args.childId,
      submissionId: args.submissionId,
      score: submission.score,
      createdAt: Date.now(),
    });
  },
});

// Seed some demo contests
export const seedContests = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("contests").first();
    if (existing) return; // Already seeded

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("contests", {
      title: "Spring Art Festival 2024",
      description: "Show us your best spring-themed artwork! Draw flowers, sunshine, butterflies, or anything that reminds you of spring.",
      type: "art",
      ageCategories: ["4-6", "7-9", "10-12", "13-15", "16-18"],
      entryFee: 0,
      currency: "USD",
      startDate: now,
      endDate: now + oneWeek * 2,
      maxParticipants: 500,
      status: "active",
      createdAt: now,
    });

    await ctx.db.insert("contests", {
      title: "Young Musicians Showcase",
      description: "Perform your favorite piece of music! All instruments and singing welcome.",
      type: "music",
      ageCategories: ["7-9", "10-12", "13-15"],
      entryFee: 0,
      currency: "USD",
      startDate: now,
      endDate: now + oneWeek * 3,
      maxParticipants: 200,
      status: "active",
      createdAt: now,
    });

    await ctx.db.insert("contests", {
      title: "Fantasy World Drawing",
      description: "Create your own fantasy world! Dragons, unicorns, magical castles - let your imagination run wild!",
      type: "art",
      ageCategories: ["4-6", "7-9", "10-12"],
      entryFee: 0,
      currency: "USD",
      startDate: now + oneWeek,
      endDate: now + oneWeek * 4,
      maxParticipants: 300,
      status: "upcoming",
      createdAt: now,
    });
  },
});
