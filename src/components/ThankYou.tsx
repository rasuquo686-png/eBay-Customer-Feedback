import { useEffect, useRef } from 'react';

interface ThankYouProps {
  onReset: () => void;
}

export function ThankYou({ onReset }: ThankYouProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="thank-you-heading"
      className="bg-[#F7F7F7] rounded-[16px] px-6 py-10 sm:px-10 sm:py-14 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#3665F3] mx-auto flex items-center justify-center">
        <svg
          className="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2
        id="thank-you-heading"
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 text-2xl sm:text-[28px] font-bold text-[#191919] focus:outline-none"
      >
        Thank you for your feedback!
      </h2>

      <p className="mt-3 text-base text-[#707070] max-w-md mx-auto">
        Your answers help us make eBay better for everyone.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-full bg-[#3665F3] hover:bg-[#2B50C2] text-white text-base font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#86A5FF]"
        >
          Submit another response
        </button>

        <a
          href="https://www.ebay.com"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-base font-semibold text-[#3665F3] hover:text-[#2B50C2] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#86A5FF] rounded-full"
        >
          Back to eBay
        </a>
      </div>
    </section>
  );
}
