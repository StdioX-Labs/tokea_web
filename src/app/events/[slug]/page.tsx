// This page is intentionally left without a default export to resolve
// a Next.js routing conflict between /events/[id] and /events/[slug].
// The active route is /events/[id].

// By only exporting this function, we signal to Next.js that this path
// is not a renderable page, which should resolve the build error.
export async function generateStaticParams() {
  return [];
}
