
// Script Settings

const CacheValidDuration = 60 * 24; // In Minutes, or 0 to disable;
const ScriptUrl = "https://raw.githubusercontent.com/alexcahill/iOS-Scriptable-Remote-Scripts/main/TestScript.js"; // Replace with your hosted script link!

// Cache Logic

if (!Keychain.contains(Script.name()+".Cache.Date") || (new Date()).getTime() >= Keychain.get(Script.name()+".Cache.Date") + CacheValidDuration * 60000 /* To MS */) {

    var Req = new Request(ScriptUrl);
    var Contents = await Req.loadString();
    Keychain.set(Script.name()+".Cache.Value", Contents);
    Keychain.set(Script.name()+".Cache.Date", (new Date()).getTime());

}    

eval(Keychain.get(Script.name()+".Cache.Value"));