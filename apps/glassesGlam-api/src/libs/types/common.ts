import { ObjectId } from 'mongoose';

export interface T {
	[key: string]: any;
}
// bu collectionni ihtiyoriy dokni o'zgartrishda hizmatga keladigon interface
export interface StatisticModifier {
	_id: ObjectId; // dokni idsi
	targetKey: string; // deta setni nomi ,nimani o'zgartrshmz
	modifier: number; // qanday qiymatga o'zgartrmoqchimz
}
