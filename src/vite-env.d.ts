/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EU_FRANKFURT_DB_ID: string
  readonly VITE_APAC_SINGAPORE_DB_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
