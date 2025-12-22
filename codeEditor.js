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
    },
    mounted() {
        this.initializeEditor();
        this.populateTemplatesMenu();
        // Add event listener for window resize
        window.addEventListener('resize', this.resizeEditor);
    },
    methods: {
        async populateTemplatesMenu() {
            const templatesMenu = document.getElementById('templatesMenu');
            if (!templatesMenu) return;

            // List of template files from src/main/examples
            const templates = [
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

            templates.forEach(template => {
                const link = document.createElement('a');
                const templateName = template.replace('.ts', '');
                link.textContent = templateName;
                link.onclick = () => this.loadTemplate(template);
                templatesMenu.appendChild(link);
            });
        },
        async loadTemplate(templateFile) {
            try {
                const response = await fetch(`src/main/examples/${templateFile}`);
                if (!response.ok) {
                    throw new Error(`Failed to load template: ${templateFile}`);
                }
                const code = await response.text();
                SetCode(code);
            } catch (error) {
                console.error('Error loading template:', error);
                alert(`Failed to load template: ${templateFile}`);
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
    }
});

function SetCode(code) {
    codeEditor.setValue("export {};" + replaceImports(code));
}
function replaceImports(code)
{
    return code.replaceAll("export {};","").replace(/import .*?;/gs, "")
}
