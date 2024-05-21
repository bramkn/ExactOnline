import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExactOnlineApi implements ICredentialType {
	name = 'exactOnlineApi';
	icon = 'file:exactOnline.svg';
	displayName = 'Exact Online API With AccessToken API';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Country',
			name: 'country',
			type: 'options',
			default: 'nl',
			options: [
					{
							name: 'Belgium',
							value: 'be',
					},
					{
							name: 'France',
							value: 'fr',
					},
					{
							name: 'Germany',
							value: 'de',
					},
					{
							name: 'Spain',
							value: 'es',
					},
					{
							name: 'The Netherlands',
							value: 'nl',
					},
					{
							name: 'United Kingdom',
							value: 'co.uk',
					},
					{
							name: 'United States of America',
							value: 'com',
					},
			],
		},
		{
			displayName: 'URL',
			name: 'url',
			type: 'hidden',
			default: '=https://start.exactonline.{{$self["country"]}}',
	},
	];
	// This credential is currently not used by any node directly
	// but the HTTP Request node can use it to make requests.
	// The credential is also testable due to the `test` property below
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.accessToken }}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://example.com/',
			url: '',
		},
	};
}
