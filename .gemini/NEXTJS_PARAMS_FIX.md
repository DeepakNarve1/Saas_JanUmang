# Fix for "An unsupported type was passed to use()" Error

## Problem

In Next.js 15+, the `params` prop in dynamic route pages is now a Promise, but in earlier versions it was a regular object. This causes the error:

```
Error: An unsupported type was passed to use(): [object Object]
```

## Solution

### ✅ Fixed Files

The following tenant pages have been fixed:

- `src/app/(protected)/tenants/[id]/page.tsx`
- `src/app/(protected)/tenants/[id]/edit/page.tsx`

### 🛠️ Utility Created

Created a helper utility at `src/utils/params.ts` that handles both Promise and regular object params.

## How to Fix Other Pages

If you encounter this error on other pages, follow these steps:

### Step 1: Import the utility

```tsx
import { resolveParams, PageProps } from "@app/utils/params";
```

### Step 2: Update the page component

**Before (Broken):**

```tsx
export default function MyPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <MyComponent id={id} />;
}
```

**After (Fixed):**

```tsx
export default function MyPage({ params }: PageProps) {
  const { id } = resolveParams(params);
  return <MyComponent id={id} />;
}
```

### Step 3: For pages with custom param types

If your page has different params (not just `id`), you can specify the type:

```tsx
import { resolveParams, PageProps } from "@app/utils/params";

// Custom params type
type MyParams = {
  slug: string;
  category: string;
};

export default function MyPage({ params }: PageProps<MyParams>) {
  const { slug, category } = resolveParams(params);
  return <MyComponent slug={slug} category={category} />;
}
```

## Pages That May Need Fixing

Based on the file structure, these pages likely need the same fix:

### High Priority (Edit/View Pages):

- `assemblies/[id]/edit/page.tsx`
- `assemblies/[id]/page.tsx`
- `assembly-issue/[id]/edit/page.tsx`
- `assembly-issue/[id]/view/page.tsx`
- `blocks/[id]/edit/page.tsx`
- `blocks/[id]/page.tsx`
- `booths/[id]/edit/page.tsx`
- `booths/[id]/page.tsx`
- `call-management/[id]/edit/page.tsx`
- `call-management/[id]/view/page.tsx`
- `department/[id]/edit/page.tsx`
- `department/[id]/view/page.tsx`
- `dispatch-register/[id]/edit/page.tsx`
- `dispatch-register/[id]/view/page.tsx`
- `districts/[id]/edit/page.tsx`
- `districts/[id]/page.tsx`
- `divisions/[id]/edit/page.tsx`
- `divisions/[id]/page.tsx`
- `events/[id]/edit/page.tsx`
- `events/[id]/view/page.tsx`
- And many more...

## Quick Fix Script

You can search for all pages that need fixing with this pattern:

```bash
# Search for pages using old params pattern
grep -r "params: { id: string }" src/app/(protected)
```

## Testing

After fixing a page:

1. Navigate to the page in your browser
2. Verify no console errors
3. Test all functionality (view, edit, delete)
4. Check that params are correctly passed to child components

## Why This Happened

Next.js 15 changed `params` from a synchronous object to an asynchronous Promise to support:

- Partial Prerendering (PPR)
- Better streaming support
- Improved performance

The utility we created handles both versions, making your app compatible with both old and new Next.js versions.

## Additional Notes

- The `resolveParams` utility uses React's `use()` hook internally
- It checks if params is a Promise before unwrapping
- This ensures backward compatibility with older Next.js versions
- No runtime overhead if params is already an object

## Example: Complete Fixed Page

```tsx
"use client";

import MyComponent from "@app/views/my-component";
import { resolveParams, PageProps } from "@app/utils/params";

export default function MyPage({ params }: PageProps) {
  const { id } = resolveParams(params);
  return <MyComponent id={id} />;
}
```

## Need Help?

If you encounter this error on a specific page:

1. Check if the page uses dynamic routes (has `[id]` or similar in path)
2. Apply the fix shown above
3. Test the page
4. If issues persist, check the console for additional errors
