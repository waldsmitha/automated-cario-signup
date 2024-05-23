import puppeteer from "puppeteer";
import users from "./data/users.js";

export const main = async (url) => {
  const browser = await puppeteer.launch({ headless: "new" });

  for (const user of users) {
    const page = await browser.newPage();
    try {
      console.log(
        `Creating account for ${user.firstName} ${user.lastName}, on  ${url}`
      );
      await signUp(user, page, url);
      console.log(`${user.firstName} ${user.lastName} created on ${url}`);
    } catch (e) {
      console.log(e);
    }
  }

  await browser.close();
};

async function signUp(user, page, url) {
  await page.goto(url, { waitUntil: "load", timeout: 0 });

  const clickBtn = async (selector) => {
    const btn = await page.waitForSelector(`${selector}`);
    btn.click();
  };
  const setInputText = async (selector, val) => {
    await page.waitForSelector(`input[name="${selector}"]`);
    await page.focus(`input[name="${selector}"]`);
    await page.keyboard.type(val);
  };
  const setSelect = async (selector, val) => {
    await page.waitForSelector(`#${selector}`);
    await page.$eval(`#${selector}`, async (el) => {
      el.nextElementSibling.children[0].children[0].focus();
    });
    await page.keyboard.press("Enter");

    const liSelector = `li[data-value="${val}"]`;
    await page.waitForSelector(liSelector);
    await page.$eval(liSelector, (e) => e.click());
  };

  const setInputChecked = async (selector) => {
    const checkbox = await page.waitForSelector(`input[name="${selector}"]`);
    await checkbox.click();
  };

  const setContactMethod = async () => {
    await page.evaluate(async () => {
      const checkbox = document.querySelectorAll(`input[type="checkbox"]`)[1];
      checkbox.click();
    });
  };

  console.log("Starting inputs...");
  await setInputText("name.firstName", user.firstName);
  await setInputText("name.lastName", user.lastName);
  await setInputText("address.line1", user.line1);
  await setInputText("address.city", user.city);
  await setSelect("State", user.state);
  await setInputText("address.zip", user.zip);
  await setInputText("email", user.email);
  await setInputText("phoneNumber", user.phone);
  await setContactMethod();
  await setInputText("driverLicenseNumber", user.driverLicenseNumber);
  await setInputText("password", "Pass4ord!");
  await setInputText("confirmPassword", "Pass4ord!");
  await setInputChecked("acceptance");
  await clickBtn("#continueBtn");
  await clickBtn("#skipBtn");

  console.log("Inputs successful, waiting for page navigation...");
  await page.waitForNavigation();

  console.log("Page navigation success. Closing page.");
  await page.close();
}
