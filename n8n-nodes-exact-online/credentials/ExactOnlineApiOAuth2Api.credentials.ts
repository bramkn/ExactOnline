import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExactOnlineApiOAuth2Api implements ICredentialType {
	name = 'exactOnlineApiOAuth2Api';
	extends = ['oAuth2Api'];
	icon = 'file:exactOnline.svg';
	displayName = 'Exact Online API OAuth2 API';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: '={{$self["url"]}}/api/oauth2/auth',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: '={{$self["url"]}}/api/oauth2/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Country',
			name: 'country',
			type: 'options',
			default: 'nl',
			options: [
					{
							name: 'Belguim',
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
