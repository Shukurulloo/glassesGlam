import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
	MEN = 'MEN',
	WOMEN = 'WOMEN',
	KIDS = 'KIDS',
	UNISEX = 'UNISEX',
}
registerEnumType(PropertyType, {
	name: 'PropertyType',
});

export enum PropertyStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

export enum PropertyGlass {
	SUNGLASSES = 'SUNGLASSES',
	READING_GLASSES = 'READING_GLASSES',
	POLARIZED_GLASSES = 'POLARIZED_GLASSES',
	SPORTS_GLASSES = 'SPORTS_GLASSES',
	FASHION_GLASSES = 'FASHION_GLASSES',
}
registerEnumType(PropertyGlass, {
	name: 'PropertyGlass',
});

export enum PropertySize {
	SMALL = 'SMALL',
	MEDIUM = 'MEDIUM',
	LARGE = 'LARGE',
	// EXTRA_LARGE = 'EXTRA_LARGE',
}
registerEnumType(PropertySize, {
	name: 'PropertySize',
});

export enum PropertyColor {
	BLACK = 'BLACK',
	WHITE = 'WHITE',
	BROWN = 'BROWN', //JIGARRANG
	BLUE = 'BLUE',
	RED = 'RED',
	GREEN = 'GREEN',
	YELLOW = 'YELLOW',
	SILVER = 'SILVER',
	GOLD = 'GOLD',
}
registerEnumType(PropertyColor, {
	name: 'PropertyColor',
});

