export interface SuggestedTeacherNameFields {
  nombresDocenteSugerido?: string;
  apellidosDocenteSugerido?: string;
  nombreDocenteSugerido?: string;
}

export function buildSuggestedTeacherName(fields: SuggestedTeacherNameFields): string {
  const nombres = fields.nombresDocenteSugerido?.trim();
  const apellidos = fields.apellidosDocenteSugerido?.trim();

  if (nombres && apellidos) {
    return `${nombres} ${apellidos}`;
  }

  return fields.nombreDocenteSugerido?.trim() || '';
}

export function buildSuggestedTeacherSearchText(fields: SuggestedTeacherNameFields): string {
  const values = [
    buildSuggestedTeacherName(fields),
    fields.nombreDocenteSugerido?.trim() || ''
  ].filter(Boolean);

  return values.join(' ').toLowerCase();
}
