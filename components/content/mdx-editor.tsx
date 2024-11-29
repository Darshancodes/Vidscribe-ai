"use client";

import type { ForwardedRef } from "react";
import {
  toolbarPlugin,
  listsPlugin,
  linkPlugin,
  imagePlugin,
  linkDialogPlugin,
  headingsPlugin,
  directivesPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  Image,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        listsPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        imagePlugin(),
        linkDialogPlugin(),
        directivesPlugin(),
        headingsPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <div className="flex items-center p-1 gap-1 border-b">
              <Select defaultValue="paragraph">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraph">Normal</SelectItem>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="mx-1 h-6" />

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-command="bold"
                      className="h-8 w-8"
                    >
                      <Bold className="h-4 w-4" />
                      <span className="sr-only">Bold</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-command="italic"
                      className="h-8 w-8"
                    >
                      <Italic className="h-4 w-4" />
                      <span className="sr-only">Italic</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-command="underline"
                      className="h-8 w-8"
                    >
                      <Underline className="h-4 w-4" />
                      <span className="sr-only">Underline</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Underline</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="mx-1 h-6" />

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-command="bulletList"
                      className="h-8 w-8"
                    >
                      <List className="h-4 w-4" />
                      <span className="sr-only">Bullet List</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bullet List</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-command="quote"
                      className="h-8 w-8"
                    >
                      <Quote className="h-4 w-4" />
                      <span className="sr-only">Quote</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quote</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-command="thematicBreak"
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Horizontal Rule</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Horizontal Rule</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="mx-1 h-6" />

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-command="createLink"
                      className="h-8 w-8"
                    >
                      <Link2 className="h-4 w-4" />
                      <span className="sr-only">Create Link</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create Link</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-command="insertImage"
                      className="h-8 w-8"
                    >
                      <Image className="h-4 w-4" />
                      <span className="sr-only">Insert Image</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Image</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
