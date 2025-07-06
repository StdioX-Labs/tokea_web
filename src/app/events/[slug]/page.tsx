import { redirect } from 'next/navigation';

// This route uses slugs, which is the desired future state.
// However, to resolve a routing conflict, we are currently using IDs.
// This page is temporarily disabled to prevent issues.
export default function DeprecatedEventSlugPage() {
  redirect('/');
}
