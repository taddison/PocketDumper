import { ensureAccessTokenIsValid, getArticles } from "./pocketApi.js";
import { getUserData, updateUserData, writeArticlesToFile } from "./util.js";

let { AccessToken, ConsumerKey, Since = 0 } = await getUserData();

AccessToken = await ensureAccessTokenIsValid(AccessToken, ConsumerKey);

const { articleList, newSince } = await getArticles(
  AccessToken,
  ConsumerKey,
  Since
);

if (!articleList.length) {
  console.log("No articles to write");
} else {
  await writeArticlesToFile(articleList);
}

if (newSince > Since) {
  await updateUserData({ Since: newSince });
}
