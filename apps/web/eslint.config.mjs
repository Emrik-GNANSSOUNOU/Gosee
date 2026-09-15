import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  // FlatCompat ne reprend pas les ignores intégrés d'eslint-config-next
  // (.eslintignore n'existe pas en flat config) : sans ceci, eslint lint
  // aussi les fichiers générés par Next (.next/types/**), ce qui remonte
  // des milliers de faux positifs.
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
