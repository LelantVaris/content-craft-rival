
import { EditorRoot, EditorContent, type JSONContent } from "novel"
import { useState } from "react"

interface NovelEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export const NovelEditor = ({ content, onChange, className }: NovelEditorProps) => {
  const [editorContent, setEditorContent] = useState(content)

  const handleEditorChange = (editor: any) => {
    const html = editor.getHTML()
    const text = editor.getText()
    setEditorContent(text)
    onChange(text)
  }

  // Convert string content to basic JSONContent structure
  const initialContent: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: content || ''
          }
        ]
      }
    ]
  }

  return (
    <div className={className}>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          onUpdate={handleEditorChange}
          className="min-h-[600px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          editorProps={{
            attributes: {
              class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          slashCommand={{
            suggestion: {
              items: () => [
                {
                  title: "Continue writing",
                  description: "Use AI to expand your thoughts.",
                  icon: "✨",
                },
                {
                  title: "Summarize",
                  description: "Summarize your content so far.",
                  icon: "📝",
                },
                {
                  title: "Improve writing", 
                  description: "Fix grammar and improve clarity.",
                  icon: "👌",
                },
              ],
            },
          }}
        />
      </EditorRoot>
    </div>
  )
}
