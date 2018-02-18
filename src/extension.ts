// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import {window, commands, Disposable, ExtensionContext, Selection, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log('Congratulations, your extension "WordCount" is now active!');

    // create a new word counter
    let wordCounter = new WordCounter();
    let controller = new WordCounterController(wordCounter);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(wordCounter);
}

class WordCounter {

    private _statusBarItem: StatusBarItem;

    public updateWordCount() {

        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;

        // Only update status if an Markdown file
        if (doc.languageId === "markdown") {
            let characterCount = this._getCharacterCount(doc);
            let selectedCharacterCount = this._getCharacterCount(doc, editor.selections);
            let selectedCharacterText = selectedCharacterCount !== 0 ? ` / ${selectedCharacterCount}` : ``;            
            let wordCount = this._getWordCount(doc);            
            let selectedWordCount = this._getWordCount(doc, editor.selections);
            let selectedWordText = selectedWordCount !== 0 ? ` / ${selectedWordCount}` : ``;

            // Update the status bar
            this._statusBarItem.text = wordCount !== 1 ? `$(pencil) ${wordCount}${selectedWordText} Words | ${characterCount}${selectedCharacterText} Chars` : '$(pencil) 1 Word';
            this._statusBarItem.show();
        } else { 
            this._statusBarItem.hide();
        }
    }

    public _getCharacterCount(doc: TextDocument, selections?: Selection[]): number {
        let docContent   
        if (selections) {
            docContent = doc.getText(selections[0].with());
        } else {
            docContent = doc.getText();
        }

        // Parse out unwanted whitespace so the split is accurate
        // Removed replacement of greater-than/less-than characters.
        //docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let count = 0;
        if (docContent != "") {
            count = docContent.length;
        }

        return count;
    }

    public _getWordCount(doc: TextDocument, selections?: Selection[]): number {
        let docContent   
        if (selections) {
            docContent = doc.getText(selections[0].with());
        } else {
            docContent = doc.getText();
        }

        // Parse out unwanted whitespace so the split is accurate
        // Removed replacement of greater-than/less-than characters.
        //docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');        
        docContent = docContent.replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let count = 0;
        if (docContent != "") {
            count = docContent.split(" ").length;
        }

        return count;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class WordCounterController {

    private _wordCounter: WordCounter;
    private _disposable: Disposable;

    constructor(wordCounter: WordCounter) {
        this._wordCounter = wordCounter;
        this._wordCounter.updateWordCount();

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        // update the counter for the current file
        this._wordCounter.updateWordCount();

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._wordCounter.updateWordCount();
    }
}