import { reddit } from '@devvit/web/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Note: In Devvit, environment variables are accessed via context.settings or similar if configured,
// but for a quick integration we'll assume the key is passed or available in the environment.
// Actually, Devvit has a 'secret' store or we use context.settings.
// For now, we'll use a placeholder or assume it's in the environment.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateRedditReply = async (
  postTitle: string,
  postBody: string,
  subreddit: string,
  productContext: {
    name: string;
    description: string;
    url: string;
    keywords: string[];
  }
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a Reddit growth marketing expert. Your job is to write a genuine, helpful reply to a Reddit post that subtly and naturally mentions a relevant product/service.

RULES:
1. NEVER be salesy, pushy, or spammy. Redditors hate that.
2. First, genuinely address the post's question or discussion.
3. Share knowledge, personal experience, or useful insight.
4. Only mention the product if it naturally fits the conversation.
5. Keep it concise (2-4 paragraphs max).
6. Sound like a real human, not a marketer.
7. Match the subreddit's tone and style.
8. If the product doesn't naturally fit, write a purely helpful reply without mentioning it.
9. Never use phrases like "I found this great product" or "check out this amazing tool".
10. If mentioning the product, weave it in as part of your genuine experience or suggestion.

PRODUCT CONTEXT:
- Name: ${productContext.name}
- Description: ${productContext.description}
- URL: ${productContext.url}
- Keywords: ${productContext.keywords.join(', ')}

REDDIT POST:
- Subreddit: r/${subreddit}
- Title: ${postTitle}
- Body: ${postBody || '(no body text)'}

Write a single Reddit reply. No explanations, no meta-commentary, just the reply text:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};

export const postReply = async (postId: string, text: string) => {
  return await reddit.submitComment({
    id: postId as `t3_${string}` | `t1_${string}`,
    text: text,
  });
};
