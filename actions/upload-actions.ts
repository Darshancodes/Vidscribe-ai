"use server";

import { executeGraphQLQuery } from "@/lib/apollo-client";
import getDbConnection from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Unified response type
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  postId?: string | number;
};

export async function transcribeUploadedFile(
  resp: {
    serverData: { userId: string; file: any };
  }[]
): Promise<ActionResponse> {
  // Validate input
  if (!resp?.length) {
    return {
      success: false,
      message: "Invalid file upload",
      data: null,
    };
  }

  const {
    serverData: {
      userId,
      file: { url: fileUrl, name: fileName },
    },
  } = resp[0];

  // Validate file details
  if (!fileUrl || !fileName) {
    return {
      success: false,
      message: "Missing file details",
      data: null,
    };
  }

  try {
    // Fetch and convert file
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, {
      type: response.headers.get("content-type") || "audio/mpeg",
    });

    // Transcribe file
    const transcriptions = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
    });

    return {
      success: true,
      message: "File transcribed successfully",
      data: { transcriptions, userId },
    };
  } catch (error) {
    // Detailed error handling
    console.error("Transcription error:", error);

    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 413:
          return {
            success: false,
            message: "File exceeds 20MB limit",
            data: null,
          };
        default:
          return {
            success: false,
            message: error.message || "Transcription failed",
            data: null,
          };
      }
    }

    return {
      success: false,
      message: "Unexpected transcription error",
      data: null,
    };
  }
}

async function saveBlogPost(
  userId: string, 
  title: string, 
  content: string
): Promise<string> {
  const sql = await getDbConnection();
  try {
    const [insertedPost] = await sql`
      INSERT INTO posts (user_id, title, content)
      VALUES (${userId}, ${title}, ${content})
      RETURNING id
    `;
    return insertedPost.id;
  } catch (error) {
    console.error("Blog post save error:", error);
    throw new Error("Failed to save blog post");
  }
}

async function getUserBlogPosts(userId: string): Promise<string> {
  const sql = await getDbConnection();
  try {
    const posts = await sql`
      SELECT content FROM posts 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    return posts.map((post) => post.content).join("\n\n");
  } catch (error) {
    console.error("Fetch blog posts error:", error);
    return ""; // Return empty string instead of throwing
  }
}

async function generateBlogPost({
  transcriptions,
  userPosts,
}: {
  transcriptions: string;
  userPosts: string;
}): Promise<string> {
  try {
    const response = await fetch("https://vidscribe-ai-darshannn.hypermode.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
        authorization: `Bearer ${process.env.NEXT_PUBLIC_MODUS_API_KEY}`,
      },
      body: JSON.stringify({
        query: `
          query GenerateBlogContent($data: String!) {
            generateBlogContent(transcriptions: $data)
          }
        `,
        variables: {
          data: transcriptions,
        },
      }),
    });

    // Enhanced error handling
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Blog generation failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.generateBlogContent;
  } catch (error) {
    console.error("Blog generation error:", error);
    throw error;
  }
}

export async function generateBlogPostAction({
  transcriptions,
  userId,
}: {
  transcriptions: { text: string };
  userId: string;
}): Promise<ActionResponse> {
  try {
    // Validate inputs
    if (!transcriptions?.text) {
      return {
        success: false,
        message: "No transcription provided",
      };
    }

    // Fetch user's previous posts
    const userPosts = await getUserBlogPosts(userId);

    // Generate blog post
    const blogPost = await generateBlogPost({
      transcriptions: transcriptions.text,
      userPosts,
    });

    // Validate generated post
    if (!blogPost) {
      return {
        success: false,
        message: "Blog generation failed",
      };
    }

    // Parse blog post
    const [title, ...contentParts] = blogPost.split("\n");
    const content = contentParts.join("\n");

    // Save blog post
    const postId = await saveBlogPost(userId, title, content);

    return {
      success: true,
      message: "Blog post created successfully",
      postId: postId,
    };
  } catch (error) {
    console.error("Blog post action error:", error);
    
    return {
      success: false,
      message: error instanceof Error 
        ? error.message 
        : "Unexpected blog post generation error",
    };
  }
}