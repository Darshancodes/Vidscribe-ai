"use client";

import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUploadThing } from "@/utils/uploadthing";
import {
  generateBlogPostAction,
  handleBlogGeneration,
  handleInitialUpload,
  saveBlogPost,
  transcribeUploadedFile,
} from "@/actions/upload-actions";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      "File size must not exceed 20MB"
    )
    .refine(
      (file) =>
        file.type.startsWith("audio/") || file.type.startsWith("video/"),
      "File must be an audio or a video file"
    ),
});

export const GET_BLOG_CONTENT = gql`
  query GenerateBlogContent($data: String!) {
    generateBlogContent(transcriptions: $data)
  }
`;

export default function UploadForm() {
  const { toast } = useToast();
  const router = useRouter();

  const { startUpload } = useUploadThing("videoOrAudioUploader", {
    onClientUploadComplete: () => {
      toast({ title: "uploaded successfully!" });
    },
    onUploadError: (err) => {
      console.error("Error occurred", err);
    },
    onUploadBegin: () => {
      toast({ title: "Upload has begun 🚀!" });
    },
  });

  async function generateBlogPost({
    transcriptions,
  }: {
    transcriptions: string;
  }) {
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
            query: `
            query GenerateBlogContent($data: String!) {
              generateBlogContent(transcriptions: $data)
            }
          `,
            variables: {
              data: transcriptions,
            },
          }),
        }
      );

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      console.log("result", result);

      return result.data.generateBlogContent;
    } catch (error) {
      console.error("Error generating blog post:", error);
      throw error;
    }
  }

  const handleTranscribe = async (formData: FormData) => {
    const file = formData.get("file") as File;

    if (!schema.safeParse({ file }).success) {
      toast({
        title: "❌ Invalid file",
        variant: "destructive",
        description: "Please check file requirements",
      });
      return;
    }

    try {
      const resp = await startUpload([file]);
      if (!resp) throw new Error("Upload failed");

      toast({ title: "🎙️ Transcribing..." });
      const result = await handleInitialUpload(resp);
      if (!result?.data)
        throw new Error(result?.message || "Transcription failed");
      console.log("result data", result.data);

      toast({ title: "🤖 Generating blog..." });
      const blogPost = await generateBlogPost({
        transcriptions: result.data.transcriptions.text,
      });

      if (!blogPost) {
        return {
          success: false,
          message: "Blog post generation failed, please try again...",
        };
      }

      const [title, ...contentParts] = blogPost.split("\n");
      console.log("title =>", title);

      const postId = await saveBlogPost(result.data.userId, title, blogPost);
      // if (!postID) throw new Error("Blog generation failed");

      router.push(`/posts/${postId}`);
      toast({ title: "🎉 Blog created!" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <form className="flex flex-col gap-6" action={handleTranscribe}>
      <div className="flex justify-end items-center gap-1.5">
        <Input
          id="file"
          name="file"
          type="file"
          accept="audio/*,video/*"
          required
        />
        <Button className="bg-purple-600">Transcribe</Button>
      </div>
    </form>
  );
}

// const handleTranscribe = async (formData: FormData) => {
//   const file = formData.get("file") as File;

//   const validatedFields = schema.safeParse({ file });

//   if (!validatedFields.success) {
//     console.log(
//       "validatedFields",
//       validatedFields.error.flatten().fieldErrors
//     );
//     toast({
//       title: "❌ Something went wrong",
//       variant: "destructive",
//       description:
//         validatedFields.error.flatten().fieldErrors.file?.[0] ??
//         "Invalid file",
//     });
//   }

//   if (file) {
//     const resp: any = await startUpload([file]);
//     console.log({ resp });

//     if (!resp) {
//       toast({
//         title: "Something went wrong",
//         description: "Please use a different file",
//         variant: "destructive",
//       });
//     }
//     toast({
//       title: "🎙️ Transcription is in progress...",
//       description:
//         "Hang tight! Our digital wizards are sprinkling magic dust on your file! ✨",
//     });

//     const result = await transcribeUploadedFile(resp);
//     const { data = null, message = null } = result || {};

//     if (!result || (!data && !message)) {
//       toast({
//         title: "An unexpected error occurred",
//         description:
//           "An error occurred during transcription. Please try again.",
//       });
//     }

//     if (data) {
//       toast({
//         title: "🤖 Generating AI blog post...",
//         description: "Please wait while we generate your blog post.",
//       });

//       const postID = await generateBlogPostAction({
//         transcriptions: data.transcriptions,
//         userId: data.userId,
//       });

//       console.log("postid", postID);

//       router.push(`/posts/${postID}`);

//       toast({
//         title: "🎉 Woohoo! Your AI blog is created! 🎊",
//         description:
//           "Time to put on your editor hat, Click the post and edit it!",
//       });
//     }
//   }
// };