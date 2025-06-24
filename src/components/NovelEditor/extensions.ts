
import {
  TiptapImage,
  TiptapLink,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
} from "novel/extensions";
import { cx } from "class-variance-authority";

// Placeholder configuration
const placeholder = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === "heading") {
      return "What's the title?";
    }
    return "Press '/' for commands, or start writing...";
  },
});

// Link configuration with styling
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-blue-600 underline underline-offset-[3px] hover:text-blue-800 transition-colors cursor-pointer",
    ),
  },
});

// Task list configuration
const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
});

// Horizontal rule configuration
const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-slate-300"),
  },
});

// StarterKit configuration with custom styling
const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-purple-400 pl-4 italic"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-sm bg-slate-100 border p-5 font-mono font-medium"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-slate-100 px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  TiptapImage,
  UpdatedImage,
  taskList,
  taskItem,
  horizontalRule,
];
