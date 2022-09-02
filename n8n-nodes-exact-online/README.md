![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-exact-online

This node was developed during the n8n node-athon. This is version one with a basic CRUD implemented.
During the development the API reference docs were scraped with a n8n workflow. This Workflow was also included in the repo.
There were 396 pages scraped and processed into a config file.

The node is usable with a Developer account which can be created for free at Exact Online's website. This way you can test the node however you like it without compromising your production environment.
After you can easily connect it with a production environment and automate your workflows.

## Exact Online

Exact Online is an ERP solution that is offered as a cloud service. Most companies that use exact use it as their main application and have all kinds of applications they use around that. Exact has been expanding over the years and they now offer Exact Online internationally.

## Install instructions

The node can be installed with the community package feature. It can also be installed manually. 
If you need more information on that, please refer to the n8n docs.

Make sure to restart n8n when you have installed the node.
> :warning: **Make sure to restart n8n when you have installed the node.**

## Setup instructions

> :warning: **You need a HTTPS callback url for it to function. Exact Online does not allow you to use HTTP. Make sure you have this before starting the setup.**

> **_NOTE:_**  Some of the documentation was rewritten because the production app setup is a bit different from the development app. That is also why some names and urls arent the same everywhere, I hope it is clear enough not to get you confused about changing names and such.

To setup this node you will have to create an App in Exact online. Below there is a step by step guide on how to do this.
In the future there might be a possibility to simply select it from the app store of Exact Online. I will be looking into getting it approved at a later date.

The Images should be clear enough for you to follow along.

Login into Exact Online by clicking on the marked button

![Login](https://github.com/bramkn/ExactOnline/blob/master/Images/login.png)

Click on appcenter button to open the app center, this where you can connect apps.

![ManageApps](https://github.com/bramkn/ExactOnline/blob/master/Images/appcenterNormal.png)

At this point it will forward you to all the apps you can browse. You probably need to click on login in the top right again to actually login on this page.

After that you will see the manage apps button
Click on the manage apps button

![ManageApps2](https://github.com/bramkn/ExactOnline/blob/master/Images/manageapps2.png)

You will then see your apps. There is a choice between production and test. Click on register an app.
If you do not have a choice simply click on the big + to register an app.

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/Apps.png)

Open a tab with n8n and go to the Exact Online Node, if you do not have it open already.
Create a new credentials entry or modify an existing one in the app.

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/credentials.png)

You should see the credential information. You need to fill this in, but first you need the Callback URL to be filled in into the app setup in Exact Online.
Copy the callback URL from n8n into Exact Online. 
If you are registering a production app you will need to do this in this first screen that pops up. If it is a testing app this pop-up is skipped. (fill in the name and the callback url in the following screen if this step is skipped)

![prodRegister](https://github.com/bramkn/ExactOnline/blob/master/Images/registerappProd.png)

Fill in the rest of the information in the credentials of n8n.
Should look a bit like this:

Exact Online:
![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/oauth2Exact2.png)

n8n:
![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/Oauth2n8n2.png)

After you can Click connect / reconnect and it might give you a pop-up to login to exact online if you aren't logged in yet or you need to confirm the connection / approve some terms.

## Features v1.0

All posible API requests were scraped from the Exact Online docs. This was used to create a config file. some quality of life features were added and more will be added in the future.

You can choose al Devisions your account has access to. And all data you have access to will be able to be retrieved.
Somtimes you do not retrieve any data that is because there is non or you do not have access.

you can use the dropdowns to select what you want to do.

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/options1.png)

when retrieving data you can add filters and choose what fields you want to include. You can both name field to be included and excluded. Some Api endpoints allow you to retrieve all fields when not selecting any and some require you to select the fields you want to include. By setting the slider to exclude the selected fields and not selecting any fields the node will automatically fetch all fields available.

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/options3.png)


when you want to create a new record or edit it, you will be able to add fields and select fields from a list of options for that specific resource.

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/options2.png)

## Using the scraper

- You do not need an account for the scraper.
- Paste the JSON into an n8n workflow.
- Set the Github Authorization
- The first time you might want to set the Github node to create the file.
- Start
- Done -> make sure to format the output file as this will improve the readability ;-)

## More info on the API

[Exact Online ref](https://start.exactonline.nl/docs/HlpRestAPIResources.aspx?SourceAction=10)

## License

[ChickenDance](https://github.com/bramkn/ExactOnline/blob/master/n8n-nodes-exact-online/LICENSE.md)
