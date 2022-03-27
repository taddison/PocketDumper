import { ensureAccessTokenIsValid, getArticles } from "./pocketApi.js";
import { getSecretsFromFile } from "./util.js";

let { AccessToken, ConsumerKey } = await getSecretsFromFile();

AccessToken = await ensureAccessTokenIsValid(AccessToken, ConsumerKey);

const { articleList, newSince } = await getArticles(AccessToken, ConsumerKey);
console.log({ articles: Object.keys(articleList).length, newSince });

// TODO: Write to file
