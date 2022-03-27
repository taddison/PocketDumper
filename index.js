import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getRequestToken, getAccessToken, getArticles } from "./pocketApi.js";
import { getSecretsFromFile, updateSecretsFile } from "./util.js";

const constants = {
  RedirectUri: "http://localhost:3000",
  SecretsFileName: "secrets.json",
};

let { AccessToken, ConsumerKey } = await getSecretsFromFile(constants.SecretsFileName);

// TODO: If there is an access token, check it is still valid

// If there is no access token, get one and store it in the secrets file
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

  AccessToken = await getAccessToken(requestToken, ConsumerKey);

  await updateSecretsFile(constants.SecretsFileName, AccessToken, ConsumerKey);
}

const { articleList, newSince } = await getArticles(AccessToken, ConsumerKey);
console.log({ articles: Object.keys(articleList).length, newSince });

// TODO: Write to file
