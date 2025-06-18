
# metakit.ai Design System

*Inspired by modern SaaS applications like dub.co*

## Color Palette

### Primary Colors
- **Background**: `#ffffff` (Pure white)
- **Surface**: `#f8fafc` (Slate 50 - Light gray background)
- **Surface Elevated**: `#ffffff` (White cards on gray background)
- **Border**: `#e2e8f0` (Slate 200 - Subtle borders)
- **Border Hover**: `#cbd5e1` (Slate 300)

### Text Colors
- **Primary Text**: `#0f172a` (Slate 900 - High contrast)
- **Secondary Text**: `#475569` (Slate 600 - Medium contrast)
- **Muted Text**: `#94a3b8` (Slate 400 - Low contrast)
- **Placeholder**: `#cbd5e1` (Slate 300)

### Interactive Colors
- **Primary**: `#3b82f6` (Blue 500 - Primary actions)
- **Primary Hover**: `#2563eb` (Blue 600)
- **Primary Light**: `#dbeafe` (Blue 100 - Light background)
- **Secondary**: `#f1f5f9` (Slate 100 - Secondary buttons)
- **Secondary Hover**: `#e2e8f0` (Slate 200)

### Status Colors
- **Success**: `#10b981` (Emerald 500)
- **Success Light**: `#d1fae5` (Emerald 100)
- **Warning**: `#f59e0b` (Amber 500)
- **Warning Light**: `#fef3c7` (Amber 100)
- **Error**: `#ef4444` (Red 500)
- **Error Light**: `#fee2e2` (Red 100)
- **Info**: `#8b5cf6` (Violet 500)
- **Info Light**: `#ede9fe` (Violet 100)

### Gradient Accents
- **Primary Gradient**: `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`
- **Success Gradient**: `linear-gradient(135deg, #10b981 0%, #06b6d4 100%)`
- **Warm Gradient**: `linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)`

## Typography Scale

### Font Families
- **Primary**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace**: `"SF Mono", Monaco, "Cascadia Code", monospace`

### Font Sizes
- **xs**: `0.75rem` (12px)
- **sm**: `0.875rem` (14px)
- **base**: `1rem` (16px)
- **lg**: `1.125rem` (18px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `1.875rem` (30px)
- **4xl**: `2.25rem` (36px)

### Font Weights
- **Light**: `300`
- **Normal**: `400`
- **Medium**: `500`
- **Semibold**: `600`
- **Bold**: `700`

## Spacing Scale

Based on 4px base unit:
- **0**: `0px`
- **1**: `4px`
- **2**: `8px`
- **3**: `12px`
- **4**: `16px`
- **5**: `20px`
- **6**: `24px`
- **8**: `32px`
- **10**: `40px`
- **12**: `48px`
- **16**: `64px`
- **20**: `80px`
- **24**: `96px`

## Border Radius
- **sm**: `4px`
- **base**: `6px`
- **md**: `8px`
- **lg**: `12px`
- **xl**: `16px`
- **2xl**: `24px`
- **full**: `9999px`

## Shadows
- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **base**: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
- **xl**: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`

## Component Guidelines

### Cards
- Use white background (`#ffffff`) on light gray page backgrounds
- Apply subtle border (`#e2e8f0`) or light shadow
- Maintain 24px padding for content areas
- Use 12px border radius for modern feel

### Buttons
- **Primary**: Blue background with white text
- **Secondary**: Light gray background with dark text
- **Ghost**: Transparent background with colored text
- Consistent 8px border radius
- Clear hover states with darker variants

### Forms
- Clean white input backgrounds
- Subtle borders that strengthen on focus
- Consistent spacing and alignment
- Clear error states with red accents

### Navigation
- Clean sidebar with subtle background differentiation
- Clear active states with colored accents
- Consistent iconography using lucide-react
- Logical grouping and hierarchy

### Data Display
- Clean tables with alternating row backgrounds
- Subtle dividers and clear typography hierarchy
- Status indicators using color-coded badges
- Responsive design patterns

## Accessibility

### Contrast Ratios
- Text on white: minimum 7:1 (AAA level)
- Interactive elements: minimum 4.5:1 (AA level)
- Secondary text: minimum 4.5:1 (AA level)

### Focus States
- Clear focus rings using primary color
- Logical tab order
- Keyboard navigation support

### Color Usage
- Never rely solely on color to convey information
- Include text labels and icons for status indicators
- Maintain sufficient contrast in all states

## Implementation Notes

### CSS Custom Properties
All colors should be implemented as CSS custom properties for easy theming and dark mode support.

### Tailwind Integration
Map design tokens to Tailwind CSS configuration for consistent usage across components.

### Component Consistency
- Use consistent spacing patterns
- Implement hover and focus states uniformly
- Maintain visual hierarchy through typography and spacing

---

*Last Updated: 2025-01-18*
*Status: Active Design System*
