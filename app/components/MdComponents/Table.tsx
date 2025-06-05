import { useState, useRef } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
interface TableProps {
  children: React.ReactNode;
}

export default function Table({ children }: TableProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleCopy = async (): Promise<void> => {
    if (tableRef.current) {
      console.log(tableRef.current);
      const text = tableRef.current.innerText;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-charcoal">
      <div className="absolute top-2 right-0 items-center h-9">
        <button
          onClick={handleCopy}
          className="text-white text-xs px-2 flex items-center gap-1 cursor-pointer"
        >
          <ContentCopyIcon fontSize="inherit" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <table ref={tableRef} className="table-auto w-full text-sm">
        {children}
      </table>
    </div>
  );
}
