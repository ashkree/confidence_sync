export function H1({ text }: { text: string }) {
  return (
    <h1 className="scroll-m-20 text-xl md:text-2xl font-semibold tracking-tight text-balance">
      {text}
    </h1>
  );
}

export function H2({ text }: { text: string }) {
  return (
    <h2 className="scroll-m-20 text-sm font-normal tracking-tight text-muted-foreground first:mt-0">
      {text}
    </h2>
  );
}
