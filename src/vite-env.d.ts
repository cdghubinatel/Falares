/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endereço da API quando ela não está no mesmo domínio do site, ex.: https://falares-api.onrender.com */
  readonly VITE_API_URL?: string;
  /** "1" para publicar sem API: a validação mostra o resultado sem salvar. */
  readonly VITE_NO_API?: string;
}
