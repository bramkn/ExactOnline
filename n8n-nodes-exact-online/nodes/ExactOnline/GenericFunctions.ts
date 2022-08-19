import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import { IDataObject, IOAuth2Options, NodeApiError } from 'n8n-workflow';
import { LoadedDivision, LoadedOptions } from './types';
import { accountancyEndpoints, crmEndpoints } from './endpointDescription';

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
		//@ts-ignore
		resolveWithFullResponse: true,
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
		const response = await this.helpers.requestOAuth2.call(this, 'exactOnline', options, oAuth2Options);
		//@ts-ignore
		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function getCurrentDivision(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	): Promise<string> {
		const responseData = await exactOnlineApiRequest.call(this, 'GET', `current/Me?$select=CurrentDivision`);
		return responseData.body.d.results[0].CurrentDivision;
}

export async function getData(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	resource: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
	): Promise<IDataObject[]> {
		console.log(resource);
		console.log(qs);
		const responseData = await exactOnlineApiRequest.call(this, 'GET', `${resource}`,body,qs);

		return responseData.body.d.results;
}


export async function getResourceOptions(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,service:string){

	switch(service){
		case 'accountancy':
			return accountancyEndpoints;
		case 'crm':
			return crmEndpoints;
	}
}



export const toDivisionOptions = (items: LoadedDivision[]) =>
	items.map(({ Code, CustomerName, Description }) => ({ name: `${CustomerName} : ${Description}`, value: Code }));

export const toOptions = (items: LoadedOptions[]) =>
	items.map(({ value, name }) => ({ name: name, value: value }));
