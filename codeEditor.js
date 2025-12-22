// Try CDN first, fallback to local if CDN is blocked
(function() {
    // Wait for require to be defined
    function initMonaco() {
        if (typeof require !== 'undefined' && require.config) {
            require.config({
                paths: {
                    vs: window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
                        ? 'libs/monaco-editor/min/vs'
                        : 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
                }
            });
            return true;
        }
        return false;
    }
    
    // Try immediately
    if (!initMonaco()) {
        // Wait a bit for loader to load
        setTimeout(function() {
            if (!initMonaco()) {
                console.warn('Monaco loader not available - code editor may not work');
            }
        }, 100);
    }
})();

var codeEditor;

// Wait for Vue to be available
(function initEditor() {
    if (typeof Vue === 'undefined') {
        console.log('Waiting for Vue to load...');
        setTimeout(initEditor, 100);
        return;
    }
    
    window.editorApp = new Vue({
        el: '#editorApp',
        data: {
            showEditor: true,
        },
        mounted() {
            this.initializeEditor();
            // Add event listener for window resize
            window.addEventListener('resize', this.resizeEditor);
        },
    methods: {
        async initializeEditor() {
            await new Promise(resolve => requestAnimationFrame(resolve));
            require(['vs/editor/editor.main'], async  ()=> {
                let classNames = await (fetch('paths.txt').then(r => r.text()));
                classNames = classNames.replaceAll("\\", "/").replaceAll("\r", "");
                classNames = classNames.split('\n');
                classNames.push("src/main/helpers/helpers.js");
                classNames.push("src/utils.js");                    
                const LoadClass = async (className) => {

                    let three = className.includes("node_modules/@types/three/");
                    if (!className.includes("build/types/") && !three && !className.includes("peerjs/dist") && !className.startsWith("src/") &&
                     //!className.includes("tween.d.ts") && 
                     !className.includes("sweetalert2.d.ts")) return;
                    const text = await fetch(className).then(response => response.text()).catch(e => {
                        originalConsoleError("update paths.txt", className, e);                        
                        return "";
                    });
                    
                    let code = text.replace(/export |import .*?;/gs, "");
                    //code = code.replaceAll("interface","class");
                    //let code = text.match(/export (?:declare )?(class [\s\S]*)/)?.[1] || text;
                    // if(className.includes("GLTFLoader"))debugger;
                    if (three && !className.includes("examples"))
                        code = "declare namespace THREE {" + code + "} "

                    if(className.includes("FunctionLibrary"))
                        code = "declare namespace Utils {" + code + "} "

                    await monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file:///${className}`);
                };

                await Promise.all(classNames.map(LoadClass));

                codeEditor = monaco.editor.create(document.getElementById('editorElement'), {
                    language: 'typescript',
                    theme: 'vs-dark',
                    //readOnly: globalThis.isMobile, // Make editor readonly if on mobile
                    // Add the following line to disable the F12 key override
                   // contextmenu: false,
                });
                
                // Add keyboard shortcut for running code (Ctrl+Enter)
                codeEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                    this.runCode();
                });
                

                monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ESNext,
                    module: monaco.languages.typescript.ModuleKind.ESNext,
                    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    allowNonTsExtensions: true,
                });

                // Add Vue component for editor controls
                this.toggleEditor();

            });
        },
        toggleEditor() {
            this.showEditor = !this.showEditor;
        },
        runCode() {
            ResetState();            
            const code = codeEditor.getValue();
            chat.variant.files[0].content = code.replaceAll("export {}","");
            setTimeout(() => Eval(code), 100);
            this.toggleEditor();            
        },
        resizeEditor() {
            if (codeEditor && this.showEditor) {
                codeEditor.layout();
            }
        },
    }
});

})(); // Close the initEditor function

// Global functions needed by other scripts
function SetCode(code) {
    if (typeof codeEditor !== 'undefined') {
        codeEditor.setValue("export {};" + replaceImports(code));
    }
}
function replaceImports(code)
{
    return code.replaceAll("export {};","").replace(/import .*?;/gs, "")
}
