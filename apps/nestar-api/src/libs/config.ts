import { ObjectId } from 'bson'; // mongooseni o'rniga bson dan foydalanib objectIdga o'giramz

// shular bo'yicha sort qilsin degan mantiq
export const availableAgentSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target; //shart: agar string bo'lsa ObjectIdga wrap qilsin aks holda  targetni o'zini qaytarsin
};
