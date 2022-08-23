export type LoadedDivision = {
	Code: string;
	CustomerName: string;
	Description:string;
}
export type LoadedOptions = {
	value:string,
	name:string
}


export type LoadedFields = {
	name:string,
}


export type endpointFieldConfiguration = {
	name:string,
	type:string,
	webhook?:boolean,
	filter?:boolean
}

export type endpointConfiguration = {
	service:string,
	endpoint:string
	uri:string,
	doc:string,
	webhook:boolean,
	methods:string[],
	fields:endpointFieldConfiguration[],
}
