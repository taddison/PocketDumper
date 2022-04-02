import { ensureAccessTokenIsValid, getArticles } from "./pocketApi.js";
import { getUserData, updateUserData } from "./util.js";

let { AccessToken, ConsumerKey, Since = 0 } = await getUserData();

AccessToken = await ensureAccessTokenIsValid(AccessToken, ConsumerKey);

const { articleList, newSince } = await getArticles(AccessToken, ConsumerKey, Since);

if(newSince > Since) {
  await updateUserData({Since: newSince});
}

console.log({ articles: Object.keys(articleList).length, newSince });

// TODO: Write to file
