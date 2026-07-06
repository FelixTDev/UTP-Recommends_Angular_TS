import {
  buildSuggestedTeacherName,
  buildSuggestedTeacherSearchText
} from './suggested-teacher-name.util';

describe('suggested teacher name util', () => {
  it('prefers separated names over legacy combined field', () => {
    expect(
      buildSuggestedTeacherName({
        nombresDocenteSugerido: 'Armando',
        apellidosDocenteSugerido: 'Paredes',
        nombreDocenteSugerido: 'Armando|Paredes'
      })
    ).toBe('Armando Paredes');
  });

  it('falls back to legacy combined field when separated names are unavailable', () => {
    expect(
      buildSuggestedTeacherName({
        nombreDocenteSugerido: 'Armando|Paredes'
      })
    ).toBe('Armando|Paredes');
  });

  it('builds searchable text from both separated fields and legacy fallback', () => {
    expect(
      buildSuggestedTeacherSearchText({
        nombresDocenteSugerido: 'Armando',
        apellidosDocenteSugerido: 'Paredes',
        nombreDocenteSugerido: 'Armando|Paredes'
      })
    ).toBe('armando paredes armando|paredes');
  });
});
