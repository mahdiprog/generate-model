"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as changeCase from "change-case";
import { writeFile } from "fs";
import { TypeMapping } from "./type-mapping";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.generateModel",
    (e: vscode.Uri) => {
      // The code you place here will be executed every time your command is executed

      const option: vscode.OpenDialogOptions = {
        filters: { "C# Class": ["cs"] },
        canSelectMany: true
      };

      vscode.window.showOpenDialog(option).then(fileUri => {
        if (fileUri) {
            for (let i = 0; i < fileUri.length; i++) {
                const file = fileUri[i];
                vscode.workspace.openTextDocument(file).then(doc => {
                    const originalContent = doc.getText();
                    const className = /\bclass\s(\b\w*)/g.exec(originalContent);
                    if (className === null) {
                      vscode.window.showInformationMessage("Class name not found");
                      return;
                    }
                    const fileName = changeCase.paramCase(className[1]) + ".model.ts";
                    const pattern = /\bpublic\s(\b\w*\s)(\b\w*\s)(\{\s?\bget;\s?set;\s?\})/gm;
                    const matches =originalContent.match(pattern);
                    if (matches === null) {
                        vscode.window.showInformationMessage("properties not found");
                        return;
                    }
                    var properties:Array<{type:string,name:string}> = [];
                    for (let index = 0; index < matches.length; index++) {
                        const element = matches[index];
                        var property = /\bpublic\s(\b\w*\s)(\b.*\s)\{\s?\bget;\s?set;\s?\}/g.exec(element);
                            if (property === null) {
                                vscode.window.showInformationMessage("'"+element + "' cannot parse as a property");
                                return;
                            }
                            properties.push({type:property[1].trim(),name:property[2].trim()}); 
                    }
                    let propText = "";
                    properties.forEach(prop => {
                        propText+=`    public ${changeCase.camelCase(prop.name)}: ${TypeMapping.getTSType(prop.type)},\r\n`;
                    });
                    var content =`export class ${className[1]} {\r\n  constructor(\r\n${propText}  ) {}\r\n}\r\n`;
                    const option: vscode.SaveDialogOptions = {
                        filters: { "TypeScript file": ["ts"] },
                        defaultUri: vscode.Uri.file(fileName)
                    };
                    if(e){
                        writeFile(e.fsPath+"\\"+fileName, content);
                    }
                    else{
                    vscode.window.showSaveDialog(option).then(uri => {
                        if (!uri || !uri.fsPath) {
                            vscode.window.showInformationMessage("please select a location for saving file");
                            return;
                        }
                        writeFile(uri.fsPath, content);
                    });
                  }
                });
            }
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
