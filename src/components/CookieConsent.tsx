"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Google Analytics 4 yalnızca ziyaretçi onay verirse yüklenir (Belçika/AB: analiz çerezi onay ister).
 * Ölçüm kimliği tanımlı değilse hiçbir şey gösterilmez. Seçim bu tarayıcıda saklanır;
 * alt bilgideki "Çerez ayarları" düğmesi şeridi yeniden açar.
 */
const KEY = "mx-consent";
export const OPEN_EVENT = "mx-consent-open";
type Choice = "granted" | "denied";

function read(): Choice | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

let memory: Choice | null = null; // depolama kapalıysa (özel pencere) seçim bu sayfa için burada kalır
const CHANGE_EVENT = "mx-consent-change";

function save(v: Choice) {
  memory = v;
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    /* depolama kapalı */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Sunucuda ve ilk çizimde "pending": şerit, tarayıcı seçimi okuyana kadar görünmez. */
const snapshot = (): Choice | null => read() ?? memory;

export type ConsentText = { text: string; accept: string; reject: string; more: string };

export function CookieConsent({ gaId, text, privacyHref }: { gaId?: string; text: ConsentText; privacyHref: string }) {
  const choice = useSyncExternalStore<Choice | null | "pending">(subscribe, snapshot, () => "pending");
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);
  const open = choice === null || reopened;

  if (!gaId || !/^G-[A-Z0-9]+$/.test(gaId)) return null;

  const decide = (v: Choice) => {
    const was = choice;
    save(v);
    setReopened(false);
    if (v === "denied" && was === "granted") window.location.reload(); // yüklenmiş etiketi bırakmak için
  };

  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {open && (
        <div role="dialog" aria-live="polite" className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md sm:rounded-xl sm:border">
          <p className="text-sm text-ink-800">
            {text.text}{" "}
            <Link href={privacyHref} className="font-semibold underline">{text.more}</Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => decide("granted")} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white">{text.accept}</button>
            <button type="button" onClick={() => decide("denied")} className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-800">{text.reject}</button>
          </div>
        </div>
      )}
    </>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="font-semibold hover:text-brand-500">
      {label}
    </button>
  );
}
