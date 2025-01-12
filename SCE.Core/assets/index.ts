import { EditorView, basicSetup } from './node_modules/codemirror/dist/index'
import { EditorState } from './node_modules/@codemirror/state/dist/index'
import { sql, SQLConfig, MSSQL } from './node_modules/@codemirror/lang-sql/dist/index'

type EditorObject = {
    editor: EditorView,
    dotnetReference: DotNetReference
}

type EditorsMap = {
    [id: string]: EditorObject
}

// Add a type for our .NET reference
type DotNetReference = {
    invokeMethodAsync(methodName: string, ...args: any[]): Promise<void>;
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

    interface EditorView {
        dotNetRef: string
    }
}

window.CodeEditor = {
    Editors: {},
    CreateEditor: (parent: string, textInput: string, dotNetReference: DotNetReference, schema?: any, language?: Language, theme?: any) => {
        var extensions: Array<any> = [basicSetup];
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
        
        extensions.push(EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                const editor = window.CodeEditor.Editors[parent]?.editor;
                const dotNetRef = window.CodeEditor.Editors[parent]?.dotnetReference;
                if (dotNetRef && editor) {
                    dotNetRef.invokeMethodAsync('CodeChange', editor.state.doc.toString());
                }
            }
        }));

        var initialState = EditorState.create({
            doc: textInput,
            extensions: extensions
        });
        
        var editor = new EditorView({
            state: initialState,
            parent: document.getElementById(parent) as Element
        });
        
        if (!window.CodeEditor.Editors)
            window.CodeEditor.Editors = {};


        window.CodeEditor.Editors[parent] = {
            editor: editor as EditorView,
            dotnetReference: dotNetReference
        } as EditorObject;
    },
    
    GetStringValue: (parent: string) => {
        var editor: EditorView | undefined = window.CodeEditor.Editors[parent]?.editor;

        if (editor === undefined) {
            throw new Error("No editor with id " + parent);
        }

        return editor.state.doc.toString();
    },
    
    SetStringValue: (parent: string, value: string) => {
        var editor: EditorView | undefined = window.CodeEditor.Editors[parent]?.editor;
        if (editor !== undefined) {
            editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } })
        }
    },
    
    Dispose: (parent: string) => {
        delete window.CodeEditor.Editors[parent];
    }
};

export { }