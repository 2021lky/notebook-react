import { languages } from './languages.json';

export const SupportedLanguages = languages.filter((language) => language.supported).map(item => item.code);

export default languages;
