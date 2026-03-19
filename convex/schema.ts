import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Children profiles managed by parents
  children: defineTable({
    parentId: v.id("users"),
    name: v.string(),
    dateOfBirth: v.string(),
    ageCategory: v.string(),
    avatarId: v.number(),
    coins: v.number(),
    createdAt: v.number(),
  }).index("by_parent", ["parentId"]),

  // Art/music submissions
  submissions: defineTable({
    childId: v.id("children"),
    type: v.union(v.literal("art"), v.literal("music")),
    fileId: v.string(),
    thumbnailUrl: v.optional(v.string()),
    score: v.optional(v.number()),
    sceneSummary: v.optional(v.string()),
    goodFeedback: v.optional(v.array(v.object({
      title: v.string(),
      category: v.string(),
      description: v.string(),
      pro_tips: v.string(),
    }))),
    additionalFeedback: v.optional(v.array(v.object({
      title: v.string(),
      category: v.string(),
      description: v.string(),
      pro_tips: v.string(),
    }))),
    recommendedExercises: v.optional(v.array(v.object({
      title: v.string(),
      category: v.string(),
      description: v.string(),
    }))),
    status: v.union(v.literal("pending"), v.literal("analyzing"), v.literal("done"), v.literal("failed")),
    contestId: v.optional(v.id("contests")),
    createdAt: v.number(),
  }).index("by_child", ["childId"])
    .index("by_status", ["status"])
    .index("by_child_and_type", ["childId", "type"]),

  // Competitions
  contests: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("art"), v.literal("music")),
    ageCategories: v.array(v.string()),
    entryFee: v.number(),
    currency: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    maxParticipants: v.number(),
    status: v.union(v.literal("upcoming"), v.literal("active"), v.literal("judging"), v.literal("completed")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // Contest entries
  contestEntries: defineTable({
    contestId: v.id("contests"),
    childId: v.id("children"),
    submissionId: v.id("submissions"),
    score: v.optional(v.number()),
    rank: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_contest", ["contestId"])
    .index("by_child", ["childId"]),

  // Achievement badges
  achievements: defineTable({
    childId: v.id("children"),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    iconName: v.string(),
    earnedAt: v.number(),
  }).index("by_child", ["childId"]),

  // Avatar accessories
  accessories: defineTable({
    name: v.string(),
    type: v.union(v.literal("hat"), v.literal("frame"), v.literal("badge"), v.literal("background")),
    imageUrl: v.string(),
    price: v.number(),
    requiredLevel: v.optional(v.number()),
  }),

  // Purchased/equipped accessories
  childAccessories: defineTable({
    childId: v.id("children"),
    accessoryId: v.id("accessories"),
    equipped: v.boolean(),
    purchasedAt: v.number(),
  }).index("by_child", ["childId"]),
});
