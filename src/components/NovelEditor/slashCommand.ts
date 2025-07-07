
import { Command, renderItems } from "novel";
import { suggestionItems } from "./suggestionItems";

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
