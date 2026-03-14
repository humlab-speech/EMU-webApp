# Keyboard Handler Refactoring Plan

## Objective
Refactor `handleGlobalKeyStrokes.service.ts` from nested if/else chains to action-map pattern for better maintainability and testability.

## Current State
- **File**: src/app/services/handleglobalkeystrokes.service.ts (990 lines)
- **Main methods**:
  - `applyKeyCode()` — dispatcher (line 116)
  - `handleHierarchyEditKeys()` — 36 lines with if chains (line 143)
  - `handleHierarchyNavKeys()` — 98 lines with if chains (line 184)
  - `handleEditingKeys()` — 68 lines with if chains (line 282)
  - `handleMainKeys()` — 213 lines with if chains (line 350)
  - 13 utility methods for specific operations (handleSnapBoundary, etc.)

## Refactoring Strategy

### Phase 1: handleHierarchyEditKeys (Smallest, 1 hour)
**Current pattern**:
```typescript
if (code === km.hierarchyCommitEdit) { /* 20 lines */ }
if (code === km.hierarchyCommitEdit) { /* duplicate check */ }
```

**Target pattern**:
```typescript
private createHierarchyEditActionMap() {
  return {
    [km.hierarchyCommitEdit]: () => this.commitHierarchyEdit(),
    [km.hierarchyCancelEdit]: () => this.cancelHierarchyEdit(),
  };
}

private handleHierarchyEditKeys(code, e) {
  const actionMap = this.createHierarchyEditActionMap();
  const action = actionMap[code];
  if (action) action();
}
```

### Phase 2: handleHierarchyNavKeys (Medium, 1 hour)
**Challenges**:
- Most complex handler (7+ actions)
- Some actions have multi-step logic
- Event.preventDefault() calls mixed in

**Solution**:
- Extract each action into private method
- Action map returns closures calling methods
- preventDefault handled by method, not in map

### Phase 3: handleEditingKeys (Medium, 1 hour)
**Challenges**:
- Text validation logic
- Legal labels checking
- Inline event handling

### Phase 4: handleMainKeys (Large, 2 hours)
**Challenges**:
- 213 lines, most complex
- Multiple action categories
- Complex state management

**Solution**:
- Consider sub-grouping by action type if possible
- Split into smaller action maps if necessary
- Keep logic readable even if not perfectly collapsed

## Implementation Rules

1. **Preserve behavior exactly** — No logic changes, only restructuring
2. **Keep methods testable** — Action handler methods stay private/public as needed
3. **Maintain performance** — Action map creation should be fast
4. **No additional dependencies** — Use existing services only
5. **Test frequently** — Run tests after each phase

## Action Map Pattern

```typescript
private createActionMap() {
  const km = this.ConfigProviderService.vals.keyMappings;
  return {
    [km.key1]: () => this.action1(),
    [km.key2]: () => this.action2(),
    [km.key3]: (e) => {
      e.preventDefault();
      this.action3();
    },
  };
}

private handleKeys(code, e) {
  const actionMap = this.createActionMap();
  const action = actionMap[code];
  if (action) action(e);
}
```

## Extract Action Methods Pattern

For large actions, extract to private methods:

```typescript
private commitEdit() {
  const elementID = this.ViewStateService.hierarchyState.getContextMenuID();
  // ... 20 lines of logic
  this.ViewStateService.hierarchyState.closeContextMenu();
}

private cancelEdit() {
  this.ViewStateService.hierarchyState.closeContextMenu();
}

private createActionMap() {
  return {
    [km.commit]: () => this.commitEdit(),
    [km.cancel]: () => this.cancelEdit(),
  };
}
```

## Testing Strategy

1. Run `npm test` after each phase — ensure no regressions
2. Manual testing with keyboard input
3. Check all key combinations still work:
   - Hierarchy editing
   - Main canvas navigation
   - Boundary manipulation
   - Segment operations

## Effort Breakdown

| Phase | Handler | Lines | Effort | Actions | Risk |
|-------|---------|-------|--------|---------|------|
| 1 | hierarchyEditKeys | 36 | 1h | 2 | Low |
| 2 | hierarchyNavKeys | 98 | 1h | 7+ | Medium |
| 3 | editingKeys | 68 | 1h | 6+ | Medium |
| 4 | mainKeys | 213 | 2h | 20+ | High |
| — | **Total** | **415** | **5h** | — | — |

Note: Current estimate is 3 hours for the audit plan, but full refactoring of all handlers would take ~5 hours. Can scope to Phase 1-2 for 2 hours if preferred.

## Rollback Plan

If issues arise:
1. Each phase is isolated
2. Can revert individual commits
3. Full service is well-tested (81 existing tests)
4. No changes to public API

## Success Criteria

- ✅ All 81 tests pass
- ✅ Keyboard input works identically to before
- ✅ Code is more readable
- ✅ Methods are testable in isolation
- ✅ No performance regression

## Next Steps

1. Review and approve plan
2. Implement Phase 1 (lowest risk, 1 hour)
3. Test thoroughly
4. Proceed to Phase 2 if desired
5. Can pause at any phase — partial refactoring is still valuable
