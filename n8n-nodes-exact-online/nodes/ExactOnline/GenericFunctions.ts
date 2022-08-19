import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import { IDataObject, IOAuth2Options, NodeApiError } from 'n8n-workflow';

export async function exactOnlineApiRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	resource: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
	// tslint:disable-next-line:no-any
): Promise<any> {
	const credentials = await this.getCredentials('exactOnline');
	let options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body,
		qs,
		uri: `${credentials.url}/api/v1/${resource}`,
		json: true,
	};
	options = Object.assign({}, options, option);

	try {
		if (Object.keys(body).length === 0) {
			delete options.body;
		}

		const oAuth2Options: IOAuth2Options = {
			includeCredentialsOnRefreshOnBody: true,
		};

		//@ts-ignore
		return await this.helpers.requestOAuth2.call(this, 'exactOnline', options, oAuth2Options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
/*
export async function boxApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	propertyName: string,
	method: string,
	endpoint: string,
	// tslint:disable-next-line:no-any
	body: any = {},
	query: IDataObject = {},
	// tslint:disable-next-line:no-any
): Promise<any> {
	const returnData: IDataObject[] = [];

	let responseData;
	query.limit = 100;
	query.offset = 0;
	do {
		responseData = await boxApiRequest.call(this, method, endpoint, body, query);
		query.offset = responseData['offset'] + query.limit;
		returnData.push.apply(returnData, responseData[propertyName]);
	} while (responseData[propertyName].length !== 0);

	return returnData;
}*/
