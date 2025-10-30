import * as vscode from 'vscode';
import { genUuid } from './utils';

const IdeaLABDefaultInfo = {
  app_code: "PAWigAXDwum",
  version: "latest",
  url: "https://aistudio.alibaba-inc.com/api/aiapp/run",
  X_AK: "2ccb7cad7fb3da9dcfa4d092e09005b4",
};

async function getModuleHelperWorkflow(body: {
  empId: string,
  sessionId: string,
  question: string,
  app_code?: string,
  version?: string
}): Promise<any> {
  try {
    console.log("getModuleHelperWorkflow");
    const response = await fetch(`${IdeaLABDefaultInfo.url}/${body.app_code}/${body.version}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AK': IdeaLABDefaultInfo.X_AK,
        'Accept': '*/*',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        empId: body.empId,
        sessionId: body.sessionId,
        stream: false,
        question: body.question,
      })
    });
    console.log("getModuleHelperWorkflow");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} `);
    }
    console.log("Not Stream response + ");
    const result = await response.json();
    console.log("result", typeof result);
    return result;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
}

class CLExtensionViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
  ) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 处理来自 webview 的消息
    webviewView.webview.onDidReceiveMessage(async data => {
      switch (data.type) {
        case 'submit':
          try {
            const response = await getModuleHelperWorkflow({
              empId: '317982',
              sessionId: genUuid(),
              question: data.value,
              version: IdeaLABDefaultInfo.version,
              app_code: IdeaLABDefaultInfo.app_code
            });
            // 发送响应回 webview
            webviewView.webview.postMessage({
              type: 'response',
              value: response.data.text,
              content: response.data.content  // 发送 markdown 内容
            });
          } catch (error) {
            console.error(error);
            webviewView.webview.postMessage({ type: 'error', value: '请求出错' });
          }
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // 获取 logo 文件的 URI
    const logoUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'icon.svg'));

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CL Extension</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                color: var(--vscode-foreground);
                font-family: var(--vscode-font-family);
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
            }
            .header {
                padding: 20px 20px 0;
                flex-shrink: 0;
            }
            .logo {
                width: 60px;
                height: 60px;
                margin-bottom: 10px;
            }
            .title {
                font-size: 20px;
                margin-bottom: 10px;
            }
            .content-area {
                flex: 1;
                overflow-y: auto;
                padding: 0 20px;
                margin-bottom: 120px; /* 为底部输入框留出空间 */
            }
            .input-area {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--vscode-editor-background);
                border-top: 1px solid var(--vscode-widget-border);
                padding: 20px;
            }
            textarea {
                width: 100%;
                height: 80px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                padding: 8px;
                resize: none;
            }
            textarea:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            #response {
                margin-top: 20px;
                white-space: pre-wrap;
                display: none;
            }
            /* 移除原来的.loading样式 */
            .markdown-body {
                display: none;
                padding: 16px;
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-widget-border);
                border-radius: 4px;
                margin: 10px 0;
            }
            .markdown-body pre {
                background: var(--vscode-textBlockQuote-background);
                padding: 16px;
                border-radius: 4px;
                overflow-x: auto;
            }
            .markdown-body code {
                font-family: var(--vscode-editor-font-family);
                background: var(--vscode-textBlockQuote-background);
                padding: 2px 4px;
                border-radius: 3px;
            }
            .chat-message {
                margin: 16px 0;
                clear: both;
            }
            .user-message {
                text-align: right;
                margin-left: 20%;
            }
            .user-message .message-content {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                padding: 8px 12px;
                border-radius: 8px 8px 0 8px;
                display: inline-block;
                max-width: 80%;
                text-align: left;
            }
            .assistant-message {
                text-align: left;
                margin-right: 20%;
            }
            .assistant-message .message-content {
                background: var(--vscode-editor-lineHighlightBackground);
                padding: 8px 12px;
                border-radius: 8px 8px 8px 0;
                display: inline-block;
                max-width: 80%;
            }
            /* 新增loading dots样式 */
            .loading-dots {
                display: inline-block;
                font-weight: bold;
                color: var(--vscode-descriptionForeground);
                text-align: left;
                margin: 8px 0;
            }
            .loading-dots span {
                animation: blink 1.4s infinite;
                opacity: 0;
            }
            .loading-dots span:nth-child(1) {
                animation-delay: 0s;
            }
            .loading-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }
            .loading-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }
            @keyframes blink {
                0%, 100% {
                    opacity: 0;
                }
                50% {
                    opacity: 1;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="${logoUri}" alt="Logo" class="logo">
            <h1 class="title">超级马力</h1>
        </div>
        <div class="content-area">
            <!-- 移除全局loading元素 -->
            <div id="response"></div>
            <div id="markdown" class="markdown-body"></div>
        </div>
        <div class="input-area">
            <textarea id="input" placeholder="请输入内容，按回车发送..."></textarea>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/4.0.2/marked.min.js"></script>
        <script>
            const vscode = acquireVsCodeApi();
            const input = document.getElementById('input');
            const response = document.getElementById('response');
            const markdown = document.getElementById('markdown');

            function appendMessage(isUser, content) {
                markdown.style.display = 'block';
                const messageDiv = document.createElement('div');
                messageDiv.className = 'chat-message ' + (isUser ? 'user-message' : 'assistant-message');
                
                const messageContent = document.createElement('div');
                messageContent.className = 'message-content';
                
                if (isUser) {
                    messageContent.textContent = content;
                } else {
                    messageContent.innerHTML = marked.parse(content);
                }
                
                messageDiv.appendChild(messageContent);
                markdown.appendChild(messageDiv);
                
                // 滚动到底部
                markdown.scrollTop = markdown.scrollHeight;
            }

            // 新增函数：在用户消息后添加loading动画
            function showLoadingAfterUserMessage() {
                const userMessages = document.querySelectorAll('.user-message');
                if (userMessages.length > 0) {
                    const lastUserMessage = userMessages[userMessages.length - 1];
                    
                    // 检查是否已经有loading元素
                    let loadingElement = lastUserMessage.querySelector('.loading-container');
                    if (!loadingElement) {
                        loadingElement = document.createElement('div');
                        loadingElement.className = 'loading-container';
                        loadingElement.innerHTML = '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>';
                        lastUserMessage.parentNode.insertBefore(loadingElement, lastUserMessage.nextSibling);
                    }
                    loadingElement.style.display = 'block';
                }
            }

            // 新增函数：隐藏loading动画
            function hideLoading() {
                const loadings = document.querySelectorAll('.loading-container');
                loadings.forEach(loading => {
                    loading.style.display = 'none';
                });
            }

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && !input.disabled) {
                    e.preventDefault();
                    const value = input.value.trim();
                    if (value) {
                        // 禁用输入框
                        input.disabled = true;
                        
                        // 显示用户消息
                        markdown.style.display = 'block';
                        response.style.display = 'none';
                        appendMessage(true, value);
                        
                        // 在用户消息后显示loading动画
                        showLoadingAfterUserMessage();
                        
                        vscode.postMessage({
                            type: 'submit',
                            value: value
                        });
                        input.value = '';
                    }
                }
            });

            window.addEventListener('message', event => {
                const message = event.data;
                // 隐藏 loading 并启用输入框
                hideLoading();
                input.disabled = false;

                switch (message.type) {
                    case 'response':
                        if (message.content) {
                            appendMessage(false, message.content);
                        } else {
                            appendMessage(false, message.value);
                        }
                        break;
                    case 'error':
                        appendMessage(false, '错误: ' + message.value);
                        break;
                }
            });
        </script>
    </body>
    </html>`;
  }
}

// Interface moved or removed since we're using WebviewViewProvider instead

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "cl-first-vscode-extension" is now active!');

  // 注册 Webview 提供者
  const provider = new CLExtensionViewProvider(context.extensionUri);
  const disposable = vscode.window.registerWebviewViewProvider('cl-extension-view', provider);

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }