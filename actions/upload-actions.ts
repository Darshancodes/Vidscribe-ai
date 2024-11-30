"use server";

import { GET_BLOG_CONTENT } from "@/components/upload/upload-form";
import { executeGraphQLQuery } from "@/lib/apollo-client";
import getDbConnection from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handleInitialUpload(resp: any) {
  return await transcribeUploadedFile(resp);
}

export async function handleBlogGeneration({ transcriptions, userId }: any) {
  return await generateBlogPostAction({
    transcriptions,
    userId,
  });
}

export async function transcribeUploadedFile(
  resp: {
    serverData: { userId: string; file: any };
  }[]
) {
  if (!resp?.length) {
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
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, {
      type: response.headers.get("content-type") || "audio/mpeg",
    });

    const transcriptions = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
    });

    return {
      success: true,
      message: "File transcribed successfully!",
      data: { transcriptions, userId },
    };
  } catch (error) {
    console.error("Error processing file", error);

    if (error instanceof OpenAI.APIError && error.status === 413) {
      return {
        success: false,
        message: "File size exceeds the max limit of 20MB",
        data: null,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Error processing file",
      data: null,
    };
  }
}

export async function saveBlogPost(
  userId: string,
  title: string,
  content: string
) {
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

export async function generateBlogPost({
  transcriptions,
}: {
  transcriptions: string;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(
      "https://vidscribe-ai-darshannn.hypermode.app/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${process.env.NEXT_PUBLIC_MODUS_API_KEY}`,
        },
        body: JSON.stringify({
          query: `query GenerateBlogContent($data: String!) {
            generateBlogContent(transcriptions: $data)
          }`,
          variables: { data: transcriptions },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.generateBlogContent;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("Request timeout - please try again");
    }
    throw error;
  }
}

// async function generateBlogPost({
//   transcriptions,
// }: {
//   transcriptions: string;
// }) {
//   try {
//     const response = await fetch(
//       "https://vidscribe-ai-darshannn.hypermode.app/graphql",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           authorization: `Bearer ${process.env.NEXT_PUBLIC_MODUS_API_KEY}`,
//         },
//         body: JSON.stringify({
//           query: `
//           query GenerateBlogContent($data: String!) {
//             generateBlogContent(transcriptions: $data)
//           }
//         `,
//           variables: {
//             data: transcriptions,
//           },
//         }),
//       }
//     );

//     const result = await response.json();

//     if (result.errors) {
//       throw new Error(result.errors[0].message);
//     }
//     console.log("result", result);

//     return result.data.generateBlogContent;
//   } catch (error) {
//     console.error("Error generating blog post:", error);
//     throw error;
//   }
// }

// async function generateBlogPost({
//   transcriptions,
//   userPosts,
// }: {
//   transcriptions: string;
//   userPosts?: string;
// }) {
//   try {
//     const data = await executeGraphQLQuery(GET_BLOG_CONTENT, {
//       data: transcriptions,
//     });

//     if (!data?.generateBlogContent) {
//       throw new Error("Failed to generate blog content");
//     }

//     return data.generateBlogContent;
//   } catch (error) {
//     console.error("Error generating blog post:", error);
//     throw error;
//   }
// }

export async function generateBlogPostAction({
  transcriptions,
  userId,
}: {
  transcriptions: { text: string };
  userId: string;
}) {
  try {
    if (!transcriptions?.text) {
      return {
        success: false,
        message: "No transcription text provided",
      };
    }

    const blogPost = await generateBlogPost({
      transcriptions: transcriptions.text,
      // userPosts,
    });

    if (!blogPost) {
      return {
        success: false,
        message: "Blog post generation failed, please try again...",
      };
    }

    const [title, ...contentParts] = blogPost.split("\n");
    console.log("title =>", title);

    const postId = await saveBlogPost(userId, title, blogPost);
    return postId;
  } catch (error) {
    console.error("Error in generateBlogPostAction:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}