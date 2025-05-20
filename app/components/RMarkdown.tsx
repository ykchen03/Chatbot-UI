import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./MdComponents/CodeBlock";
import Table from "./MdComponents/Table";

interface RMarkdownProps {
  children: string;
}

export default function RMarkdown({ children }: RMarkdownProps): React.JSX.Element {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1(props) {
          return <h1 className="text-4xl font-bold my-4">{props.children}</h1>;
        },
        h2(props) {
          return <h2 className="text-3xl font-bold my-3">{props.children}</h2>;
        },
        h3(props) {
          return <h3 className="text-2xl font-bold my-2">{props.children}</h3>;
        },
        h4(props) {
          return <h4 className="text-xl font-bold my-1">{props.children}</h4>;
        },
        ul(props) {
          return <ul className="list-disc list-inside">{props.children}</ul>;
        },
        li(props) {
          return <li className="mb-1">{props.children}</li>;
        },
        hr() {
          return <hr className="my-4 border-t border-gray-300" />;
        },
        blockquote(props) {
          return (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-4">
              {props.children}
            </blockquote>
          );
        },
        a(props) {
          const { href, children } = props;
          return (
            <a
              href={href}
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        p(props) {
          return (
            <p className="my-2 text-base leading-6">
              {props.children}
            </p>
          );
        },
        table(props) {
          return <Table>{props.children}</Table>;
        },
        thead(props) {
          return (
            <thead className="border-b border-charcoal bg-charcoal">
              {props.children}
            </thead>
          );
        },
        tbody(props) {
          return (
            <tbody className="divide-y border-charcoal">{props.children}</tbody>
          );
        },
        tr(props) {
          return <tr className="divide-x border-charcoal">{props.children}</tr>;
        },
        th(props) {
          return (
            <th className="px-4 py-2 text-left font-semibold divide-y border-charcoal">
              {props.children}
            </th>
          );
        },
        td(props) {
          return (
            <td className="px-4 py-2 divide-y border-charcoal">
              {props.children}
            </td>
          );
        },
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <CodeBlock language={match[1]} value={String(children).trim()} />
          ) : (
            <code
              {...rest}
              className="bg-charcoal px-1 rounded text-sm font-mono"
            >
              {children}
            </code>
          );
        },
      }}
    >
      {children}
    </Markdown>
  );
};
