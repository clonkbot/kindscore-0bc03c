import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function calculateAgeCategory(dateOfBirth: string): string {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age >= 4 && age <= 6) return "4-6";
  if (age >= 7 && age <= 9) return "7-9";
  if (age >= 10 && age <= 12) return "10-12";
  if (age >= 13 && age <= 15) return "13-15";
  if (age >= 16 && age <= 18) return "16-18";
  return "4-6"; // Default for younger
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("children")
      .withIndex("by_parent", (q) => q.eq("parentId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("children") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const child = await ctx.db.get(args.id);
    if (!child || child.parentId !== userId) return null;
    return child;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    dateOfBirth: v.string(),
    avatarId: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ageCategory = calculateAgeCategory(args.dateOfBirth);

    return await ctx.db.insert("children", {
      parentId: userId,
      name: args.name,
      dateOfBirth: args.dateOfBirth,
      ageCategory,
      avatarId: args.avatarId,
      coins: 0,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("children"),
    name: v.optional(v.string()),
    avatarId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const child = await ctx.db.get(args.id);
    if (!child || child.parentId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.avatarId !== undefined) updates.avatarId = args.avatarId;

    await ctx.db.patch(args.id, updates);
  },
});

export const addCoins = mutation({
  args: {
    id: v.id("children"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const child = await ctx.db.get(args.id);
    if (!child || child.parentId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, {
      coins: child.coins + args.amount,
    });
  },
});
