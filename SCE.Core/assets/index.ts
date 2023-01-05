import { EditorView, basicSetup } from './node_modules/codemirror/dist/index'
import { EditorState } from './node_modules/@codemirror/state/dist/index'
import { sql, SQLConfig, MSSQL } from './node_modules/@codemirror/lang-sql/dist/index'
export { }
type EditorsMap = {
    [id: string]: EditorView
}
enum Language {
    SQL
}
declare global {
    interface CodeEditor {
        CreateEditor: (parent: string, initialState: string, schema: any, theme: any) => void;
        GetStringValue: (parent: string) => string;
        SetStringValue: (parent: string, value: string) => void;
        Dispose: (parent: string) => void;
        Editors: EditorsMap
    }
    interface Window {
        CodeEditor: CodeEditor
    }
}

window.CodeEditor = {
    Editors: {},
    CreateEditor: (parent: string, textInput: string, schema?: any, language?: Language, theme?: any) => {
        var extensions : Array<any> = [basicSetup];
        if (language == Language.SQL) {
            var defaultConfig: SQLConfig = {
                dialect: MSSQL,
                upperCaseKeywords: true
            };
            if (schema != null)
                defaultConfig.schema = schema;

            extensions.push(sql(defaultConfig));
        }
        if (theme) {
            extensions.push(EditorView.theme(theme));
        }
        var initialState = EditorState.create({
            doc: textInput,
            extensions: extensions
        });

        var editor = new EditorView({
            state: initialState,
            parent: document.getElementById(parent) as Element
            
        });
        
        //Add reference
        if (!window.CodeEditor.Editors)
            window.CodeEditor.Editors = {};
        window.CodeEditor.Editors[parent] = editor as EditorView;
    },
    GetStringValue: (parent: string) => {
        var editor : EditorView | undefined = window.CodeEditor.Editors[parent];
        return editor.state.doc.toString();
    },
    SetStringValue: (parent: string, value: string) => {
        var editor: EditorView | undefined = window.CodeEditor.Editors[parent];

        editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } })
        
    },
    Dispose: (parent: string) => {
        delete window.CodeEditor.Editors[parent];
    }
};