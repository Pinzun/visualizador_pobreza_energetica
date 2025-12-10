/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOCKER_POLL?: string;
  readonly VITE_DISABLE_BACKEND?: string;
  readonly VITE_GEO_ZIP_BASE?: string;
  readonly VITE_GEO_ZIP_MANIFEST?: string;
  readonly VITE_GEO_BATCH_SIZE?: string;
  // agrega más si tienes
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
