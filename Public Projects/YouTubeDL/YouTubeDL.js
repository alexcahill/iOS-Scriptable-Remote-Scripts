
function Notify(Text, Title, Sound, Url) {

  var Obj = new Notification();
  if (Url)
    Obj.openURL = Url;
  if (Sound)
    Obj.sound = Sound;
  if (Title)
    Obj.title = Title.toString();
  Obj.body = Text.toString();
  Obj.schedule();
  return Text;
}

async function Prompt(Text, Title, ActionText="Ok", CancelText="Cancel") {
    var Obj = new Alert();
    if (Title)
        Obj.title = Title.toString();
    if (ActionText.length)
        Obj.addAction(ActionText);
    if (CancelText.length)
        Obj.addCancelAction(CancelText);
    Obj.message = Text.toString();
    Obj.addTextField();
    if (await Obj.present() === -1)
        return undefined;
    else
        return Obj.textFieldValue(0);
}


async function RunInApp() {
    
    var URL = await Prompt("Please Enter YouTube URL:", "YouTubeDL", "Download", "Cancel");
    if (URL.length < 1)
        return;
    URL = encodeURIComponent(URL);
    RunInShortcutsShareSheet(URL);
}

function RunInWidget() {
    var w = new ListWidget();
    w.addText("Sorry, running this script as a widget is not supported... :(");
    Script.setWidget(w);
}

function completion(callback_response) { throw "Cannot be used in a script.\nOnly here as a placeholder..."; };

var InjectionScripts = {
    InjectLink: (async function (TargetSite) { 

        function ExecutionCode() {
            var e = (id) => {return document.getElementById(id)};
            var Mp3 = e('mp3'), Input = e('input'), Submit = e('submit');
            if (!Mp3)
                return completion("Error: Missing Element #mp3.\nPlease Inspect HTML and update the script...");
            if (!Input)
                return completion("Error: Missing Element #input.\nPlease Inspect HTML and update the script...");
            if (!Submit)
                return completion("Error: Missing Element #submit.\nPlease Inspect HTML and update the script...");
            Mp3.click();
            Input.value = decodeURIComponent(document.location.href.split("link=")[1]);
            Submit.click();
            completion(true);
        };
        return await TargetSite.evaluateJavaScript(ExecutionCode + ";ExecutionCode();", true);   
    }),

    ClickDownloadMP3: (async function (TargetSite) {

        function ExecutionCode() {
            var e = (id) => { return document.getElementById(id); }
            var DL = e('download'), IFRAME = e('res');
            if (!DL)
                return completion("Error: Missing Element #download.\nPlease Inspect HTML and update the script...");
            if (!IFRAME)
                return completion("Error: Missing Element #res.\nPlease Inspect HTML and update the script...");

            var Counter = 0, MaxCount = 10, Interval = 0;
            DL.click();
            Interval = setInterval(()=>{
                if (Counter > MaxCount)
                    return completion("Error: Could not get the iframe to populate by clicking the download button.\nPlease inspect HTML and update the script...");
                else if (IFRAME.children.length > 0) {
                    clearInterval(Interval);
                    return completion(true);
                }
                else {
                    DL.click();
                    Counter++;
                }
            }, 500);
        }
        return await TargetSite.evaluateJavaScript(ExecutionCode + ";ExecutionCode();", true);   
        
    }),

    RedirectTargetSite: (async function (TargetSite) {
        
        function ExecutionCode() {
            var e = (id) => { return document.getElementById(id); }
            completion(document.location = e('res').children[0].src); // "#res" element dep check done on the previous function...
        }
        return await TargetSite.evaluateJavaScript(ExecutionCode +";ExecutionCode();", true);
    }),

    WaitForDownloadReady: (async function (TargetSite) {
        
        function ExecutionCode() {
            var e = (id) => { return document.getElementById(id); }
            var Count = 0, MaxCount = 15;
            var int = setInterval(()=>{
                if (e('dlbutton').innerText.includes("DOWNLOAD")) {
                    clearInterval(int);
                    completion(true);
                }
                else if (Count > MaxCount)
                    completion("Error: Timedout waiting for the download to be ready...\nPlease inspect HTML and update the script...")
            }, 500);
        }
        return await TargetSite.evaluateJavaScript(ExecutionCode +";ExecutionCode();", true);

    }),

    ValidateInputLink: (async function (TargetSite) {
        
        function ExecutionCode() {
            var e = (id) => { return document.getElementById(id); }
            var DlButton = e('dlbutton');
            var Text = DlButton.innerText.split("\n");
            if (Text.length < 2 || Text[1].length < 1)
                completion("It looks like the link that was shared is invalid...\nPlease check the link and try again\nLink/URL:\n");
            else
                completion(true);
        }
        return await TargetSite.evaluateJavaScript(ExecutionCode +";ExecutionCode();", true);

    }),
    
    StartDownload: (async function (TargetSite) {
        
        function ExecutionCode() {
            var e = (id) => { return document.getElementById(id); }
            e('dlbutton').click();
            completion(true);
        }
        return await TargetSite.evaluateJavaScript(ExecutionCode +";ExecutionCode();", true);
    }),

    Template: (async function (TargetSite) {
        
        function ExecutionCode() {
            var e = (id) => { return document.getElementById(id); }
        }
        return await TargetSite.evaluateJavaScript(ExecutionCode +";ExecutionCode();", true);
    }),
}


