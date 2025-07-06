import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const shimmerButtonVariants = cva(
  'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap text-accent-foreground transition-transform duration-300 ease-in-out hover:scale-105',
  {
    variants: {
      size: {
        default: 'h-10 px-6 py-3 text-sm rounded-md',
        sm: 'h-9 px-4 text-sm rounded-md',
        lg: 'h-11 px-8 text-base rounded-lg',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shimmerButtonVariants> {
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
  background?: string;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = 'hsl(0 0% 100% / 0.1)',
      shimmerSize = '0.1em',
      shimmerDuration = '3s',
      background = 'hsl(var(--accent))',
      className,
      children,
      size,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            '--shimmer-color': shimmerColor,
            '--shimmer-size': shimmerSize,
            '--shimmer-duration': shimmerDuration,
            '--background': background,
          } as React.CSSProperties
        }
        className={cn(shimmerButtonVariants({ size, className }), '[background:var(--background)]')}
        ref={ref}
        {...props}
      >
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
          <div
            className={cn(
              'absolute inset-0 z-0 h-full w-full',
              'bg-repeat bg-[length:50%_100%] bg-gradient-to-r from:transparent_0% via:transparent_25% via-[color:var(--shimmer-color)]_50% via:transparent_75% to:transparent_100%',
              'animate-shimmer'
            )}
          />
        </div>
        <div className="relative z-10 flex items-center space-x-2">{children}</div>
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';

export { ShimmerButton };
