---
title: "Transfer files over netcat using Applescript"
description: "Sending files between machines over netcat, wrapped in an AppleScript for one-click transfers."
publishDate: "2014-01-22"
tags: ["netcat", "applescript", "macos"]
---
At my workplace me and one of my colleague used to transfer files like database dumps etc. for projects from one machine to another.


I came across netcat (nc command) and when we tried that it just worked so quickly, i got surprised with the speed with which it got transferred. :)
So i wrote applescript that transfers file using netcat, with dialog boxes.

```applescript title="netcat.scpt"
tell application "SystemUIServer"
	set actionSelected to the button returned of (display dialog "What you want to do?" buttons {"Send file", "Receive file"} default button 2)
	
	if actionSelected = "Send file" then
		set filepath to POSIX path of (choose file)
		display dialog "Please enter IP address of receiver:" default answer ""
		set ipAddress to text returned of result
		if ipAddress = "" then
			repeat
				display dialog "IP address cant be blank,Please enter IP address of receiver:" default answer ""
				set ipAddress to text returned of result
				if ipAddress is not equal to "" then exit repeat
			end repeat
		end if
	else
		display dialog "Please enter a file name with extension:" default answer ""
		set filename to text returned of result
		if filename = "" then
			repeat
				display dialog "Filename cant be blank,Please enter a file name with extension:" default answer ""
				set filename to text returned of result
				if filename is not equal to "" then exit repeat
			end repeat
		end if
	end if
	
	display dialog "Please enter a port number ,must be integer:" default answer ""
	set portnumber to text returned of result
	
	if portnumber = "" then
		repeat
			display dialog "Port number cant be blank, Please enter a port number, must be integer:" default answer ""
			set portnumber to text returned of result
			if portnumber is not equal to "" then exit repeat
		end repeat
	end if
	
	if actionSelected = "Send file" then
		display dialog "Sending"
		do shell script "nc " & ipAddress & " " & portnumber & " < " & filepath & " -"
		"sending"
	else
		display dialog "Receiving"
		do shell script "nc -l " & portnumber & " > " & filename
		"receiving"
	end if
	
end tell
```

after saving(netcat.scpt) this file to your machine just type in your terminal
osascript your_path/netcat.scpt
It will simplify your work to transfer file rather than remembering syntax for netcat 
  OR 
if you want more shortcut to do this you can add it to .bash_profile file
```bash
alias netcat='osascript your_path/netcat.scpt'
```

and then just type `netcat` in terminal.. enjoy :)
