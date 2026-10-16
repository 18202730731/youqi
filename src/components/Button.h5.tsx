import { ButtonProps } from '@tarojs/components'

// Native H5 buttons provide keyboard activation and correct accessibility roles.
// The mini-program build resolves Button.tsx to the native WeChat component.
export function Button({ className, onClick, disabled, ariaLabel, 'aria-label': label, children, loading, style }: ButtonProps & { 'aria-label'?: string }) {
  return <button type='button' className={`youqi-button ${className || ''}`} aria-label={label || ariaLabel} aria-busy={loading || undefined} disabled={disabled || loading} style={style as React.CSSProperties} onClick={event => onClick?.(event as unknown as Parameters<NonNullable<ButtonProps['onClick']>>[0])}>{children}</button>
}
