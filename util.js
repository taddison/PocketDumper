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

  const userDataString = await readFile(USER_DATA_FILE_NAME, {
    encoding: "utf8",
  });
  const userData = JSON.parse(userDataString);

  const { ConsumerKey, AccessToken, Since } = userData;

  if (!ConsumerKey) {
    console.log(`Consumer key is missing from ${USER_DATA_FILE_NAME}`);
    exit();
  }

  return { ConsumerKey, AccessToken, Since };
};

export const updateUserData = async function (updatedUserData) {
  const existingUserData = await getUserData();

  const newData = { ...existingUserData, ...updatedUserData };
  const updatedUserDataString = JSON.stringify(newData);

  await writeFile(USER_DATA_FILE_NAME, updatedUserDataString);
};

export const writeArticlesToFile = async function (articleList) {
  // Indent with 2 spaces
  const articleListString = JSON.stringify(articleList, null, 2);

  const folder = "./articles";
  if (!(await checkPathExists(folder))) {
    await mkdir(folder);
  }

  // YYYY-MM-DDTHH:MM:SS
  const fileName = `${new Date().toISOString().slice(0, 19)}.json`;

  await writeFile(`${folder}/${fileName}`, articleListString);
};
