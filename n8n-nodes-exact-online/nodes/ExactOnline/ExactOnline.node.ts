import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { exactOnlineApiRequest, getAllData, getCurrentDivision, getData, getResourceOptions, toDivisionOptions, toOptions } from './GenericFunctions';
import { LoadedDivision, LoadedOptions } from './types';

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
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Service',
				name: 'service',
				type: 'options',
				options:[
					{
						name:'Accountancy',
						value:'accountancy'
					},
					{
						name:'CRM',
						value:'crm'
					},
					{
						name:'Financial',
						value:'financial'
					},
					{
						name:'Financial Transaction',
						value:'financialtransaction'
					},
				],
				default: '',
				description: 'Service category for easy filtering.',
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
		],
	};

	methods = {
		loadOptions: {
			async getDivisions(this: ILoadOptionsFunctions) {

				const currentDivision = await getCurrentDivision.call(this);
				const divisions = await exactOnlineApiRequest.call(this,'GET', `${currentDivision}/system/Divisions`);

				return toDivisionOptions(divisions.body.d.results as LoadedDivision[]);
			},

			async getResources(this: ILoadOptionsFunctions) {
				const service = this.getNodeParameter('service', 0) as string;
				const resources = await getResourceOptions.call(this,service);

				return toOptions(resources as LoadedOptions[]);
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
		const qs: IDataObject = {};

		let responseData;
		const division = this.getNodeParameter('division', 0) as string;
		const service = this.getNodeParameter('service', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;


		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
			try {
				if(operation === 'get'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					if(id!==''){
						qs['$filter'] = `ID eq guid'${id}'`;
						qs['$top'] = 1;
						responseData = await getData.call(this, `${division}/${service}/${resource}`,{},qs);
						returnData = returnData.concat(responseData);
					}
				}
				if(operation ==='getAll'){
					const limit = this.getNodeParameter('limit', itemIndex, 0) as number;
					responseData = await getAllData.call(this, `${division}/${service}/${resource}`,limit,{},{});
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
