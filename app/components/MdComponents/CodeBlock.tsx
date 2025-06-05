import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import React, { useState } from "react";

interface CodeBlockProps {
  language: string;
  value: string;
}

export default function CodeBlock({
  language,
  value,
}: CodeBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-4 border-[0.5px] border-charcoal-light rounded-md overflow-hidden group">
      <div className="flex top-2 justify-between items-center h-9 bg-charcoal">
        <span className="text-xs text-white px-2 py-1">{language}</span>
        <button
          onClick={handleCopy}
          className="right-2 text-xs px-2 flex items-center gap-1 cursor-pointer"
        >
          <ContentCopyIcon fontSize="inherit" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{ margin: 0, borderRadius: "unset" }}
        showLineNumbers={true}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
