import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { absoluteUrl } from "@/config/site";

/**
 * Server-rendered Markdown. Raw HTML in content is NOT rendered (no rehype-raw),
 * and react-markdown's default URL transform strips javascript: and similar URLs.
 * Internal links use next/link; external links get rel="noopener".
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-hm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          // The page already has an H1 (the post title): demote any H1 in the body.
          h1: ({ node: _node, ...props }) => <h2 {...props} />,
          a: ({ node: _node, href = "", children, ...props }) => {
            const site = absoluteUrl("/");
            const internal = href.startsWith("/") || href.startsWith(site) || href.startsWith("#");
            if (internal && !href.startsWith("#")) {
              return <Link href={href.startsWith(site) ? href.slice(site.length - 1) : href}>{children}</Link>;
            }
            return (
              <a href={href} {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })} {...props}>
                {children}
              </a>
            );
          },
          img: ({ node: _node, alt = "", src, ...props }) =>
            typeof src === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt} loading="lazy" decoding="async" {...props} />
            ) : null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
