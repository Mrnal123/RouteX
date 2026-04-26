import { v } from "convex/values";
import { action, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const appendExplanation = internalMutation({
  args: {
    logId: v.id("decisionLogs"),
    explanation: v.string(),
  },
  handler: async (ctx, args) => {
    // Update the reasoning field on the existing decision log
    await ctx.db.patch(args.logId, {
      reasoning: args.explanation,
    });
  },
});

export const requestExplanation = action({
  args: {
    logId: v.id("decisionLogs"),
    routeId: v.id("routes"),
    oldEtaMinutes: v.number(),
    newEtaMinutes: v.number(),
    disruptionType: v.string(),
    blockedEdge: v.optional(v.string()), 
    routeSummary: v.string(),
  },
  handler: async (ctx, args) => {
    let explanation = "";

    if (!GEMINI_API_KEY) {
      // ----------------------------------------------------
      // Local Template Fallback Strategy
      // ----------------------------------------------------
      const etaDiff = args.newEtaMinutes - args.oldEtaMinutes;
      const timingWord = etaDiff > 0 ? `adding ${etaDiff} mins` : `saving ${Math.abs(etaDiff)} mins`;
      
      let baseString = `Rerouted dynamically due to a ${args.disruptionType.replace("-", " ")}. The new optimized path modifies the ETA by ${timingWord}. `;
      if (args.blockedEdge) {
        baseString += `Specifically navigated around obstruction: ${args.blockedEdge}. `;
      }
      baseString += `Path context: ${args.routeSummary}`;
      
      explanation = baseString.trim();

    } else {
      // ----------------------------------------------------
      // Live Gemini LLM Generation (Plugin Point)
      // ----------------------------------------------------
      const prompt = `
        Explain this logistics routing change clearly and concisely to a fleet manager. Keep it under 2 sentences.
        Disruption: ${args.disruptionType}
        Blocked Road: ${args.blockedEdge || "None"}
        Original ETA: ${args.oldEtaMinutes}m
        Revised ETA: ${args.newEtaMinutes}m
        Route Details: ${args.routeSummary}
      `;

      try {
        // TODO: Replace with actual Gemini REST call when ready
        // const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        // });
        // const data = await response.json();
        // explanation = data.candidates[0].content.parts[0].text;

        // Simulated response using the prompt context during development
        void prompt; // Will be used by Gemini fetch above when enabled
        explanation = `AI Analysis: The vehicle was manually redirected around a ${args.disruptionType.replace("-", " ")}. The algorithmic recalculation successfully maintained transit constraints, altering the schedule by ${args.newEtaMinutes - args.oldEtaMinutes}m.`;
      } catch (error) {
        console.error("Gemini failed, switching to default text", error);
        explanation = `Rerouted due to ${args.disruptionType}. ETA modified to ${args.newEtaMinutes}m.`;
      }
    }

    // Save final explanation into the database audit log trail
    await ctx.runMutation(internal.ai.explain.appendExplanation, {
      logId: args.logId,
      explanation,
    });

    return explanation;
  },
});
