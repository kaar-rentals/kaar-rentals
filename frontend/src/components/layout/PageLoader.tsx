const PageLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="text-center py-12" role="status" aria-live="polite">
    <img
      src="/logo-icon.svg"
      alt=""
      aria-hidden="true"
      className="h-8 w-16 mx-auto mb-4 animate-pulse [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(61%)_saturate(497%)_hue-rotate(10deg)_brightness(95%)_contrast(92%)] dark:[filter:brightness(0)_saturate(100%)_invert(67%)_sepia(61%)_saturate(497%)_hue-rotate(10deg)_brightness(95%)_contrast(92%)]"
      width={64}
      height={32}
      decoding="async"
    />
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

export default PageLoader;
