const Youdao = require('youdao-fanyi');
const fs = require('fs');
const path = require('path');
const config = require("../config");
const originData = require("../sources/zh_CN.json");

// 初始化有道翻译API
const fanyi = Youdao({
  appkey: config.APP_KEY,
  secret: config.APP_SECRET,
});

// 翻译并保存到文件
let lang = "en";
let allKeyList = [];

// 获取命令行参数，去掉前两个固定参数
const args = process.argv.slice(2) || [];
const tempLang = args[0] || "";
if (tempLang) {
  lang = tempLang;
  console.log(`当前翻译生成:${tempLang}.md`);
}

// 翻译函数
async function translateText(text, toLang) {
  try {
    const res = await fanyi(text, toLang);
    // const res = await fanyi('你好', { to: 'vi' });
    const { translation } = res || {};
    let outStr = "";
    if (translation && translation.length) {
      outStr = translation[0];
    }
    console.log(res, 'res_001');
    return outStr;
  } catch (error) {
    console.log(`youdao_translate_error`, error);
  }
}

async function mapTranslateFn(index) {
  if (index == allKeyList.length) {
    // 写入文件
    fs.appendFileSync(path.join(__dirname, '../output_md', `${lang}.md`), "```" + '\n');
    console.log(`翻译且保存完毕`);
  } else {
    console.log(`正在翻译第: ${index}行`);
    const key = allKeyList[index];
    const nextStr = originData[key];
    if (nextStr) {
      const str = await translateText(nextStr, { to: lang });
      if (str) {
        console.log(`successed_current`, str);
        fs.appendFileSync(path.join(__dirname, '../output_md', `${lang}.md`), `${key}=${str}` + '\n');
        mapTranslateFn(index + 1);
      } else {
        setTimeout(()=> {
          mapTranslateFn(index);
        }, 3000)
        console.log(`repeatting_current`, nextStr);
      }
    }
  }
}
// 翻译并保存
async function translateAndSave(originData) {
  allKeyList = Object.keys(originData || {});
  if (allKeyList && allKeyList.length) {
    await mapTranslateFn(0);
  } else {
    console.log("先生成json格式的数据再翻译")
  }
}

function createFileFn() {
  // 使用空字符串创建并清空指定文件 zh.md 文件
  const createFile = path.join(__dirname, `../output_md/${lang}.md`);
  fs.writeFile(createFile, '```javascript' + "\n", (err) => {
    if (err) {
      console.error('创建文件时发生错误:', err);
    } else {
      console.log(`${lang}.md 文件已创建并清空`);
      translateAndSave(originData);
    }
  });
}
// 先创建静态文件
createFileFn();