const vscode = require('vscode');
const superagent = require('superagent');
const fs = require('fs');
const path = require('path');
const download = require('image-downloader');

const ZHIHU_URL = 'https://news-at.zhihu.com/api/4/news/latest';
const ZHIHU_NEWS_DETAIL_URL = 'https://news-at.zhihu.com/api/4/news/';

class ZhihuProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.model = [];
    this._getZhihuList();
  }
  _fire(item) {
    if (item) {
      this._onDidChangeTreeData.fire(item);
    } else {
      this._onDidChangeTreeData.fire();
    }
  }
  refreshData() {
    this._getZhihuList();
  }
  _pathExists(string) {
    try {
      fs.accessSync(string);
    } catch (err) {
      return false;
    }
    return true;
  }
  async _getZhihuList() {
    try {
      let resp = await superagent.get(ZHIHU_URL).send();
      let todayData = resp.body;
      if (todayData && todayData.date && todayData.stories) {
        let todayDataList = todayData.top_stories.concat(todayData.stories);
        let getDetail = async (id, img_url) => {
          let pics_exists = this._pathExists(path.join(__filename, '..', '..', 'resources', 'pictures', `${id}.png`));
          if (!pics_exists) {
            const options = {
              url: img_url,
              dest: path.join(__filename, '..', '..', 'resources', 'pictures', `${id}.png`)
            };
            await download.image(options);
          }
          let detail = await superagent.get(`${ZHIHU_NEWS_DETAIL_URL}${id}`).send();
          return detail.body;
        };
        let promiseArray = todayDataList.map((item) => getDetail(item.id, item.image || item.images[0]));
        for (let promise of promiseArray) {
          let result = await promise;
          const styleReg = /<divclass="content">(.+)<\/div>/;
          const matchs = result.body.replace(/\s+/g, '').match(styleReg);
          if (Array.isArray(matchs) && matchs.length >= 0) {
            todayDataList.map((item) => {
              if (item.id === result.id) {
                item.content = matchs[0].replace(/<[^>]+>/g, '').slice(0, 100) + '...';
                item.css = result.css;
                item.body = result.body;
                item.image = result.image || item.images[0]
              }
            });
          }
        }
        this.model = todayDataList;
        this._fire();
      }
    } catch (error) {
      console.log(error);
    }
  }
  getChildren(element) {
    if (element) {
      return [
        {
          id: '',
          title: '',
          content: element.content,
          type: 'body'
        }
      ];
    } else {
      return this.model;
    }
  }
  getTreeItem(element) {
    return {
      label: element.title,
      tooltip: element.type === 'body' ? element.content : element.title,
      iconPath: element.type === 'body' ? undefined : path.join(__filename, '..', '..', 'resources', 'pictures', `${element.id}.png`),
      description: element.type === 'body' ? element.content : '',
      collapsibleState: element.type === 'body' ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded,
      contextValue: element.type === 'body' ? '' : 'see'
    };
  }
}

class Zhihu {
  constructor(context) {
    const treeDataProvider = new ZhihuProvider();
    vscode.window.registerTreeDataProvider('vscodeZhihu', treeDataProvider);
    vscode.commands.registerCommand('vscodeZhihu.refresh', () => {
      treeDataProvider.refreshData();
    });
  }
}

module.exports = Zhihu;
