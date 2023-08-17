# instagram-mass-unsender
javascript to mass unsend dms of one chat


Bascially open developer console and paste the first script inside, hit enter, wait untill ur at the first message of your chat (the oldest) and then paste the seconds script and hit enter and then it will do everything including waiting for timeouts (instragam rate limits)

Only works on enlish version of instagram website

Feel free to update, upgrade and improve or reuse without credits - but no commercial usage allowed

Potential improvements which you might pull request:
- Combine both scripts into one
- Ui in instagram to start the script using for example Tampermonkey
- Code cleanup/restructure to make the process faster
- Different element finding logic to support all languages


test-scriptv2.js should support all languages and be much faster and more reliable- BUT it needs a loop wrapper to make sure it runs more than once, currently it will delete a single message from bottom to top.
If you decide to build this wrapper please create a pull request so I can update this repo, also the wrapper must have a end condition (when there are no more messages to be deleted)
