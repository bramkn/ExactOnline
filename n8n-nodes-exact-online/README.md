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

# Setup instructions

To setup this node you will have to create an App in Exact online. Below there is a step by step guide on how to do this.
In the future there might be a possibility to simply select it from the app store of Exact Online. I will be looking into getting it approved at a later date.

The Images should be clear enough for you to follow along.

Login into Exact Online by clicking on the marked button

![Login](https://github.com/bramkn/ExactOnline/blob/master/Images/login.png)

Click on the manage apps button

![ManageApps](https://github.com/bramkn/ExactOnline/blob/master/Images/manageapps.png)

At this point it will forward you to all the apps you can browse. You probably need to click on login in the top right again to actually login on this page.

After that you will see the manage apps button
Click on the manage apps button

![ManageApps2](https://github.com/bramkn/ExactOnline/blob/master/Images/manageapps2.png)

You will then see your apps. There is a choice between production and test. Click on register an app.

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/Apps.png)

Open a tab with n8n and go to the Exact Online Node, if you do not have it open already.
Create a new credentials entry or modify an existing one in the app.

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/credentials.png)

You should see the following information. You need this for the connection in the n8n node.
Copy the callback URL from n8n into Exact Online. And fill in the rest of the information in the credentials of n8n.
Should look a bit like this:

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/oauth2Exact2.png)

![Apps](https://github.com/bramkn/ExactOnline/blob/master/Images/Oauth2n8n2.png)

After you can Click connect / reconnect and it might give you a pop-up to login to Exact Online if you aren't logged in yet or you need to confirm the connection.

## Features v1.0

All posible API requests were scraped from the Exact Online docs. This was used to create a config file. some quality of life features were added and more will be added in the future.


## Using the scraper

You do not need an account for the scraper.

## Using this starter

These are the basic steps for working with the starter. For detailed guidance on creating and publishing nodes, refer to the [documentation](https://docs.n8n.io/integrations/creating-nodes/).

1. [Generate a new repository](https://github.com/n8n-io/n8n-nodes-starter/generate) from this template repository.
2. Clone your new repo:
    ```
    git clone https://github.com/<your organization>/<your-repo-name>.git
    ```
3. Run `npm i` to install dependencies.
4. Open the project in your editor.
5. Browse the examples in `/nodes` and `/credentials`. Modify the examples, or replace them with your own nodes.
6. Update the `package.json` to match your details.
7. Run `npm run lint` to check for errors or `npm run lintfix` to automatically fix errors when possible.
8. Test your node locally. Refer to [Run your node locally](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/) for guidance.
9. Replace this README with documentation for your node. Use the [README_TEMPLATE](README_TEMPLATE.md) to get started.
10. Update the LICENSE file to use your details.
11. [Publish](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry) your package to npm.

## More information

Refer to our [documentation on creating nodes](https://docs.n8n.io/integrations/creating-nodes/) for detailed information on building your own nodes.

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
