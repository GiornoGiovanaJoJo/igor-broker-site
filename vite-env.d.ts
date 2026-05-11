/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_YANDEX_METRIKA_ID?: string;
  readonly VITE_PHONE_DISPLAY?: string;
  readonly VITE_PHONE_TEL?: string;
  readonly VITE_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
