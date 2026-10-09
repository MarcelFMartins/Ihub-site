type Props = { text: string; className?: string; by?: "char" | "word" };

/** Wraps words (and optionally chars) in masked spans so GSAP can animate them. */
export default function SplitText({ text, className = "", by = "char" }: Props) {
  return (
    <span className={`split ${className}`} aria-label={text}>
      {text.split(" ").map((word, wi, arr) => (
        <span key={wi} className="word" aria-hidden>
          {by === "char"
            ? word.split("").map((ch, ci) => (
                <span key={ci} className="char">
                  {ch}
                </span>
              ))
            : <span className="char">{word}</span>}
          {wi < arr.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
