# Shadcn v4 Component Update Plan

## Context

The project uses the Shadcn v4 CLI with the `base-vega` Base UI style. Shadcn components are copied into `components/ui`, so upgrading the CLI does not update those files automatically. The v4 registry reports updates for 43 installed components.

Do not overwrite the full component set in one command. Registry updates can include public API changes, behavior changes, accessibility changes, and local customizations.

## Current Risk

`components/ui/accordion.tsx` currently supports the legacy `type` and `multiple` props. The v4 registry version passes `AccordionPrimitive.Root.Props` through directly and removes that compatibility behavior.

Before updating Accordion, replace `type="multiple"` with the Base UI `multiple` boolean prop in these callers, then confirm that multiple panels can still remain open:

- `app/exercises/odd-one-out/odd-one-out.config.tsx`
- `app/exercises/word-matching/word-matching.results.tsx`

## Update Procedure

1. Create a dedicated branch and commit the current component sources before each logical group.
2. Inspect each registry update without writing files:

   ```bash
   npx shadcn add <component> --diff
   ```

3. Search for imports and usages of the component before applying its update.
4. Merge registry changes with local customizations rather than overwriting files blindly.
5. Run `npm run ts-check` and `npm run check` after every group.
6. Exercise the affected dashboard and exercise flows in the browser before committing.

## Migration Groups

### 1. API-sensitive components

Update these individually after reviewing callers and the Base UI documentation:

- Accordion
- Checkbox
- Combobox
- Command
- Context Menu
- Dialog
- Dropdown Menu
- Form
- Navigation Menu
- Popover
- Select
- Sheet
- Sidebar
- Slider
- Switch
- Tabs
- Tooltip

For Accordion, replace the removed `type` compatibility prop in both known call sites before applying the registry update. Add a focused interaction test or browser check for multiple expanded items.

### 2. Form and input components

Update together and validate focus, labels, errors, disabled states, and form submission:

- Field
- Input
- Input Group
- Label
- Native Select
- Textarea

### 3. Layout and feedback components

Update together and compare light and dark themes at desktop and mobile widths:

- Alert
- Alert Dialog
- Avatar
- Badge
- Breadcrumb
- Button
- Button Group
- Card
- Empty
- Pagination
- Progress
- Separator
- Skeleton
- Spinner
- Table
- Sonner

### 4. Data display and utility components

Update last, then verify charts, scrolling, resizing, and keyboard behavior:

- Chart
- Hover Card
- Resizable
- Scroll Area

## Completion Criteria

- Every registry diff has been reviewed and merged deliberately.
- All imports and call sites compile without deprecated compatibility props.
- `npm run ts-check` and `npm run check` pass.
- A browser smoke test covers dialogs, menus, form validation, Accordion multiple selection, sidebar navigation, and toast notifications.
- Each migration group is committed separately to make regressions easy to isolate and revert.
