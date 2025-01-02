import { EditorView, basicSetup } from './node_modules/codemirror/dist/index'
import { EditorState } from './node_modules/@codemirror/state/dist/index'
import { sql, SQLConfig, MSSQL } from './node_modules/@codemirror/lang-sql/dist/index'

export { }

type EditorsMap = {
    [id: string]: EditorView
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
        SetupChangeCallback: (parent: string, dotNetRef: DotNetReference) => void;
        Editors: EditorsMap
    }
    interface Window {
        CodeEditor: CodeEditor
    }
}

window.CodeEditor = {
    Editors: {},
    CreateEditor: (parent: string, textInput: string, schema?: any, language?: Language, theme?: any) => {
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

        // Add the update listener extension
        extensions.push(EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                const editor = window.CodeEditor.Editors[parent];
                // Get the dotNetRef stored on the editor instance
                const dotNetRef = (editor as any).dotNetRef;
                if (dotNetRef) {
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
        window.CodeEditor.Editors[parent] = editor as EditorView;
    },
    
    SetupChangeCallback: (parent: string, dotNetRef: DotNetReference) => {
        const editor = window.CodeEditor.Editors[parent];
        if (editor) {
            // Store the dotNetRef on the editor instance
            (editor as any).dotNetRef = dotNetRef;
        }
    },
    
    GetStringValue: (parent: string) => {
        var editor: EditorView | undefined = window.CodeEditor.Editors[parent];
        return editor.state.doc.toString();
    },
    
    SetStringValue: (parent: string, value: string) => {
        var editor: EditorView | undefined = window.CodeEditor.Editors[parent];
        if (editor !== undefined) {
            editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } })
        }
        
    },
    
    Dispose: (parent: string) => {
        delete window.CodeEditor.Editors[parent];
    }
};