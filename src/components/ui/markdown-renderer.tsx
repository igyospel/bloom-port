import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Pre-process LLM output to convert LaTeX delimiters to remark-math compatible ones
  const processMath = (text: string) => {
    return text
      .replace(/\\\[/g, '$$$$') // replace \[ with $$
      .replace(/\\\]/g, '$$$$') // replace \] with $$
      .replace(/\\\(/g, '$')    // replace \( with $
      .replace(/\\\)/g, '$');   // replace \) with $
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {processMath(content)}
      </ReactMarkdown>
    </div>
  );
}
