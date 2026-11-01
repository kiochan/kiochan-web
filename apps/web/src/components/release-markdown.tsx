import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type PublishedRelease, screenshotUrl } from "@/lib/releases/server";

export function ReleaseMarkdown({ release }: { release: PublishedRelease }) {
  return (
    <div className="space-y-5 text-sm leading-7 text-ink-muted [&_h1]:mt-10 [&_h1]:text-2xl [&_h1]:font-medium [&_h1]:text-ink [&_h2]:mt-9 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-ink [&_h3]:mt-7 [&_h3]:font-medium [&_h3]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_a]:text-brand [&_a]:underline [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-surface-muted [&_pre]:p-5 [&_code]:font-mono [&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-5 [&_table]:block [&_table]:overflow-x-auto [&_th]:border [&_th]:border-edge [&_th]:p-3 [&_td]:border [&_td]:border-edge [&_td]:p-3">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{
          img({ src, alt }) {
            const image =
              typeof src === "string" ? screenshotUrl(release, src) : null;
            return image ? (
              <Image
                src={image}
                alt={alt || "Release screenshot"}
                width={1280}
                height={800}
                unoptimized
                className="my-7 h-auto w-full rounded-xl border border-edge"
              />
            ) : (
              <span>{alt || "Screenshot unavailable"}</span>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                rel={
                  href?.startsWith("https://")
                    ? "noreferrer noopener"
                    : undefined
                }
              >
                {children}
              </a>
            );
          },
        }}
      >
        {release.markdown}
      </Markdown>
    </div>
  );
}
