import { registerEnumType } from '@nestjs/graphql';

export enum FaqType {
	PRODUCTS = 'PRODUCTS',
	PAYMENT = 'PAYMENT',
	BUYERS = 'BUYERS',
	DEALERS = 'DEALERS',
	MEMBERSHIP = 'MEMBERSHIP',
	COMMUNITY = 'COMMUNITY',
	OTHER = 'OTHER',
}
registerEnumType(FaqType, {
	name: 'FaqType',
});

export enum FaqStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

registerEnumType(FaqStatus, {
	name: 'FaqStatus',
});