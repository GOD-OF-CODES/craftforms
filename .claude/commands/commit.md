Review all staged and unstaged changes, then create a git commit following these steps:

1. Run `git status` to see all changes and `git diff` to see the actual modifications. Also run `git log --oneline -5` to check recent commit message style.
2. Analyze the changes and draft a concise commit message that:
   - Summarizes the nature of the changes (new feature, bug fix, refactor, etc.)
   - Focuses on the "why" rather than the "what"
   - Follows the repository's existing commit message style
3. Stage the relevant files (prefer specific files over `git add -A`)
4. Create the commit with the message.
5. Run `git status` to verify the commit succeeded.

Do NOT push to remote. Do NOT commit files that contain secrets (.env, credentials, etc.).
