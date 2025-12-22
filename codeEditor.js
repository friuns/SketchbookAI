require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs',
    }
});

var codeEditor;

window.editorApp = new Vue({
    el: '#editorApp',
    data: {
        showEditor: true,
        showTemplateMenu: false,
        templates: [],
    },
    mounted() {
        this.initializeEditor();
        this.loadTemplatesList();
        // Add event listener for window resize
        window.addEventListener('resize', this.resizeEditor);
        // Add event listener to close template menu when clicking outside
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeEditor);
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        async loadTemplatesList() {
            // List of template files in src/main/examples
            this.templates = [
                '2player.ts',
                'carBazooka.ts',
                'carExample.ts',
                'codeTemplate.ts',
                'dialog.ts',
                'football.ts',
                'minecraft.ts',
                'module.ts',
                'npcs.ts',
                'pistol.ts',
                'rocketLauncher.ts',
                'rootmotion.ts',
                'trees.ts'
            ];
        },
        toggleTemplateMenu() {
            this.showTemplateMenu = !this.showTemplateMenu;
        },
        async executeTemplate(templateName) {
            try {
                const response = await fetch(`src/main/examples/${templateName}`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const code = await response.text();
                SetCode(code);
                this.showTemplateMenu = false;
                // Execute the code immediately
                setTimeout(() => {
                    this.runCode();
                }, 100);
            } catch (error) {
                console.error('Error executing template:', error);
                alert(`Error executing template "${templateName}": ${error.message}`);
            }
        },
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
        handleClickOutside(event) {
            const templateContainer = event.target.closest('.template-menu-container');
            if (!templateContainer && this.showTemplateMenu) {
                this.showTemplateMenu = false;
            }
        },
    }
});

function SetCode(code) {
    codeEditor.setValue("export {};" + replaceImports(code));
}
function replaceImports(code)
{
    return code.replaceAll("export {};","").replace(/import .*?;/gs, "")
}
