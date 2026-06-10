"use client";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown'ni xavfsiz render qiladi (raw HTML render qilinmaydi).
 * Blog editoridagi jonli ko'rinish (live preview) uchun ishlatiladi.
 * Admin ilovasida `@tailwindcss/typography` yo'q, shuning uchun har bir
 * element uchun utility class'lar qo'lda beriladi.
 */
const components: Components = {
  h1: (props) => <h1 className="mb-3 mt-4 text-xl font-bold" {...props} />,
  h2: (props) => <h2 className="mb-2 mt-4 text-lg font-semibold" {...props} />,
  h3: (props) => <h3 className="mb-2 mt-3 text-base font-semibold" {...props} />,
  p: (props) => <p className="my-2 leading-relaxed" {...props} />,
  ul: (props) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />,
  a: (props) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-2 border-l-2 border-muted-foreground/30 pl-3 text-muted-foreground" {...props} />
  ),
  code: (props) => (
    <code className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono" {...props} />
  ),
  pre: (props) => (
    <pre className="my-2 overflow-x-auto rounded-md bg-muted p-3 text-xs" {...props} />
  ),
  table: (props) => <table className="my-2 w-full border-collapse text-sm" {...props} />,
  th: (props) => <th className="border px-2 py-1 text-left font-semibold" {...props} />,
  td: (props) => <td className="border px-2 py-1" {...props} />,
};

export function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">Ko&apos;rinish shu yerda paydo bo&apos;ladi…</p>;
  }
  return (
    <div className="text-sm break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
