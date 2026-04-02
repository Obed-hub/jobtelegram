import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export type AiProvider = 'groq' | 'gemini';

export async function getAiResponse(prompt: string, provider: AiProvider = 'groq') {
  try {
    if (provider === 'groq') {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
      });
      return chatCompletion.choices[0]?.message?.content || '';
    } else {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Fallback if gemini is explicitly called
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error(`[AI/${provider}] Error:`, error);
    throw error;
  }
}

/**
 * Enhanced Profile Generation
 */
export async function generateProfileSuggestions(role: string) {
  const prompt = `
    Generate professional profile attributes for a "${role}" position.
    Provide the response strictly as valid JSON with the following structure:
    {
      "primaryKeywords": ["keyword1", "keyword2", ...],
      "coreSkills": ["skill1", "skill2", ...],
      "optionalSkills": ["skill1", "skill2", ...],
      "excludedKeywords": ["exclusion1", "exclusion2", ...]
    }
    
    Primary keywords should be job titles or variations (e.g., "Full Stack Developer").
    Excluded keywords should be unrelated roles or industries.
    Provide at least 5-8 items for each category.
  `;
  
  try {
    const response = await getAiResponse(prompt, 'groq');
    // Basic JSON extraction (in case AI adds markers like ```json)
    const jsonStr = response.match(/\{[\s\S]*\}/)?.[0] || response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('[AI/Profile] Error:', error);
    throw error;
  }
}

/** 
 * Analysis helpers 
 */

export async function generateJobAnalysis(job: any, profile: any) {
  const prompt = `
    Analyze how well this job matches the user profile.
    
    Job: ${job.title} at ${job.company}
    Description: ${job.description}
    Requirements: ${job.requirements.join(', ')}
    
    User Profile:
    Role: ${profile.role}
    Skills: ${profile.coreSkills.join(', ')}
    Experience: ${profile.years} years, ${profile.experience_level}
    
    Provide a concise, 2-3 sentence "AI Insight" on why this is a good match or what's missing.
    Be encouraging but realistic.
  `;
  return getAiResponse(prompt, 'groq');
}

export async function generateFitCv(job: any, profile: any, extraContext?: { cvText?: string; achievements?: string; missingItems?: string; }) {
  const prompt = `
    Fit the user's career profile and CV to match this specific job requirement.
    
    Job: ${job.title} at ${job.company}
    Key Requirements: ${job.requirements.join(', ')}
    
    User Profile Data:
    Role: ${profile.role}
    Core Skills: ${profile.coreSkills.join(', ')}
    
    ${extraContext?.cvText ? `USER'S CURRENT CV TEXT:\n${extraContext.cvText}\n` : `Bio/Background: ${profile.bio}`}
    ${extraContext?.achievements ? `ADDITIONAL MEASURABLE ACHIEVEMENTS:\n${extraContext.achievements}\n` : ''}
    ${extraContext?.missingItems ? `ADDITIONAL TOOLS/CERTIFICATIONS/PROJECTS:\n${extraContext.missingItems}\n` : ''}
    
    Task:
    1. Write a 2-3 sentence "Tailored Professional Summary" that positions the user as the ideal candidate. Focus on their experience from the provided CV and Profile.
    2. Provide 3-5 "Matching Skill Highlights" from the user's background that solve the job's biggest requirements. Incorporate any additional achievements or tools provided.
    3. Suggest 2-3 minor adjustments to their experience section to better highlight their fit.
    
    Format:
    [Tailored Summary]
    ...
    
    [Matching Skill Highlights]
    - ...
    
    [CV Adjustment Tips]
    - ...
  `;
  return getAiResponse(prompt, 'groq');
}

export async function generateInterviewPrep(job: any, profile: any) {
  const prompt = `
    Provide 3 practice interview questions and suggested answers for this role based on the user's profile.
    
    Job: ${job.title} at ${job.company}
    User Role: ${profile.role}
    User Skills: ${profile.coreSkills.join(', ')}
    
    Format:
    Q1: ...
    A1: ...
    ...
  `;
  return getAiResponse(prompt, 'groq');
}
