# How to setup the data sources
1. You need to specify the data sources that will be parsed in **sources.json** file. It supports 2 types of sources: RSS feeds and Telegram channels.
   - RSS feeds source object structure: name - data source name, link - url to RSS feed, selector - CSS selector for the article text on the HTML page with the article
   - Telegram channels is an array of channel ids, I honestly don't know how to find them except for using Telegram API 😢. IMPORTANT: The user you use in data-parser to log in the Telegram must be subscribed to this channels in order to have access to the messages in them. This could easily be done manually in your user's Telegram account before running the data-parser

# How to run data-parser Docker container

2. Fill in the **env/.env** file with values (required variable names are listed in **env/example.env**)
3. Run the following command to build an image:
```console
   docker build -t data-parser .
```
1. Open the directory with the project in your terminal and run the container from it so docker volumes work properly (or change the volume paths to the absolute ones in **startup.sh** file)
2. Run the following command to start a container:
```console
   sh startup.sh
```
1. (Optional) If you need to parse data from Telegram, you need to enter the verification code for the login in **tg-auth/code.txt** file as soon as you receive it without any whitespaces, new lines, etc.