"use client";

type StoryEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function StoryEditor({ value, onChange }: StoryEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      className="w-full resize-none rounded-lg border border-border/50 bg-card/80 px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      placeholder="Your generated story will appear here..."
    />
  );
}
