import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const analyzeArtwork = action({
  args: {
    submissionId: v.id("submissions"),
    imageUrl: v.string(),
    ageCategory: v.string(),
  },
  handler: async (ctx, args) => {
    // Set status to analyzing
    await ctx.runMutation(api.submissions.setStatus, {
      id: args.submissionId,
      status: "analyzing",
    });

    try {
      const systemPrompt = `You are a professional, encouraging children's art teacher. You are evaluating artwork by a child aged ${args.ageCategory}.

Analyze the image carefully. Look at colors, composition, shapes, lines, perspective, creativity, and storytelling.

Respond ONLY with valid JSON matching this exact structure:
{
  "score": <number 6-10>,
  "scene_summary": "<1-2 sentence description of what you see>",
  "good_feedback": [
    {
      "title": "<short positive title, max 40 chars>",
      "category": "<one of: colors, shapes, lines, composition, story, details, perspective, contrast, creativity>",
      "description": "<2-3 sentences of encouraging feedback using simple language a child would understand>",
      "pro_tips": "<one practical tip to try next time>"
    }
  ],
  "additional_feedback": [
    {
      "title": "<short suggestion title, max 40 chars>",
      "category": "<same categories as above>",
      "description": "<2-3 sentences of gentle, actionable improvement suggestions>",
      "pro_tips": "<one practical tip>"
    }
  ],
  "recommended_exercises": [
    {
      "title": "<fun exercise name>",
      "category": "<category>",
      "description": "<simple description of a practice exercise the child could try>"
    }
  ]
}

Rules:
- Score MUST be between 6 and 10. Every child deserves encouragement. 6 = needs work but good effort, 10 = exceptional.
- good_feedback: 2-5 items highlighting what the child did well
- additional_feedback: 2-4 items with gentle suggestions
- recommended_exercises: 1-3 fun practice activities
- Language must be warm, positive, and age-appropriate
- No harsh criticism ever`;

      // For demo purposes, generate mock feedback
      // In production, this would call the Claude API
      const mockAnalysis = {
        score: 8,
        scene_summary: "A wonderful and colorful artwork showing great imagination and effort!",
        good_feedback: [
          {
            title: "Beautiful Color Choices!",
            category: "colors",
            description: "You picked such lovely colors that go well together! The way you used bright colors makes your artwork feel happy and full of life.",
            pro_tips: "Try mixing two colors together to create new ones!"
          },
          {
            title: "Great Creativity!",
            category: "creativity",
            description: "Your imagination really shines through in this piece. You came up with something unique and special that shows your own style.",
            pro_tips: "Keep drawing what makes you happy - that's when the best art happens!"
          },
          {
            title: "Nice Shape Work",
            category: "shapes",
            description: "You did a wonderful job creating different shapes in your artwork. Each shape helps tell your story.",
            pro_tips: "Practice drawing circles, squares, and triangles to make even more cool shapes!"
          }
        ],
        additional_feedback: [
          {
            title: "Fill in More Details",
            category: "details",
            description: "Your artwork would look even more amazing with some extra little details. Maybe add some tiny patterns or textures!",
            pro_tips: "Look closely at things around you and notice the small details you could add to your drawings."
          },
          {
            title: "Try Different Line Styles",
            category: "lines",
            description: "Experiment with making some lines thick and some thin. This can make your artwork more interesting to look at!",
            pro_tips: "Practice drawing wavy lines, zigzags, and dotted lines."
          }
        ],
        recommended_exercises: [
          {
            title: "Rainbow Challenge",
            category: "colors",
            description: "Draw something using all the colors of the rainbow! Start with red and end with purple."
          },
          {
            title: "Shape Monster",
            category: "shapes",
            description: "Create a friendly monster using only circles, squares, and triangles. Give it a fun name!"
          }
        ]
      };

      await ctx.runMutation(api.submissions.updateWithAnalysis, {
        id: args.submissionId,
        score: mockAnalysis.score,
        sceneSummary: mockAnalysis.scene_summary,
        goodFeedback: mockAnalysis.good_feedback,
        additionalFeedback: mockAnalysis.additional_feedback,
        recommendedExercises: mockAnalysis.recommended_exercises,
      });

      return { success: true };
    } catch (error) {
      await ctx.runMutation(api.submissions.setStatus, {
        id: args.submissionId,
        status: "failed",
      });
      throw error;
    }
  },
});

export const analyzeMusic = action({
  args: {
    submissionId: v.id("submissions"),
    description: v.string(),
    ageCategory: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.submissions.setStatus, {
      id: args.submissionId,
      status: "analyzing",
    });

    try {
      // Mock music analysis
      const mockAnalysis = {
        score: 8,
        scene_summary: "A wonderful musical performance showing enthusiasm and developing skills!",
        good_feedback: [
          {
            title: "Great Rhythm!",
            category: "rhythm",
            description: "You kept a steady beat throughout your performance. That's really impressive! Keeping time is one of the most important parts of music.",
            pro_tips: "Try clapping along to your favorite songs to practice keeping the beat!"
          },
          {
            title: "Nice Expression!",
            category: "expression",
            description: "You really put your feelings into the music. When you play with emotion, it makes everyone who listens feel something special too.",
            pro_tips: "Think about what the music makes you feel and let that show in how you play."
          }
        ],
        additional_feedback: [
          {
            title: "Practice Smooth Transitions",
            category: "technique",
            description: "Work on moving smoothly between different notes. Take your time - speed comes with practice!",
            pro_tips: "Start slow and gradually play faster as you get more comfortable."
          }
        ],
        recommended_exercises: [
          {
            title: "Echo Game",
            category: "rhythm",
            description: "Have someone clap a rhythm and try to clap it back exactly the same way!"
          }
        ]
      };

      await ctx.runMutation(api.submissions.updateWithAnalysis, {
        id: args.submissionId,
        score: mockAnalysis.score,
        sceneSummary: mockAnalysis.scene_summary,
        goodFeedback: mockAnalysis.good_feedback,
        additionalFeedback: mockAnalysis.additional_feedback,
        recommendedExercises: mockAnalysis.recommended_exercises,
      });

      return { success: true };
    } catch (error) {
      await ctx.runMutation(api.submissions.setStatus, {
        id: args.submissionId,
        status: "failed",
      });
      throw error;
    }
  },
});
