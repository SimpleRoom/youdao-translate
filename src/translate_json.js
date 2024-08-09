const Youdao = require('youdao-fanyi');
const fs = require('fs');
const path = require('path');
const ChineseConverter = require( 'chinese-converter');
const config = require("../config");
const originData = require("../sources/zh_CN.json");

// 初始化有道翻译API
const fanyi = Youdao({
  appkey: config.APP_KEY,
  secret: config.APP_SECRET,
});
// 目标语言列表 英语,越南语,日语,西班牙语,俄语,韩语
const targetLanguages = ["zh_tw", "en", "vi", "ja", "es", "ru", "ko"];
const maxLangCount = targetLanguages.length;
// 翻译并保存到文件
// let lang = "en";
let langIndex = 0;//某种语言翻译完毕后就+1,直到全部翻译完毕
const translatedData = {};
let allKeyList = [];
// 输出文件名称 rc促销翻译使用
const allFileNames = {
  "zh_tw": "zh-CHT",
  "en": "en",
  "ja": "ja-JP",
  "vi": "vi-VN",
  "es": "es-ES",
  "ru": "tt-RU",
  "ko": "ko-KR",
}
// 获取命令行参数，去掉前两个固定参数
const args = process.argv.slice(2) || [];
const is2All = args[0] || "";

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

async function mapTranslateFn(index, targetLang) {
  if (index === allKeyList.length) {
    // 指定输出文件路径
    const fileName = allFileNames[targetLang];
    const outputFilePath = path.join(__dirname, `../output_json/${fileName}.json`);
    // 写入文件
    fs.writeFileSync(outputFilePath, JSON.stringify(translatedData, null, 2));
    langIndex += 1;
    if (langIndex == maxLangCount) {
      console.log(`${targetLanguages.join(",")}全部翻译保存完毕`)
    } else {
      translateAndSave(originData, langIndex);
    }
  } else {
    const key = allKeyList[index] || "";
    const nextStr = originData[key] || null;
    if (nextStr) {
      let str = nextStr;
      if (targetLang == "zh_tw") {
        // 转为繁体再转为unicode保存即可
        str = ChineseConverter.toTraditionalChinese(str);
      } else {
        str = await translateText(nextStr, { to: targetLang });
      }
      if (str) {
        console.log(`successed_current`, str);
        translatedData[key] = str;
        mapTranslateFn(index + 1, targetLang);
      } else {
        setTimeout(()=> {
          mapTranslateFn(index, targetLang);
        }, 3000)
        console.log(`repeatting_current`, nextStr);
      }
    }
  }
}

async function translateAndSave(originData, curLangIndex) {
  allKeyList = Object.keys(originData || {});
  if (allKeyList && allKeyList.length) {
    const tempLang = targetLanguages[curLangIndex];
    await mapTranslateFn(0, tempLang);
  } else {
    console.log("先生成json格式的数据再翻译")
  }
}
// 给单独执行 npm run to_json all 使用
if (is2All == "all") {
  translateAndSave(originData, langIndex);
}
function createFileAutoTranslateSave () {
  translateAndSave(originData, langIndex);
}
module.exports = {
  createFileAutoTranslateSave,
}