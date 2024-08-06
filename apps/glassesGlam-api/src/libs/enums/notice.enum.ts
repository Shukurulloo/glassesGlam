import { registerEnumType } from '@nestjs/graphql';

export enum NoticeCategory {
	FAQ = 'FAQ',
	TERMS = 'TERMS',
	INQUIRY = 'INQUIRY',
}
registerEnumType(NoticeCategory, {
	name: 'NoticeCategory',
});

export enum NoticeStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(NoticeStatus, {
	name: 'NoticeStatus',
});

export enum NoticeType {
	PROMOTION = 'Promotion',
	NEW_ARRIVAL = 'New Arrival',
	MAINTENANCE = 'Maintenance',
	SAFETY = 'Safety',
	WEBSITE_UPDATE = 'Website Update',
	LEGAL_POLICY = 'Legal Policy',
	GENERAL_ANNOUNCEMENT = 'General Announcement',
}
registerEnumType(NoticeType, {
	name: 'NoticeType',
});