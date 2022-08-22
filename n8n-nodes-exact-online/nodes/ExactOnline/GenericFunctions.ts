import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import { IDataObject, IOAuth2Options, NodeApiError } from 'n8n-workflow';
import { LoadedDivision, LoadedFields, LoadedOptions } from './types';
import { accountancyEndpoints, crmEndpoints, financialEndpoints, financialTransactionEndpoints } from './endpointDescription';

export async function exactOnlineApiRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	resource: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
	nextPageUrl: string = '',
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
	if(nextPageUrl!==''){
		options.uri = nextPageUrl;
	}
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
		const responseData = await exactOnlineApiRequest.call(this, 'GET', `${resource}`,body,qs,option);
		if(responseData.body.d.results){
			return [].concat(responseData.body.d.results);
		}
		else{
			return [].concat(responseData.body.d);
		}

}

export async function getAllData(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	resource: string,
	limit: number = 60,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
	): Promise<IDataObject[]> {
		console.log(resource);
		console.log(qs);
		let returnData:IDataObject[] = [];
		let responseData;
		let nextPageUrl = '';
		do {
			if(nextPageUrl === ''){
				responseData = await exactOnlineApiRequest.call(this,'GET', `${resource}`,body,qs,option);
			}
			else{
				responseData = await exactOnlineApiRequest.call(this, 'GET', `${resource}`,body,{},option,nextPageUrl);
			}

			if(responseData.body.d.results){
				returnData = returnData.concat(responseData.body.d.results);
			}
			else{
				returnData = returnData.concat(responseData.body.d);
			}
			nextPageUrl = responseData.body.d.__next;

		} while ((limit === 0 || returnData.length < limit) && responseData.body.d.__next);
		if(limit !== 0){
			return returnData.slice(0,limit);
		}
		return returnData;

}
export async function getFields(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	resource: string,): Promise<string[]> {
		const qs:IDataObject = {};
		qs['$top']=1;
		const responseData = await getData.call(this, `${resource}`,{},qs);
		const fields = Object.keys(responseData[0]);
		return fields.filter(x=>x.substring(0,2)!=='__');

}

export async function getResourceOptions(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	service:string){

	switch(service){
		case 'accountancy':
			return accountancyEndpoints;
		case 'crm':
			return crmEndpoints;
		case 'financial':
			return financialEndpoints;
		case 'financialtransaction':
			return financialTransactionEndpoints;
	}
}



export const toDivisionOptions = (items: LoadedDivision[]) =>
	items.map(({ Code, CustomerName, Description }) => ({ name: `${CustomerName} : ${Description}`, value: Code }));

export const toOptions = (items: LoadedOptions[]) =>
	items.map(({ value, name }) => ({ name: name, value: value }));

export const toFieldSelectOptions = (items: LoadedFields[]) =>
	items.map(({ name }) => ({ name: name, value: name }));
