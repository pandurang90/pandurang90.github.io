---
title: "Transfer files over netcat using Applescript"
description: "Sending files between machines over netcat, wrapped in an AppleScript for one-click transfers."
publishDate: "2014-01-22"
tags: ["netcat", "applescript", "macos"]
---
At my workplace, one of my colleagues and I used to transfer files like database dumps from one machine to another for our projects.

I came across netcat (the `nc` command), and when we tried it, it just worked. I was surprised by how fast the files got transferred. :)

So I wrote an AppleScript that transfers files using netcat, with dialog boxes.

:::note
netcat sends files unencrypted, so only use this on a network you trust. Between machines you don't control, use `scp` or `rsync` over SSH instead.
:::

```applescript title="netcat.scpt"
tell application "SystemUIServer"
	set actionSelected to the button returned of (display dialog "What do you want to do?" buttons {"Send file", "Receive file"} default button 2)
	
	if actionSelected = "Send file" then
		set filepath to POSIX path of (choose file)
		display dialog "Please enter the IP address of the receiver:" default answer ""
		set ipAddress to text returned of result
		if ipAddress = "" then
			repeat
				display dialog "IP address can't be blank. Please enter the IP address of the receiver:" default answer ""
				set ipAddress to text returned of result
				if ipAddress is not equal to "" then exit repeat
			end repeat
		end if
	else
		display dialog "Please enter a file name with extension:" default answer ""
		set filename to text returned of result
		if filename = "" then
			repeat
				display dialog "File name can't be blank. Please enter a file name with extension:" default answer ""
				set filename to text returned of result
				if filename is not equal to "" then exit repeat
			end repeat
		end if
	end if
	
	display dialog "Please enter a port number (must be an integer):" default answer ""
	set portnumber to text returned of result
	
	if portnumber = "" then
		repeat
			display dialog "Port number can't be blank. Please enter a port number (must be an integer):" default answer ""
			set portnumber to text returned of result
			if portnumber is not equal to "" then exit repeat
		end repeat
	end if
	
	if actionSelected = "Send file" then
		display dialog "Sending"
		do shell script "nc " & quoted form of ipAddress & " " & quoted form of portnumber & " < " & quoted form of filepath
		"sending"
	else
		display dialog "Receiving"
		do shell script "nc -l " & quoted form of portnumber & " > " & quoted form of filename
		"receiving"
	end if
	
end tell
```

After saving this file (`netcat.scpt`) on your machine, just run this in your terminal:

```bash
osascript your_path/netcat.scpt
```

It makes transferring files simpler than remembering the syntax for netcat. Or, if you want an even shorter way, add an alias to your `.bash_profile`:

```bash
alias netcat='osascript your_path/netcat.scpt'
```

Then just type `netcat` in the terminal. Enjoy :)
