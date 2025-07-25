import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SecurityHeadersProps {
  nonce?: string;
}

export const SecurityHeaders = ({ nonce }: SecurityHeadersProps) => {
  useEffect(() => {
    // Set security headers programmatically for runtime enforcement
    const metaElements = document.querySelectorAll('meta[http-equiv]');
    metaElements.forEach(el => el.remove());

    // Content Security Policy
    const cspMeta = document.createElement('meta');
    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
    cspMeta.setAttribute('content', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' data: https://fonts.gstatic.com; " +
      "connect-src 'self' https://yaincoxihiqdksxgrsrk.supabase.co wss://yaincoxihiqdksxgrsrk.supabase.co https://api.stripe.com https://api.suno.ai https://api.openai.com; " +
      "media-src 'self' blob: data: https:; " +
      "frame-src https://js.stripe.com https://hooks.stripe.com; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "upgrade-insecure-requests;"
    );
    document.head.appendChild(cspMeta);

    // X-Frame-Options
    const frameMeta = document.createElement('meta');
    frameMeta.setAttribute('http-equiv', 'X-Frame-Options');
    frameMeta.setAttribute('content', 'DENY');
    document.head.appendChild(frameMeta);

    // X-Content-Type-Options
    const contentTypeMeta = document.createElement('meta');
    contentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
    contentTypeMeta.setAttribute('content', 'nosniff');
    document.head.appendChild(contentTypeMeta);

    // Referrer Policy
    const referrerMeta = document.createElement('meta');
    referrerMeta.setAttribute('name', 'referrer');
    referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
    document.head.appendChild(referrerMeta);

    // Permissions Policy
    const permissionsMeta = document.createElement('meta');
    permissionsMeta.setAttribute('http-equiv', 'Permissions-Policy');
    permissionsMeta.setAttribute('content', 
      'geolocation=(), microphone=(), camera=(), payment=(self), fullscreen=(self)'
    );
    document.head.appendChild(permissionsMeta);

  }, [nonce]);

  return (
    <Helmet>
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {nonce && <meta name="csp-nonce" content={nonce} />}
    </Helmet>
  );
};