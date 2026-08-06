
The Idea:
  You want to make your scriptable scripts auto update?
  If so, host your scripts on Git, Google Drive or any other online media,
  Copy the code from the "Execute-Remote-Script-Template.js" file, adjust the settings, and go crazy!

  Instead of having your friend or family members delete the old script, and try to reinstall the updated version,
  have the script pull the source from the Web!
  This way, you can update the script hassle free, (assuming DNS caching doesn't shoot you in the leg) without
  requiring direct physical access to the device!

Warning:
  Scriptable does not support "await" or waiting for a promis in a global scope.
  This only applies to code ran inside the eval function, and using the eval function is how the remote script execution works.
  Make sure to wrap your code in an async function, when you are planning to await a promis.
