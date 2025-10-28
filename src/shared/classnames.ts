import clsx from 'clsx';

export const rootContainerClasses = (displayMode: string): string =>
  clsx(
    'relative antialiased w-full min-h-[480px] overflow-hidden pt-4',
    displayMode === 'fullscreen'
      ? 'rounded-none border-0'
      : 'border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl'
  );

export const mapWrapperClasses = (displayMode: string): string =>
  clsx(
    'absolute inset-0 overflow-hidden',
    displayMode === 'fullscreen'
      ? 'md:left-[340px] md:right-4 md:top-4 md:bottom-4 border border-black/10 md:rounded-3xl'
      : 'w-full h-full'
  );

export const hotelCardContainerClasses = (): string =>
  'flex flex-col select-none flex-[0_0_35vw] mx-2';

export const hotelImageClasses = (): string =>
  'w-full max-w-[35vw] aspect-square rounded-2xl object-cover ring-1 ring-black/5';
