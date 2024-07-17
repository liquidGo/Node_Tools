const fs = require('fs');
const path = require('path');

// 源文件路径
const sourceFilePath = path.join(__dirname, 'input.txt');
// 目标文件路径
const targetFilePath = path.join(__dirname, 'output.txt');

// 读取源文件并处理内容
fs.readFile(sourceFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // 按行分割数据
  const lines = data.split(/\r?\n/);
  const extractedWords = lines.map(line => {
    // 匹配并提取词根前的单词
    const match = line.match(/^\w+-/);
    return match ? match[0] : '';
  });

  // 将提取的单词写入目标文件
  const outputData = extractedWords.filter(word => word.length > 0).join('\n');
  fs.writeFile(targetFilePath, outputData, err => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('Extraction complete. Results saved to:', targetFilePath);
    }
  });
});