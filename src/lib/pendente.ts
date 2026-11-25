/**
 * Texto que ainda não chegou (spec 6.3): o arquivo existe, o campo vale "[PENDENTE]".
 * Passa no schema para a homologação mostrar a página; a trava impede a publicação.
 */
export const PENDENTE = '[PENDENTE]';
export const pendente = (t: string) => t.trim() === PENDENTE;
