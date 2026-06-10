# ROFIT Footer

Umbrella footer component — shows "under rofit.ro ⛱" with a hover popover displaying an animated umbrella GIF.

## Usage

```tsx
import { RofitUmbrella } from "@/rofit-footer/components/RofitUmbrella";

<footer>
  <p>© 2026 Your Company</p>
  <RofitUmbrella className="font-mono text-xs text-muted-foreground hover:text-accent" />
</footer>
```

Style-agnostic — zero CSS included. Apply `className` from outside.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | `"under rofit.ro ⛱"` | Custom text content |
| `className` | `string` | `""` | Tailwind/className to apply |
