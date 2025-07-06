import { redirect } from 'next/navigation';

// This route is deprecated in favor of using slugs.
// All new links should point to /events/[slug]
// This component remains to prevent 404s from old links and to resolve routing ambiguity.
export default function DeprecatedEventIdPage() {
  redirect('/');
}
