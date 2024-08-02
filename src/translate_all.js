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
// 目标语言列表 英语,越南语,日语,西班牙语,俄语,韩语
const targetLanguages = ["en", "vi", "ja", "es", "ru", "ko"];
const maxLangCount = targetLanguages.length;
let lang = "en";
let langIndex = 0;//某种语言翻译完毕后就+1,直到全部翻译完毕
let allKeyList = [];

// 将中文字符串转成Unicode码
function encodeUnicode(str) {
  let res = '';
  for (let i = 0; i < str.length; i++) {
    res += '\\u' + str.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return res;
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
// 逐行翻译,翻译失败3秒后继续
async function mapTranslateFn(index, lang) {
  if (index == allKeyList.length) {
    // 写入文件
    console.log(`${lang} 语言已经翻译且保存完毕`);
    langIndex += 1;
    if (langIndex == maxLangCount) {
      console.log(`${targetLanguages.join(",")}全部翻译保存完毕`)
    } else {
      translateAndSave(originData, langIndex);
    }
  } else {
    console.log(`正在翻译第: ${index}行`);
    const key = allKeyList[index];
    const nextStr = originData[key];
    if (nextStr) {
      const str = await translateText(nextStr, { to: lang });
      if (str) {
        console.log(`successed_current`, str);
        fs.appendFileSync(path.join(__dirname, '../output_pro', `${lang}.properties`), `${key}=${str}` + '\n');
        // 将转换为Unicode码的结果写入输出文件,英文不用转
        if (lang != "en") {
          const encodedText = encodeUnicode(str);
          fs.appendFileSync(path.join(__dirname, '../output_pro', `${lang}.encode.properties`), `${key}=${encodedText}` + '\n');
        }
        mapTranslateFn(index + 1, lang);
      } else {
        setTimeout(()=> {
          mapTranslateFn(index, lang);
        }, 3000)
        console.log(`repeatting_current`, nextStr);
      }
    }
  }
}
// 翻译并保存
async function translateAndSave(originData, langIndex) {
  if (langIndex == maxLangCount) return;
  allKeyList = Object.keys(originData || {});
  if (allKeyList && allKeyList.length) {
    lang = targetLanguages[langIndex];
    await mapTranslateFn(0, lang);
  } else {
    console.log("先生成json格式的数据再翻译")
  }
}

function createFileAutoTranslateSave() {
  // 使用空字符串创建并清空指定文件 zh.properties 文件
  // 部分需要unicode翻译文件
  targetLanguages.forEach((lang, index) => {
    const proFile = path.join(__dirname, `../output_pro/${lang}.properties`);
    const encodeFile = path.join(__dirname, `../output_pro/${lang}.encode.properties`);
    // 创建或清空 xx.encode.properties 文件,英文不要
    if (lang != "en") {
      fs.writeFile(encodeFile,'', (err) => {
        if (err) {
          console.error(`创建${lang}.encode.properties文件错误:`, err);
        } else {
          console.log(`${lang}.encode.properties 文件已创建并清空`);
        }
      });
    }
    fs.writeFile(proFile,'', (err) => {
      if (err) {
        console.error(`创建${lang}.propertie文件错误`, err);
      } else {
        console.log(`${lang}.properties 文件已创建并清空`);
        // 如果创建完毕开始翻译
        if (index == (targetLanguages.length - 1)) {
          translateAndSave(originData, langIndex);
        }
      }
    });
  });
}
// 先创建静态文件
// createFileAutoTranslateSave();
module.exports = {
  createFileAutoTranslateSave,
}