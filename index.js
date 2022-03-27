import { ensureAccessTokenIsValid, getArticles } from "./pocketApi.js";
import { getSecretsFromFile } from "./util.js";

const constants = {
  SecretsFileName: "secrets.json",
};

let { AccessToken, ConsumerKey } = await getSecretsFromFile(constants.SecretsFileName);

AccessToken = await ensureAccessTokenIsValid(AccessToken, ConsumerKey, constants.SecretsFileName);

const { articleList, newSince } = await getArticles(AccessToken, ConsumerKey);
console.log({ articles: Object.keys(articleList).length, newSince });

// TODO: Write to file