async function RedirectCompletion(TargetSite, Url) {

    var CompletePromise = null;
    var Result = new Promise((CP) => { CompletePromise = CP; }); // Don't know how and why it works, but it does.
    var Count = 0, MaxCount = 10;

    async function EvalSiteURL() {

        var CurrentTargetSiteURL = await TargetSite.evaluateJavaScript("completion(document.location.href);", true);

        if (CurrentTargetSiteURL == Url) {
            ScheduledRoutine.invalidate();
            Timer.schedule(500, false, ()=>{CompletePromise(true);});
        }
        else if (Count > MaxCount) {
            ScheduledRoutine.invalidate();
            CompletePromise("Failed to redirect, or capture redirect due to observation timeout...");
        }
        else Count++;
        
    }

    var ScheduledRoutine = Timer.schedule(500, true, ()=>{EvalSiteURL();});
    
    return Result;
}

async function GetDownloadSRC(TargetSite) {

    var CompletePromise = null, ScheduledRoutine = null;
    var hPromise = new Promise((CP) => { CompletePromise = CP;});
    var Count = 0, MaxCount = 120;

    async function EvalSiteURL(Site) {
        var HTML = await Site.getHTML();
        
        console.log(HTML.substr(0, 100) + "... c:" + Count);

        if (HTML.includes("video")) {
            ScheduledRoutine.invalidate();
            console.log("Redirect Deteced...");
            var SRC = HTML.split('src="')[1];
            SRC = SRC.split('"')[0];
            CompletePromise(SRC);
        }
        else if (Count > MaxCount) {
            ScheduledRoutine.invalidate();
            CompletePromise("Failed to redirect, or capture redirect due to observation timeout...");
        }
        else Count++;
    }

    ScheduledRoutine = Timer.schedule(1000, true, ()=>{EvalSiteURL(TargetSite);});
    return hPromise;

}

async function DownloadContent(URL) {

    URL = URL.replaceAll("&amp;", "&");

    var Req = new Request(URL);
    var DL_DATA = await Req.load();
    var Title = decodeURIComponent(URL).split("title=")[1].split("&")[0];

    const FM = FileManager.local();
    const Path = FM.cacheDirectory() + "/" + Title + ".mp3" ;
    FM.write(Path, DL_DATA);
    
    await ShareSheet.present([Path]);
    
    FM.remove(Path);
    
}

// URL expects a encoded URI string
async function RunInShortcutsShareSheet(URL /* Hopefully... */) {

    Notify("Downloading URL:\n" + decodeURIComponent (decodeURIComponent(URL)), "YouTubeDL");
    var TargetSite = new WebView();
    TargetSite.present();
    await TargetSite.loadURL("https://ddownr.org/?link=" + URL);
    var Result = await InjectionScripts.InjectLink(TargetSite);
    if (Result === true)
        Result = await InjectionScripts.ClickDownloadMP3(TargetSite);
    if (Result === true) {
        Result = await InjectionScripts.RedirectTargetSite(TargetSite);
        Result = await RedirectCompletion(TargetSite, Result);
    }
    if (Result === true)
        Result = await InjectionScripts.WaitForDownloadReady(TargetSite);
    if (Result === true)
        Result = await InjectionScripts.ValidateInputLink(TargetSite);
    if (Result === true)
        Result = await InjectionScripts.StartDownload(TargetSite);
    else 
        return Notify(Result + decodeURIComponent(URL), "Something went wrong :(", "piano_error");
    if (Result === true) {
        Result = await GetDownloadSRC(TargetSite);
        if (Result.includes("Failed"))
            return Notify(Result);
        else 
            DownloadContent(Result);
    }
    else 
        Notify("Result:\n"+Result, "An error occurred...");

}

// MAIN

if (config.runsInActionExtension)
    Notify(
        "Sorry, running this script inside the share menu is not supported... :(    read more\n"+
        "Please call " + Script.name() + " from the Shortcuts app share sheet instead...", "Support Error", "piano_error"); 
else if (config.runsInWidget)
    RunInWidget();
else if (args.shortcutParameter) 
    RunInShortcutsShareSheet(encodeURIComponent(args.shortcutParameter));
else 
    RunInApp();
