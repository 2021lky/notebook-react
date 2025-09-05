import { languages } from './languages.json';

export const SupportedLanguages = languages.filter((language) => language.supported).map(item => item.value);

export default languages.filter((language) => language.supported);
