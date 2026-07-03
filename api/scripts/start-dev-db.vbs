Set shell = CreateObject("Shell.Application")
apiDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
apiDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(apiDir)
shell.ShellExecute "node.exe", "scripts\dev-db.mjs", apiDir, "", 1
