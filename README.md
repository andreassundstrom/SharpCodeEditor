# Sharp Code Editor
A simple wrapper for Blazor for [CodeMirror](https://github.com/codemirror). 

## Usage
Install from nuget
````
PM > Install-Package SCE.Core
````

Add reference to js-file in `index.html`
````html
<script src="_content/SCE.Core/Components/SharpCodeEditor.razor.js"></script>
````
Use in Razor-file
````html
<SharpCodeEditor @ref=sharpCodeEditor Code=@initialCode />
````
Call `GetValueAsync` to get code from editor
````csharp
SharpCodeEditor sharpCodeEditor;
public string initialCode { get; set; } = "SELECT * FROM dbo.People";

public async Task GetText(){
    initialCode = await sharpCodeEditor.GetValueAsync();
    
}
````

## Theme
See the CodeMirror [styling guide](https://codemirror.net/examples/styling/) for reference. Use 

````csharp
    Dictionary<string, Dictionary<string, string>> theme = new (){
             {"&", new(){ { "maxHeight", "300px" } } },
             {".cm-scroller", new(){{ "overflow", "auto"} } } 
        };
````
````html
<SharpCodeEditor Theme=@theme />
````
Results in the following theme being applied:
````js
{
    "&" {
        maxHeight: "300px"
    },
    ".cm-scroller"{
        overflow:"auto"
    }
}
````
