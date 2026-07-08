export function H1({ text }: { text: string }) {
  return (
    <h1 className="scroll-m-20 text-3xl md:text-4xl font-extrabold tracking-tight text-balance">
      {text}
    </h1>
  );
}

export function H2({ text }: { text: string }) {
  return (
    <h2 className="scroll-m-20 text-2xl md:text-3xl font-semibold tracking-tight first:mt-0">
      {text}
    </h2>
  );
}
