import { ensureAccessTokenIsValid, getArticles } from "./pocketApi.js";
import { getUserData, updateUserData, writeArticlesToFile } from "./util.js";

let { AccessToken, ConsumerKey, Since = 0 } = await getUserData();

AccessToken = await ensureAccessTokenIsValid(AccessToken, ConsumerKey);

const { articleList, newSince } = await getArticles(
  AccessToken,
  ConsumerKey,
  Since
);

// articleList is an object where each saved article is a property
// where the key is the article ID
const articleCount = Object.keys(articleList).length;

if (articleCount === 0) {
  console.log("No articles to write");
} else {
  await writeArticlesToFile(articleList);
  console.log(`Wrote ${articleCount} articles`);
}

if (newSince > Since) {
  await updateUserData({ Since: newSince });
}
