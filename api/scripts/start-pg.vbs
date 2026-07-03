Set fso = CreateObject("Scripting.FileSystemObject")
apiDir = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
pgBin = apiDir & "\node_modules\@embedded-postgres\windows-x64\native\bin\pg_ctl.exe"
pgData = "C:\akilli-garson-pgdata"
Set shell = CreateObject("Shell.Application")
shell.ShellExecute pgBin, "-D """ & pgData & """ -l """ & pgData & "\server.log"" start", "", "", 1
