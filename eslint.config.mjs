import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "js/**",
      "css/**",
      "img/**",
      "categories/**",
      "tags/**",
      "index.html",
      "index.xml",
      "sitemap.xml",
      "linkedin_profile.txt",
      "out/**"
    ]
  },
  ...nextVitals,
  ...nextTypescript
];

export default eslintConfig;
