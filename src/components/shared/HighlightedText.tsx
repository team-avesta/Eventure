interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export const HighlightedText = ({
  text,
  highlight,
  className = '',
}: HighlightedTextProps) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Split search terms by spaces and hyphens
  const searchTerms = highlight.toLowerCase().split(/[\s-]+/);

  // Create a regex pattern that matches any of the search terms
  const pattern = new RegExp(`(${searchTerms.join('|')})`, 'gi');

  // Split text into parts based on matches
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        return searchTerms.includes(lowerPart) ? (
          <span key={i} className="bg-yellow-200 font-medium">
            {part}
          </span>
        ) : (
          part
        );
      })}
    </span>
  );
};
