import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

