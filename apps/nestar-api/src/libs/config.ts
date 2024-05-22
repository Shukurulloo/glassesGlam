import { ObjectId } from 'bson'; // mongooseni o'rniga bson dan foydalanib objectIdga o'giramz

// shular bo'yicha sort qilsin degan mantiq
export const availableAgentSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank']; // agents
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews']; // all

/**  IMAGE CONFIGURATION **/
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg']; // img formati
export const getSerialForImage = (filename: string) => { //random name
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target; //shart: agar string bo'lsa ObjectIdga wrap qilsin aks holda  targetni o'zini qaytarsin
};
