import credentialsFile from "./ut3_credentials.json";

let credentials;
if (!credentialsFile.username || !credentialsFile.password) {
  credentials = null;
}
else credentials = credentialsFile;

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["node_modules"],
  globals: {
    "__UT3_CREDENTIALS": credentials
  }
};