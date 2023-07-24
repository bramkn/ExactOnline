/* eslint-disable */
import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { exactOnlineApiRequest, getAllData, getCurrentDivision, getData, getEndpointConfig, getEndpointFieldConfig, getFields, getFieldType, getMandatoryFields, getResourceOptions, getServiceOptions, toDivisionOptions, toFieldFilterOptions, toFieldSelectOptions, toOptions, toOptionsFromStringArray } from './GenericFunctions';
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
				name: 'exactOnlineApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
			{
				name: 'exactOnlineApiOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
			},
			{
				displayName: 'Division Name or ID',
				name: 'division',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getDivisions',
				},
				default: '',
				description: 'Division to get data from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Service Name or ID',
				name: 'service',
				type: 'options',
				typeOptions: {
					loadOptionsDependsOn:['division'],
					loadOptionsMethod: 'getServices',
				},
				default: '',
				description: 'Service to connecto to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Resource Name or ID',
				name: 'resource',
				type: 'options',
				typeOptions: {
					loadOptionsDependsOn:['service'],
					loadOptionsMethod: 'getResources',
				},
				default: '',
				description: 'Resource to connect to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Operation Name or ID',
				name: 'operation',
				type: 'options',
				typeOptions: {
					loadOptionsDependsOn:['resource'],
					loadOptionsMethod: 'getOperations',
				},
				default: '',
				description: 'Operation to use. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'ID of record',
				displayOptions:{
					show:	{
						operation: [
							'get',
							'put',
							'delete',
						],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 60,
				description: 'Max number of results to return',
				displayOptions:{
					show:	{
						operation: [
							'getAll',
						],
					},
				},
			},
			{
				displayName: 'Selected Fields Are Excluded',
				name: 'excludeSelection',
				type: 'boolean',
				default: false,
				description: 'Whether the selected fields are excluded instead of included. Select nothing to retrieve all fields.',
				displayOptions:{
					show:	{
						operation: [
							'getAll',
						],
					},
				},
			},
			{
				displayName: 'Fields to Get',
				name: 'selectedFields',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsDependsOn:['service','resource','operation'],
					loadOptionsMethod: 'getFields',
				},
				default: [],
				description: 'Fields to retrieve from Exact Online. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				displayOptions:{
					show:{
						operation:[
							'getAll',
						],
					},
				},
			},
			{
				displayName: 'Conjunction',
				name: 'conjunction',
				type: 'options',
				options:[
					{
						name:'And',
						value:'and',
					},
					{
						name:'Or',
						value:'or',
					},
				],
				default: 'and',
				description: 'Conjunction to use in filter',
				displayOptions:{
					show:{
						operation:[
							'getAll',
						],
					},
				},
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
								displayName: 'Field Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFieldsFilter',
								},
								default: '',
								description: 'Field name to filter. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
							},
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{
										name: 'Equal',
										value: 'eq',
									},
									{
										name: 'Greater Than',
										value: 'gt',
									},
									{
										name: 'Greater than or Equal',
										value: 'ge',
									},
									{
										name: 'Less Than',
										value: 'lt',
									},
									{
										name: 'Less than or Equal',
										value: 'le',
									},
									{
										name: 'Not Equal',
										value: 'ne',
									},
								],
								default: 'eq',
								description: 'Operator to use in filter',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to apply in the filter',
							},
						],
					},
				],
			},
			{
				displayName: 'Manual JSON Body',
				name: 'useManualBody',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation:[
							'post',
							'put',
						],
					},
				},
			},
			{
				displayName: 'JSON Body',
				name: 'manualBody',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation:[
							'post',
							'put',
						],
						useManualBody:[
							true,
						],
					},
				},
			},
			{
				displayName: 'Field Data',
				name: 'data',
				placeholder: 'Add field data',
				type: 'fixedCollection',
				typeOptions: {
					loadOptionsDependsOn:['service','resource','operation'],
					multipleValues: true,
					sortable: true,
				},
				default: {},
				displayOptions: {
					show: {
						operation:[
							'post',
							'put',
						],
						useManualBody:[
							false,
						],
					},
				},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'fieldName',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFieldsData',
								},
								default: '',
								description: 'Field name to include in item. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'Value for the field to add/edit',
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

			async getOperations(this: ILoadOptionsFunctions) {
				const service = this.getNodeParameter('service', 0) as string;
				const resource = this.getNodeParameter('resource', 0) as string;
				const endpointConfig = await getEndpointConfig.call(this,service,resource) as endpointConfiguration;
				const methods = endpointConfig.methods.map(x=>x.toLowerCase());
				if(methods.includes('get')){
					methods.push('getAll');
				}
				return toOptionsFromStringArray(methods);
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

			async getFieldsData(this: ILoadOptionsFunctions) {
				const service = this.getNodeParameter('service', 0) as string;
				const resource = this.getNodeParameter('resource', 0) as string;
				const endpointConfig = await getEndpointConfig.call(this,service,resource) as endpointConfiguration;
				//exclude auto generated values, these cannot be set by the user.
				const exclude = ['Created','Creator','CreatorFullName','Modified','Modifier','ModifierFullName'];

				const fields = endpointConfig.fields.filter(x=> !exclude.includes(x.name)) as endpointFieldConfiguration[];

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
		const division = this.getNodeParameter('division', 0,'') as string;
		const service = this.getNodeParameter('service', 0,'') as string;
		const resource = this.getNodeParameter('resource', 0,'') as string;
		const operation = this.getNodeParameter('operation', 0,'') as string;
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
					const conjunction = this.getNodeParameter('conjunction', itemIndex, 'and') as string;
					const filter = this.getNodeParameter('filter.filter', itemIndex, 0) as IDataObject[];
					if(excludeSelection){
						qs['$select'] = onlyNotSelectedFields.join(',');
					}
					else if(selectedFields.length>0){
						qs['$select'] = selectedFields.join(',');
					}
					const filters = [];
					if(filter.length>0){
						for(let filterIndex = 0; filterIndex < filter.length; filterIndex++){
							const fieldName = filter[filterIndex].field as string;
							const fieldType = await getFieldType.call(this, endpointConfig,fieldName);
							const fieldValue =filter[filterIndex].value as string;
							switch(fieldType){
								case 'string':
									filters.push(`${fieldName} ${filter[filterIndex].operator} '${filter[filterIndex].value}'`);
									break;
								case 'boolean':
									filters.push(`${fieldName} ${filter[filterIndex].operator} ${fieldValue.toLowerCase() === 'true'}`);
									break;
								case 'number':
									filters.push(`${fieldName} ${filter[filterIndex].operator} ${filter[filterIndex].value}`);
									break;
								default:
									break;
							}
						}
					}
					qs['$filter'] = filters.join(` ${conjunction} `);

					responseData = await getAllData.call(this, uri,limit,{},qs);
					returnData = returnData.concat(responseData);
				}

				if(operation ==='post'){
					let body: IDataObject = {};

					const useManualBody = this.getNodeParameter('useManualBody', itemIndex, false) as boolean;
					if(useManualBody){
						const manualBody = this.getNodeParameter('manualBody', itemIndex, {}) as IDataObject;
						if(!manualBody){
							throw new NodeOperationError(this.getNode(), `Please include the fields and values for the item you want to create.`, {
								itemIndex,
							});
						}
						body = manualBody;
					}
					else{
						const data = this.getNodeParameter('data.field', itemIndex, 0) as IDataObject[];
						if(!data ){
							throw new NodeOperationError(this.getNode(), `Please include the fields and values for the item you want to create.`, {
								itemIndex,
							});
						}
						const fieldsEntered = data.map(x=>x.fieldName);
						const mandatoryFields = await getMandatoryFields.call(this,endpointConfig) as string[];
						const mandatoryFieldsNotIncluded = mandatoryFields.filter(x=> !fieldsEntered.includes(x));
						if(mandatoryFieldsNotIncluded.length>0){
							throw new NodeOperationError(this.getNode(), `The following fields are mandatory and did not get used: '${mandatoryFieldsNotIncluded.join(', ')}'`, {
								itemIndex,
							});
						}
						if(data.length>0){
							for(let dataIndex = 0; dataIndex < data.length; dataIndex++){
								const fieldName = data[dataIndex].fieldName as string;
								const fieldType = await getFieldType.call(this, endpointConfig,fieldName);
								const fieldValue =data[dataIndex].fieldValue as string;
								switch(fieldType){
									case 'string':
										body[`${fieldName}`] = fieldValue;
										break;
									case 'boolean':
										body[`${fieldName}`] = (fieldValue.toLocaleLowerCase()==='true') ;
										break;
									case 'number':
										body[`${fieldName}`] = +fieldValue;
										break;
									default:
										break;
								}
							}
						}
					}

					responseData = await exactOnlineApiRequest.call(this,'Post', uri,body,{},{headers: {Prefer:'return=representation'}});
					returnData = returnData.concat(responseData.body.d);
				}

				if(operation === 'put'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					if(id === ''){
						throw new NodeOperationError(this.getNode(), `Please enter an Id of a record to edit.`, {
							itemIndex,
						});
					}
					let body: IDataObject = {};

					const useManualBody = this.getNodeParameter('useManualBody', itemIndex, false) as boolean;
					if(useManualBody){
						const manualBody = this.getNodeParameter('manualBody', itemIndex, {}) as IDataObject;
						if(!manualBody){
							throw new NodeOperationError(this.getNode(), `Please include the fields and values for the item you want to edit.`, {
								itemIndex,
							});
						}
						body = manualBody;
					}
					else{
						const data = this.getNodeParameter('data.field', itemIndex, 0) as IDataObject[];
						if(!data ){
							throw new NodeOperationError(this.getNode(), `Please include the fields and values for the item you want to edit.`, {
								itemIndex,
							});
						}

						if(data.length>0){
							for(let dataIndex = 0; dataIndex < data.length; dataIndex++){
								const fieldName = data[dataIndex].fieldName as string;
								const fieldType = await getFieldType.call(this, endpointConfig,fieldName);
								const fieldValue =data[dataIndex].fieldValue as string;
								switch(fieldType){
									case 'string':
										body[`${fieldName}`] = fieldValue;
										break;
									case 'boolean':
										body[`${fieldName}`] = (fieldValue.toLocaleLowerCase()==='true') ;
										break;
									case 'number':
										body[`${fieldName}`] = +fieldValue;
										break;
									default:
										break;
								}
							}
						}
					}
					const uriWithId= `${uri}(guid'${id}')`;
					responseData = await exactOnlineApiRequest.call(this,'Put',uriWithId,body,{});
					if(responseData.statusCode === 204){
						returnData = returnData.concat({msg:'Succesfully changed field values.'});
					}
					else{
						throw new NodeOperationError(this.getNode(), `Something went wrong.`, {
							itemIndex,
						});
					}


				}

				if(operation === 'delete'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					if(id === ''){
						throw new NodeOperationError(this.getNode(), `Please enter an Id of a record to delete.`, {
							itemIndex,
						});
					}
					const uriWithId= `${uri}(guid'${id}')`;
					responseData = await exactOnlineApiRequest.call(this,'Delete',uriWithId,{},{});
					if(responseData.statusCode === 204){
						returnData = returnData.concat({msg:'Succesfully Deleted record.'});
					}
					else{
						throw new NodeOperationError(this.getNode(), `Something went wrong.`, {
							itemIndex,
						});
					}


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
