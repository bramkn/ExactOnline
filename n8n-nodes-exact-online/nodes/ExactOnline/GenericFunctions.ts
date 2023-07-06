import { OptionsWithUri } from 'request';
import config from "./fieldConfigArray.json";

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import { IDataObject, IOAuth2Options, NodeApiError } from 'n8n-workflow';
import { endpointConfiguration, endpointFieldConfiguration, LoadedDivision, LoadedFields, LoadedOptions } from './types';


export async function exactOnlineApiRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	uri: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
	nextPageUrl = '',
	// tslint:disable-next-line:no-any
): Promise<any> {
	let options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body,
		qs,
		uri: ``,//`${credentials.url}${uri}`,
		json: true,
		//@ts-ignore
		resolveWithFullResponse: true,
	};

	const authenticationMethod = this.getNodeParameter(
		'authentication',
		0,
		'accessToken',
	) as string;
	let credentialType = '';
	if (authenticationMethod === 'accessToken') {
		const credentials = await this.getCredentials('exactOnlineApi');
		credentialType = 'exactOnlineApi';

		const baseUrl = credentials.url || 'https://start.exactonline.nl';
		options.uri = `${baseUrl}${uri}`;
	} else {
		const credentials = await this.getCredentials('exactOnlineApiOAuth2Api');
		credentialType = 'exactOnlineApiOAuth2Api';

		const baseUrl = credentials.url || 'https://start.exactonline.nl';
		options.uri = `${baseUrl}${uri}`;
	}

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
		//const response = await this.helpers.requestOAuth2.call(this, 'exactOnlineApiOAuth2Api', options, oAuth2Options);
		const response =await this.helpers.requestWithAuthentication.call(this, credentialType, options);
		//@ts-ignore
		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function getCurrentDivision(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	): Promise<string> {
		const responseData = await exactOnlineApiRequest.call(this, 'GET', `/api/v1/current/Me?$select=CurrentDivision`);
		return responseData.body.d.results[0].CurrentDivision;
}

export async function getData(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	uri: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
	): Promise<IDataObject[]> {
		const responseData = await exactOnlineApiRequest.call(this, 'GET', uri,body,qs,option);
		if(responseData.body.d.results){
			return [].concat(responseData.body.d.results);
		}
		else{
			return [].concat(responseData.body.d);
		}

}

export async function getAllData(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	uri: string,
	limit = 60,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
	): Promise<IDataObject[]> {
		let returnData:IDataObject[] = [];
		let responseData;
		let nextPageUrl = '';
		do {
			if(nextPageUrl === ''){
				responseData = await exactOnlineApiRequest.call(this,'GET', uri,body,qs,option);
			}
			else{
				responseData = await exactOnlineApiRequest.call(this, 'GET', uri,body,{},option,nextPageUrl);
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
	endpointConfig:endpointConfiguration): Promise<string[]> {

			return endpointConfig.fields.map(a => a.name);

}

export async function getMandatoryFields(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	endpointConfig:endpointConfiguration): Promise<string[]> {

			return endpointConfig.fields.filter(x => x.mandatory === true).map(a => a.name);

}

export async function getServiceOptions(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions){

	return config.map(x  => x.service.toLocaleLowerCase());

}
export async function getFieldType(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	endpointConfig:endpointConfiguration,
	fieldName:string): Promise<string> {

		return (endpointConfig.fields.filter(a => a.name === fieldName)[0].type ?? 'string');

}

export async function getResourceOptions(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	service:string){

	return config.filter(x => x.service.toLocaleLowerCase() === service).map(x  => x.endpoint);

}

export async function getEndpointFieldConfig(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	service:string,
	endpoint:string){

	return config.filter(x => x.service.toLocaleLowerCase() === service && x.endpoint ===endpoint)[0].fields;

}

export async function getEndpointConfig(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions,
	service:string,
	endpoint:string){

	return config.filter(x => x.service.toLocaleLowerCase() === service && x.endpoint ===endpoint)[0];

}


export const toDivisionOptions = (items: LoadedDivision[]) =>
	items.map(({ Code, CustomerName, Description }) => ({ name: `${CustomerName} : ${Description}`, value: Code }));

export const toOptions = (items: LoadedOptions[]) =>
	items.map(({ value, name }) => ({ name, value }));

export const toFieldSelectOptions = (items: LoadedFields[]) =>
	items.map(({ name }) => ({ name, value: name }));

export const toFieldFilterOptions = (items: endpointFieldConfiguration[]) =>
items.map(({ name }) => ({ name, value: name }));

export const toOptionsFromStringArray = (items:string[]) =>
	items.map((x) => ({name:x.charAt(0).toUpperCase() + x.slice(1), value:x}));
