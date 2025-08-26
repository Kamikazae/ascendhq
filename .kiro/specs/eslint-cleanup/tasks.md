# Implementation Plan

- [x] 1. Create TypeScript type definitions for authentication





  - Create `types/auth.ts` file with extended NextAuth session and user interfaces
  - Define proper role types as union types instead of strings
  - Export utility types for authentication checks
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create authentication utility functions





  - Create `lib/auth-utils.ts` with reusable authentication check functions
  - Implement `requireAuth` function with proper type guards
  - Implement `requireRole` function for role-based access control
  - Write unit tests for authentication utilities
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Update API routes to use proper session types












  - Replace all `(session.user as any).role` with properly typed session access
  - Update admin API routes to use new authentication utilities
  - Update manager API routes to use new authentication utilities
  - Update member API routes to use new authentication utilities
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Update layout components with proper session types





  - Fix `src/app/admin/layout.tsx` to use proper session typing
  - Fix `src/app/manager/layout.tsx` to use proper session typing
  - Fix `src/app/member/layout.tsx` to use proper session typing
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 5. Clean up unused imports in component files





  - Remove unused icon imports from admin dashboard page
  - Remove unused icon imports from admin management pages
  - Remove unused icon imports from manager pages
  - Remove unused icon imports from member pages
  - Remove unused component imports from all pages
  - _Requirements: 2.1, 2.2_

- [x] 6. Clean up unused variables and parameters
  - Remove or prefix unused function parameters with underscore
  - Remove unused variable declarations
  - Clean up unused loop indices and destructured variables
  - _Requirements: 2.1, 2.3_

- [x] 7. Fix JSX unescaped entities









  - Replace unescaped quotes with `&quot;` or `&ldquo;`/`&rdquo;` in JSX
  - Replace unescaped apostrophes with `&apos;` or `&lsquo;`/`&rsquo;` in JSX
  - Update all affected component files with proper HTML entities
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8. Update middleware and auth configuration





  - Fix type assertions in `src/middleware.ts`
  - Update `src/lib/auth.ts` to use proper TypeScript types
  - Ensure NextAuth configuration uses proper typing
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 9. Verify ESLint compliance









  - Run ESLint on all modified files to ensure no errors remain
  - Fix any remaining type-related issues
  - Verify build process completes without warnings
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 10. Test authentication functionality









  - Verify admin authentication still works correctly
  - Verify manager authentication still works correctly
  - Verify member authentication still works correctly
  - Test role-based access control in all routes
  - _Requirements: 1.1, 1.2, 1.3_