export function JsonLd({ data }: { data: object | object[] }) {
  // Escaping "<" guards against the (here, purely theoretical) case of a
  // "</script>" sequence breaking out of the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
