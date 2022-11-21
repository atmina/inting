/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
        ],
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
  ignorePatterns: ["node_modules", "dist"],
  parserOptions: {
    // https://github.com/vercel/next.js/issues/40687#issuecomment-1264177674
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
