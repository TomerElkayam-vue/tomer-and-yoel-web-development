/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvitomerment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
