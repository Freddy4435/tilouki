interface JsonLdScriptProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((entry, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
          key={index}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
