import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { exactOnlineApiRequest, getAllData, getCurrentDivision, getData, getEndpointConfig, getEndpointFieldConfig, getFields, getResourceOptions, getServiceOptions, toDivisionOptions, toFieldFilterOptions, toFieldSelectOptions, toOptions, toOptionsFromStringArray } from './GenericFunctions';
import { endpointConfiguration, endpointFieldConfiguration, LoadedDivision, LoadedFields, LoadedOptions } from './types';

export class ExactOnline implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Exact Online',
		name: 'exactOnline',
		group: ['transform'],
		icon: 'file:exactOnline.svg',
		version: 1,
		description: 'Exact Online API node',
		defaults: {
			name: 'Exact Online',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'exactOnline',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Division',
				name: 'division',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getDivisions',
				},
				default: '',
				description: 'Division to get data from.',
			},
			{
				displayName: 'Service',
				name: 'service',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getServices',
				},
				default: '',
				description: 'Service to connecto to.',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				typeOptions: {
					loadOptionsDependsOn:['service'],
					loadOptionsMethod: 'getResources',
				},
				default: '',
				description: 'Resource to connect to.',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options:[
					{
						name:'Get',
						value:'get'
					},
					{
						name:'Get all',
						value:'getAll'
					},
				],
				default: '',
				description: 'Operation to use.',
			},
			{
				displayName: 'Id',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Id of record.',
				displayOptions:{
					show:	{
						operation: [
							'get',
						],
					},
				}
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 60,
				description: 'Limit the number of records retrieved.',
				displayOptions:{
					show:	{
						operation: [
							'getAll',
						],
					},
				}
			},
			{
				displayName: 'Selection is excluded',
				name: 'excludeSelection',
				type: 'boolean',
				default: false,
				description: 'The selected fields are excluded instead of included. Select nothing to retrieve all fields.',
				displayOptions:{
					show:	{
						operation: [
							'getAll',
						],
					},
				}
			},
			{
				displayName: 'Fields to get',
				name: 'selectedFields',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsDependsOn:['service','resource','operation'],
					loadOptionsMethod: 'getFields',
				},
				default: '',
				description: 'Fields to retrieve from Exact Online',
				displayOptions:{
					show:{
						operation:[
							'getAll',
						]
					}
				}
			},
			{
				displayName: 'Filter',
				name: 'filter',
				placeholder: 'Add filter',
				type: 'fixedCollection',
				typeOptions: {
					loadOptionsDependsOn:['service','resource','operation'],
					multipleValues: true,
					sortable: true,
				},
				description: 'Filter',
				default: {},
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFieldsFilter',
								},
								default: '',
								description: 'Field name to filter.',
							},
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options:[
									{
										name:'Equal',
										value:'eq'
									},
									{
										name:'Not equal',
										value:'ne'
									},
									{
										name:'Greater rhan',
										value:'gt'
									},
									{
										name:'Greater than or equal',
										value:'ge'
									},
									{
										name:'Lower than',
										value:'lt'
									},
								],
								default: '',
								description: 'Value to apply in the filter.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to apply in the filter.',
							},
						],
					},
				],
			},

		],
	};

	methods = {
		loadOptions: {
			async getDivisions(this: ILoadOptionsFunctions) {

				const currentDivision = await getCurrentDivision.call(this);
				const divisions = await exactOnlineApiRequest.call(this,'GET', `/api/v1/${currentDivision}/system/Divisions`);

				return toDivisionOptions(divisions.body.d.results as LoadedDivision[]);
			},

			async getServices(this: ILoadOptionsFunctions) {
				const services = await getServiceOptions.call(this) as string[];

				return toOptionsFromStringArray([...new Set(services)]);
			},

			async getResources(this: ILoadOptionsFunctions) {
				const service = this.getNodeParameter('service', 0) as string;
				const resources = await getResourceOptions.call(this,service) as string[];

				return toOptionsFromStringArray(resources);
			},

			async getFields(this: ILoadOptionsFunctions) {
				const service = this.getNodeParameter('service', 0) as string;
				const resource = this.getNodeParameter('resource', 0) as string;
				const endpointConfig = await getEndpointConfig.call(this,service,resource) as endpointConfiguration;
				const fields = await getFields.call(this, endpointConfig);
				return toFieldSelectOptions(fields.map((x) => ({name:x})) as LoadedFields[]);
			},

			async getFieldsFilter(this: ILoadOptionsFunctions) {
				const service = this.getNodeParameter('service', 0) as string;
				const resource = this.getNodeParameter('resource', 0) as string;
				const endpointConfig = await getEndpointConfig.call(this,service,resource) as endpointConfiguration;
				const fields = endpointConfig.fields;

				return toFieldFilterOptions(fields as endpointFieldConfiguration[]);
			},



		},
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let returnData: IDataObject[] = [];
		const length = items.length;


		let responseData;
		const division = this.getNodeParameter('division', 0) as string;
		const service = this.getNodeParameter('service', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const endpointConfig = await getEndpointConfig.call(this,service,resource) as endpointConfiguration;
		const uri = endpointConfig.uri.replace('{division}',division);
		const excludeSelection = this.getNodeParameter('excludeSelection', 0, false) as boolean;
		const selectedFields = this.getNodeParameter('selectedFields', 0, []) as string[];
		let onlyNotSelectedFields:string[] = [];
		if(excludeSelection){
			const allFields = await getFields.call(this, endpointConfig);
			onlyNotSelectedFields = allFields.filter(x => !selectedFields.includes(x));
		}


		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
			try {
				if(operation === 'get'){
					const qs: IDataObject = {};
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					if(id!==''){
						qs['$filter'] = `ID eq guid'${id}'`;
						qs['$top'] = 1;
						responseData = await getData.call(this, uri,{},qs);
						returnData = returnData.concat(responseData);
					}
				}
				if(operation ==='getAll'){
					const qs: IDataObject = {};
					const limit = this.getNodeParameter('limit', itemIndex, 0) as number;
					if(excludeSelection){
						qs['$select'] = onlyNotSelectedFields.join(',');
					}
					else{
						qs['$select'] = selectedFields.join(',');
					}

					responseData = await getAllData.call(this, uri,limit,{},qs);
					returnData = returnData.concat(responseData);
				}




			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					returnData.push({ error });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
