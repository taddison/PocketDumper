import { exit } from "node:process";
import { readFile, writeFile, access, mkdir } from "node:fs/promises";

const USER_DATA_FILE_NAME = "userdata.json";

async function checkPathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export const getUserData = async function () {
  if (!(await checkPathExists(USER_DATA_FILE_NAME))) {
    console.log(`Could not find ${USER_DATA_FILE_NAME}`);
    exit();
  }

  const userDataContents = await readFile(USER_DATA_FILE_NAME, {
    encoding: "utf8",
  });
  const userData = JSON.parse(userDataContents);

  let { ConsumerKey, AccessToken, Since } = userData;

  if (!ConsumerKey) {
    console.log(`Consumer key is missing from ${USER_DATA_FILE_NAME}`);
    exit();
  }

  return { ConsumerKey, AccessToken, Since };
};

export const updateUserData = async function (updatedData) {
  const existingData = await getUserData();

  const newData = { ...existingData, ...updatedData };
  const updatedUserData = JSON.stringify(newData);

  await writeFile(USER_DATA_FILE_NAME, updatedUserData);
};

export const writeArticlesToFile = async function (articleList) {
  const articleListString = JSON.stringify(articleList);
  // YYYY-MM-DDTHH:MM:SS
  const fileName = `${new Date().toISOString().slice(0, 19)}.json`;
  const folder = "./articles";

  if (!(await checkPathExists(folder))) {
    await mkdir(folder);
  }

  await writeFile(`${folder}/${fileName}`, articleListString);
};
