"use server";
import getDbConnection from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeUploadedFile(
  resp: {
    serverData: { userId: string; file: any };
  }[]
) {
  if (!resp) {
    return {
      success: false,
      message: "File upload failed",
      data: null,
    };
  }

  const {
    serverData: {
      userId,
      file: { url: fileUrl, name: fileName },
    },
  } = resp[0];

  if (!fileUrl || !fileName) {
    return {
      success: false,
      message: "File upload failed",
      data: null,
    };
  }

  try {
    // Fetch the file and convert it to a blob
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const fileBuffer = await response.arrayBuffer();
    const fileBlob = new Blob([fileBuffer], { type: response.headers.get('content-type') || 'audio/mpeg' });

    // Convert blob to File object
    const file = new File([fileBlob], fileName, {
      type: fileBlob.type,
    });

    // Implement retry logic
    const MAX_RETRIES = 3;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < MAX_RETRIES) {
      try {
        const transcriptions = await openai.audio.transcriptions.create({
          model: "whisper-1",
          file: file,
        });

        return {
          success: true,
          message: "File uploaded successfully!",
          data: { transcriptions, userId },
        };
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (error instanceof OpenAI.APIError) {
          if (error.status === 413) {
            return {
              success: false,
              message: "File size exceeds the max limit of 20MB",
              data: null,
            };
          }
          // Handle rate limiting
          if (error.status === 429) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (attempt === MAX_RETRIES) {
          console.error("Error processing file", error);
          return {
            success: false,
            message: error instanceof Error ? error.message : "Error processing file",
            data: null,
          };
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError;
  } catch (error) {
    console.error("Error processing file", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error processing file",
      data: null,
    };
  }
}

async function saveBlogPost(userId: string, title: string, content: string) {
  try {
    const sql = await getDbConnection();
    const [insertedPost] = await sql`
    INSERT INTO posts (user_id, title, content)
    VALUES (${userId}, ${title}, ${content})
    RETURNING id
    `;
    return insertedPost.id;
  } catch (error) {
    console.error("Error saving blog post", error);
    throw error;
  }
}

async function getUserBlogPosts(userId: string) {
  try {
    const sql = await getDbConnection();
    const posts = await sql`
    SELECT content FROM posts 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT 3
  `;
    return posts.map((post) => post.content).join("\n\n");
  } catch (error) {
    console.error("Error getting user blog posts", error);
    throw error;
  }
}

async function generateBlogPost({
  transcriptions,
  userPosts,
}: {
  transcriptions: string;
  userPosts: string;
}) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a skilled content writer that converts audio transcriptions into well-structured, engaging blog posts in Markdown format. Create a comprehensive blog post with a catchy title, introduction, main body with multiple sections, and a conclusion. Analyze the user's writing style from their previous posts and emulate their tone and style in the new post. Keep the tone casual and professional.",
        },
        {
          role: "user",
          content: `Here are some of my previous blog posts for reference:

${userPosts}

Please convert the following transcription into a well-structured blog post using Markdown formatting. Follow this structure:

1. Start with a SEO friendly catchy title on the first line.
2. Add two newlines after the title.
3. Write an engaging introduction paragraph.
4. Create multiple sections for the main content, using appropriate headings (##, ###).
5. Include relevant subheadings within sections if needed.
6. Use bullet points or numbered lists where appropriate.
7. Add a conclusion paragraph at the end.
8. Ensure the content is informative, well-organized, and easy to read.
9. Emulate my writing style, tone, and any recurring patterns you notice from my previous posts.

Here's the transcription to convert: ${transcriptions}`,
        },
      ],
      model: "gpt-4-turbo-preview",  // Updated to a valid model name
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating blog post", error);
    throw error;
  }
}

export async function generateBlogPostAction({
  transcriptions,
  userId,
}: {
  transcriptions: { text: string };
  userId: string;
}) {
  try {
    const userPosts = await getUserBlogPosts(userId);
    let postId = null;

    if (transcriptions) {
      const blogPost = await generateBlogPost({
        transcriptions: transcriptions.text,
        userPosts,
      });

      if (!blogPost) {
        return {
          success: false,
          message: "Blog post generation failed, please try again...",
        };
      }

      const [title, ...contentParts] = blogPost?.split("\n\n") || [];

      if (blogPost) {
        postId = await saveBlogPost(userId, title, blogPost);
      }
    }

    revalidatePath(`/posts/${postId}`);
    redirect(`/posts/${postId}`);
  } catch (error) {
    console.error("Error in generateBlogPostAction", error);
    return {
      success: false,
      message: "Failed to generate and save blog post",
    };
  }
}