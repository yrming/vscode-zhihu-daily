const vscode = require('vscode');

function getWebviewContent(node) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>
        <link rel="stylesheet" href="${node.css}" type="text/css" />
        <style>
          body {
            background-color: transparent;
          }
          .main-wrap {
            max-width: 600px;
            min-width: 300px;
            margin: 0 auto;
          }
          .img-place-holder {
            position: relative;
            height: 375px !important;
            background: url(${node.image});
            background-size: 100%;
          }
          .img-place-holder::after {
            content: '${node.title}';
            position: absolute;
            margin: 20px 0;
            bottom: 10px;
            left: 0;
            right: 0;
            font-size: 30px;
            line-height: 1.2em;
            padding: 0 40px;
            color: white;
            text-shadow: 0px 1px 2px rgba(0,0,0,0.3);
            z-index: 1;
            font-weight: bold;
          }
        </style>
    </head>
    <body>
        ${node.body}
    </body>
    </html>`;
}

class ZhihuCommands {
  constructor(context) {
    vscode.commands.registerCommand('vscodeZhihu.see', (node) => {
      const panel = vscode.window.createWebviewPanel(`${node.title}`, `${node.title}`, vscode.ViewColumn.One, {});
      panel.webview.html = getWebviewContent(node);
    });
  }
}

module.exports = ZhihuCommands;
