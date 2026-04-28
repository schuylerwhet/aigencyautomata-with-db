
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Contact, Activity } from '../src/types/crm';
import { searchPerplexity } from './perplexity';

// Initialize with a fallback to empty string.
const API_KEY = process.env.API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const captureLeadTool: any = {
  functionDeclarations: [
    {
      name: 'captureLead',
      description: 'Capture lead contact information and specific project requirements when a user expresses interest in services or wants to book a call.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: 'User name' },
          email: { type: SchemaType.STRING, description: 'User email' },
          company: { type: SchemaType.STRING, description: 'User company' },
          service_of_interest: { type: SchemaType.STRING, description: 'The specific agency service they are interested in' },
          bottleneck: { type: SchemaType.STRING, description: 'The biggest bottleneck or time-consuming process the user mentioned' }
        },
        required: ['name', 'email', 'service_of_interest']
      }
    }
  ]
};

/**
 * Specialized function for generating high-end Swiss-design marketing visuals.
 * Note: This uses a specialized image model. If the standard SDK fails, ensure the model supports generateContent or use REST via fetch.
 */
export const generateMarketingImage = async (prompt: string): Promise<string | null> => {
  const fullPrompt = `Create a minimalist Swiss-design style marketing poster. Theme: ${prompt}. Style: High contrast, grid-based, bold typography, iconic geometric shapes, clean white/black/red color palette. Professional, abstract, and sophisticated. No clutter.`;

  try {
    // Attempting to use the standard SDK for image generation if supported by model.
    // If this fails, consider falling back to fetch() with specific endpoint.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Fallback to flash if 2.5 image not standard
    // Ideally use 'gemini-2.0-flash-exp' or similar for multimodal if available.
    // But for image output, usually requires specific endpoint.
    // Assuming for now returns text desc or base64 if supported.

    // For actual image generation via Gemini API (Imagen 3), use vertex AI or specific call.
    // Here we return null as placeholder or try generateContent.
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      tools: captureLeadTool.functionDeclarations ? [captureLeadTool] : undefined,
      systemInstruction: `You are the advanced AI assistant for "AigencyAutomata". 
        
        Capabilities:
        1. Explain services and ROI.
        2. CAPTURE LEADS (Name, Email, Service context).
        3. DESIGN ASSETS: If a user asks to "generate", "create", "visualize", or "design" an image/poster/graphic, tell them you are initializing the Visualizer engine and ask for their specific brand core concept if they haven't provided it. 
        Note: You cannot generate the image directly in this text turn, but you should encourage them to describe their concept so the Visualizer section on the page can be used, or simply confirm you'll provide a conceptual draft.
        
        Tone: Swiss-minimalist, professional, authoritative.
        
        Lead Capture Protocol:
        1. Identify service interest.
        2. Ask service-specific bottleneck question.
        3. Capture Name, Email, Company.
        4. Call 'captureLead'.`
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: h.parts // Ensure parts structure matches SDK expectations
      })),
      generationConfig: {
        maxOutputTokens: 1024,
      }
    });

    let result = await chat.sendMessage(message);
    let response = await result.response;
    let text = response.text();

    // Check for function calls
    const calls = response.functionCalls();
    if (calls && calls.length > 0) {
      const toolResponses = [];
      for (const call of calls) {
        const leadEvent = new CustomEvent('aigency:lead_captured', {
          detail: { ...call.args, timestamp: Date.now() }
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(leadEvent);
        }

        toolResponses.push({
          functionResponse: {
            name: call.name,
            response: { result: 'LEAD_SYNC_SUCCESS_ID_420' }
          }
        });
      }

      // Send tool outputs back to model
      result = await chat.sendMessage(toolResponses);
      response = await result.response;
      text = response.text();
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generates a natural, non-spammy Reddit reply for a specific post.
 */
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
): Promise<string> => {
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

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      }
    });
    const response = await result.response;
    return response.text()?.trim() || 'Could not generate a reply for this post.';
  } catch (error) {
    console.error("Gemini Reddit Reply Error:", error);
    throw error;
  }
};

/**
 * Analyzes a CRM contact and their activity history to provide insights and next steps.
 */
