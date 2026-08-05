
// Script Settings

const CacheValidDuration = 60 * 24; // In Minutes, or 0 to disable;
const ScriptUrl = "https://raw.githubusercontent.com/alexcahill/iOS-Scriptable-Remote-Scripts/main/TestScript.js"; // Replace with your hosted script link!

// Cache Logic

if (CacheValidDuration == 0 ||
    !Keychain.contains(Script.name()+".Cache.Date") || 
    (new Date()).getTime() >= parseInt(Keychain.get(Script.name()+".Cache.Date")) + CacheValidDuration * 60000 /* To MS */) {

    try {
        var Req = new Request(ScriptUrl);
        var Contents = await Req.loadString();
        Keychain.set(Script.name()+".Cache.Value", Contents);
        Keychain.set(Script.name()+".Cache.Date", (new Date()).getTime().toString());
    } catch (Error) {

        // Revert to last Cache...
        console.log("Error, Reverting to last Cache...");
        console.log(Error);
        if (!Keychain.contains(Script.name()+".Cache.Value"))
            throw "Could not Get Script Content, and no Cache exists...";

    }

}    

eval(Keychain.get(Script.name()+".Cache.Value"));