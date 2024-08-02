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
const translatedData = {};
let allKeyList = [];
// 获取命令行参数，去掉前两个固定参数
const args = process.argv.slice(2) || [];
const tempLang = args[0] || "";
if (tempLang) {
  lang = tempLang;
  console.log(`当前翻译生成:${tempLang}.json`);
}

// 指定输出文件路径
const outputFilePath = path.join(__dirname, `../output_json/${lang}.json`);

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
    console.log(res, 'result_01');
    return outStr;
  } catch (error) {
    console.log(`youdao_translate_error`, error);
  }
}

async function mapTranslateFn(index) {
  if (index === allKeyList.length) {
    // 写入文件
    fs.writeFileSync(outputFilePath, JSON.stringify(translatedData, null, 2));
    console.log(`翻译结果已保存到 ${outputFilePath}`);
  } else {
    const key = allKeyList[index] || "";
    const nextStr = originData[key] || null;
    if (nextStr) {
      const str = await translateText(nextStr, { to: lang });
      if (str) {
        console.log(`successed_current`, str);
        translatedData[key] = str;
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

async function translateAndSave(originData) {
  allKeyList = Object.keys(originData || {});
  if (allKeyList && allKeyList.length) {
    await mapTranslateFn(0);
  } else {
    console.log("先生成json格式的数据再翻译")
  }
}

translateAndSave(originData);