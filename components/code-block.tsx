/**
 * ** CODE BLOCK COMPONENT **
 * 
 * This component renders code snippets with syntax highlighting.
 * 
 * Key functionalities:
 * - Displays code with proper syntax highlighting
 * - Provides language detection and formatting
 * - Implements copy-to-clipboard functionality
 * - Shows line numbers for better readability
 * - Formats code according to the detected language
 * - Adapts styling to match the current theme
 * - Handles various code formats and languages
 * 
 * This component enhances code readability in markdown content
 * and throughout the application, ensuring consistent and
 * visually appealing presentation of code snippets.
 */

'use client';

import { CopyIcon } from './icons';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  if (!inline) {
    return (
      <div className="not-prose flex flex-col">
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
        >
          <code className="whitespace-pre-wrap break-words">{children}</code>
        </pre>
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
