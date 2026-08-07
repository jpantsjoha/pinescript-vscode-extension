# Commit Guidelines for This Project

## Branching Strategy

**IMPORTANT:** Always work on feature branches, not directly on `main`.

### Workflow

1. **Create feature branch** before starting session:
   ```bash
   git checkout -b feature/session-4-control-flow
   ```

2. **Make granular commits** on the feature branch
3. **Push feature branch** to remote:
   ```bash
   git push -u origin feature/session-4-control-flow
   ```

4. **Create Pull Request** for review
5. **Merge to main** after review/approval

### Branch Naming Convention

- `feature/session-N-description` - For development sessions
- `fix/issue-description` - For bug fixes
- `docs/description` - For documentation-only changes
- `refactor/description` - For code refactoring

**Example:**
- `feature/session-4-control-flow`
- `feature/session-5-advanced-type-inference`
- `fix/while-loop-indentation`
- `docs/update-readme-coverage`

---

## Commit Strategy

For **multi-feature development sessions**, create **separate commits per logical feature group** rather than one large commit.

### Example: Session 4 Should Have Been 5 Commits

Instead of one large commit with all changes, break it down:

#### 1. Parser: If/else indentation-based parsing
```bash
git add src/parser/parser.ts
git commit -m "fix(parser): implement indentation-based if/else block parsing

- Parse multi-statement if consequent blocks
- Parse multi-statement else alternate blocks
- Skip newlines after if condition and else keyword
- Track indentation to determine block boundaries
- Eliminates 'Undefined variable else' errors (8x → 0)

Impact: -52 errors (563 → 511)
Files: src/parser/parser.ts (lines 135-216)"
```

#### 2. Parser + Validator: For loop iterator scoping
```bash
git add src/parser/parser.ts src/parser/comprehensiveValidator.ts
git commit -m "fix(parser,validator): add for loop iterator variable scoping

Parser changes:
- Implement indentation-based for loop body parsing
- Support multi-statement loop bodies

Validator changes:
- Add iterator variable to scope with int type
- Two-pass validation (collect declarations → validate)
- Eliminates 'Undefined variable i/j' errors (15x → 0)

Impact: -60 errors (511 → 451)
Files: parser.ts (lines 219-268), comprehensiveValidator.ts (lines 361-396)"
```

#### 3. Parser: Type annotation recognition
```bash
git add src/parser/parser.ts
git commit -m "feat(parser): support type annotations in variable declarations

- Parse standalone type annotations: int x = 1, float y = 2.0
- Parse var + type combinations: var float x = 1.0
- Support all basic types: int, float, bool, string, color, etc.
- Backtrack correctly when not a variable declaration
- Eliminates 'Undefined variable bool/int' errors (6x → 0)

Impact: -59 errors (451 → 392)
Files: src/parser/parser.ts (lines 66-97)"
```

#### 4. Docs: Session 2-4 technical documentation
```bash
git add SESSION-*.md MULTI-LINE-FUNCTION-FIX.md PARSER-FIXES-SESSION-2.md errors-fix.md
git commit -m "docs: add Session 2-4 technical documentation

Created:
- SESSION-4-CONTROL-FLOW-SUMMARY.md (complete Session 4 analysis)
- SESSION-3-COMPLETE-SUMMARY.md (type inference session)
- MULTI-LINE-FUNCTION-FIX.md (two-pass function fix)
- PARSER-FIXES-SESSION-2.md (variadic functions, keywords)

Updated:
- errors-fix.md (fixed inconsistencies, updated roadmap)

Cumulative progress: 853 → 392 errors (-54.1%)"
```

#### 5. Release: Version 0.4.3 preparation
```bash
git add package.json CHANGELOG.md README.md
git commit -m "chore: bump version to 0.4.3 and update release docs

- package.json: 0.4.2 → 0.4.3
- CHANGELOG.md: Add Session 2, 3, 4 entries
- README.md: Add Parser & Validator Improvements section

Session 4 total: -171 errors (-30.4%)
Cumulative: -461 errors (-54.1% from baseline)"
```

---

## Benefits of Granular Commits

1. **Easy Cherry-picking**: Can pick specific features for backporting
2. **Clearer History**: `git log --oneline` shows exactly what changed
3. **Better Bisecting**: Can pinpoint which feature introduced a regression
4. **Easier Reviews**: Reviewers can focus on one feature at a time
5. **Cleaner Reverts**: Can revert specific features without undoing everything

---

## Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <short summary>

<detailed description>

Impact: <error reduction or other metrics>
Files: <key files with line numbers>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code refactoring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Tooling, dependencies, version bumps

### Scopes
- `parser`: Parser changes
- `validator`: Validator/type checker changes
- `lexer`: Lexer/tokenizer changes
- `mcp`: MCP server changes
- `extension`: VSCode extension changes

---

## For Future Sessions

**Before starting work:**
1. Plan logical feature boundaries
2. Note which files each feature will touch
3. Commit each feature as soon as it's working and tested

**During work:**
- Keep related changes together in one commit
- Split unrelated changes into separate commits
- Test each commit independently before moving to next

**After session:**
- Review commit history (`git log --oneline`)
- Ensure each commit is self-contained
- Update documentation in its own commit

---

**Session 5 VIOLATION (93420c8):**
❌ Merged feature branch directly to main without PR
❌ Should have: Created PR → Review → Merge via GitHub
✅ At least used feature branch with granular commits

**CRITICAL REMINDER:**
🚨 ALWAYS USE PULL REQUESTS - NEVER MERGE DIRECTLY TO MAIN
🚨 Feature branch → Push → Create PR → Merge via GitHub UI

**Last Updated:** 2025-10-06