export const analyzeCRMContact = async (
  contact: Contact,
  activities: Activity[]
): Promise<string> => {
  const activitySummary = activities.map(a =>
    `- [${a.type}] ${a.timestamp}: ${a.title} - ${a.content} (${a.sentiment})`
  ).join('\n');

  const prompt = `You are an expert CRM analyst. Analyze this contact and their history to suggest the next best action.

CONTACT:
Name: ${contact.name}
Role: ${contact.role}
Company: ${contact.company}
Status: ${contact.status}
Notes: ${contact.notes}

ACTIVITY HISTORY:
${activitySummary}

TASK:
1. Summarize the relationship health (Positive, Neutral, At Risk).
2. Suggest 2-3 specific next steps (e.g., "Send email about X", "Schedule call to discuss Y").
3. Draft a short, personalized follow-up email based on the context.

Keep it professional, concise, and action-oriented.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    });

    const response = await result.response;
    return response.text()?.trim() || 'Could not analyze contact.';
  } catch (error) {
    console.error("Gemini CRM Analysis Error:", error);
    return "Error analyzing contact.";
  }
};

/**
 * Conducts a hybrid AI audit:
 * 1. Uses Perplexity (Sonar Pro) to find LIVE business data and potential issues.
 * 2. Uses Gemini (Thinking Model) to analyze the data, score the businesses, and format into JSON.
 */
export const findProspects = async (
  industry: string,
  location: string,
  count: number = 3
): Promise<Contact[]> => {
  // Step 1: Get Live Data from Perplexity (with fallback)
  console.log(`Auditing ${industry} in ${location} via Perplexity...`);
  const perplexityQuery = `Find ${count} real ${industry} businesses in ${location}. 
  For each, strictly provide:
  - Business Name
  - Website URL (or "No Website")
  - A brief analysis of their digital presence weaknesses (e.g. slow site, bad mobile view, no ads, no social media, bad reviews).
  Focus on businesses that look like they need help with improved digital marketing or automation.`;

  let searchData = "";
  try {
    searchData = await searchPerplexity(perplexityQuery);
  } catch (e) {
    console.warn("Perplexity search failed, falling back to simulation", e);
  }

  const useSimulation = !searchData || searchData.includes("Error:") || searchData.length < 50;

  // Step 2: Analyze with Gemini (or Simulate)
  const prompt = useSimulation ?
    `ROLE: Elite Technical Auditor.
TASK: Generate ${count} REALISTIC BUT SIMULATED prospects for ${industry} in ${location}.
Since live search is unavailable, create plausible businesses with typical deficits found in this industry.

INSTRUCTIONS:
Generate a JSON Array of businesses that match the profile of "Distressed Digital State".

SCORING MATRIX (+ means BAD):
- Score starts at 0. Add points for deficits. Higher score = Better Prospect (More Broken).
1. VISIBILITY (+20): Evidence of poor ranking or bad reviews.
2. AEO READINESS (+20): No website or mentions of outdated info.
3. AUTOMATION (+20): Manual processes or no contact forms mentioned.
4. UX/DIGITAL (+10): Mention of "bad mobile", "slow", "old site".
5. AD SPEND (+30): "Running ads but bad site" or similar.

RETURN JSON ARRAY (No Markdown):
[
  {
    "name": "Simulated Business Name",
    "website": "URL",
    "score": 85,
    "heatMapRank": "#8 (Inferred Cold Zone)",
    "killShot": "One specific, punchy line about their weakness based on plausible data.",
    "email": "inferred_contact@domain.com",
    "role": "Owner",
    "company": "Business Name",
    "notes": "Simulated audit for demo purposes.",
    "aeoReadiness": true,
    "automationVoid": true,
    "digitalGaps": true,
    "adSpendLeakage": true
  }
]` :
    `ROLE: Elite Technical Auditor.
TASK: Analyze the provided raw search data and convert it into a structured Lead Audit.

RAW SEARCH DATA FROM PERPLEXITY:
${searchData}

INSTRUCTIONS:
Convert the above data into a JSON Array.
For each business, assign a strict audit score based on the "Distressed Digital State" evidence provided in the search data.
If the search data is vague, use your internal knowledge to infer likely deficits for this industry in this location.

SCORING MATRIX (+ means BAD):
- Score starts at 0. Add points for deficits. Higher score = Better Prospect (More Broken).
1. VISIBILITY (+20): Evidence of poor ranking or bad reviews.
2. AEO READINESS (+20): No website or mentions of outdated info.
3. AUTOMATION (+20): Manual processes or no contact forms mentioned.
4. UX/DIGITAL (+10): Mention of "bad mobile", "slow", "old site".
5. AD SPEND (+30): "Running ads but bad site" or similar.

RETURN JSON ARRAY (No Markdown):
[
  {
    "name": "Business Name",
    "website": "URL",
    "score": 85,
    "heatMapRank": "#8 (Inferred Cold Zone)",
    "killShot": "One specific, punchy line about their weakness based on the data.",
    "email": "inferred_contact@domain.com",
    "role": "Owner",
    "company": "Business Name",
    "notes": "Derived from search analysis.",
    "aeoReadiness": true,
    "automationVoid": true,
    "digitalGaps": true,
    "adSpendLeakage": true
  }
]`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text() || "[]";
    const prospects = JSON.parse(jsonText);

    return prospects.map((p: any, index: number) => ({
      id: `lead-${Date.now()}-${index}`,
      name: p.name || "Unknown Business",
      email: p.email || "info@example.com",
      company: p.company || p.name,
      role: p.role || "Decision Maker",
      status: 'New',
      lastContacted: new Date().toISOString(),
      tags: ['Prospect', industry, location, 'Perplexity Sourced'],
      notes: p.notes,
      website: p.website,
      audit: {
        score: p.score || 50,
        heatMapRank: p.heatMapRank || "Unknown",
        killShot: p.killShot || "General inefficiency detected",
        aeoReadiness: !!p.aeoReadiness,
        automationVoid: !!p.automationVoid,
        digitalGaps: !!p.digitalGaps,
        adSpendLeakage: !!p.adSpendLeakage,
        lastAudited: new Date().toISOString()
      }
    }));
  } catch (error) {
    console.error("Hybrid Prospecting Error:", error);
    // Fallback? Or return empty to signal failure.
    return [];
  }
};