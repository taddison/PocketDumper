import * as readline from "node:readline/promises";
import { exit, stdin as input, stdout as output } from "node:process";
import { readFile, writeFile, access } from "node:fs/promises";
import { getRequestToken, getAccessToken, getArticles } from "./pocketApi.js";

const constants = {
  RedirectUri: "http://localhost:3000",
  SecretsFile: "secrets.json",
};

try {
  await access(constants.SecretsFile);
} catch {
  console.log(`Could not find ${constants.SecretsFile}`);
  exit();
}

const secretFileContents = await readFile(constants.SecretsFile, {
  encoding: "utf8",
});
const secrets = JSON.parse(secretFileContents);

let { ConsumerKey, AccessToken } = secrets;

// TODO: Check access token is still valid

if (!AccessToken) {
  const requestToken = await getRequestToken(
    ConsumerKey,
    constants.RedirectUri
  );

  console.log(
    `Please visit https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${constants.RedirectUri}`
  );
  const rl = readline.createInterface({ input, output });
  await rl.question("Press enter once you have authorized the application\r\n");
  rl.close();

  const accessToken = await getAccessToken(requestToken, ConsumerKey);
  AccessToken = accessToken;

  const updatedSecrets = JSON.stringify({
    AccessToken,
    ConsumerKey,
  });

  await writeFile(constants.SecretsFile, updatedSecrets);
}

const { articleList, newSince } = await getArticles(AccessToken, ConsumerKey);
console.log({ articles: Object.keys(articleList).length, newSince });

// TODO: Write to file
