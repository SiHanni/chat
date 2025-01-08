import jwt from 'jsonwebtoken';

export const jwtDecode = async (token: string) => {
  try {
    const jsonDecode = jwt.decode(token);
    if (jsonDecode && typeof jsonDecode === 'object') {
      return jsonDecode;
    } else {
      console.log('Decoded value is not an object:', jsonDecode);
    }
  } catch (error) {
    console.log(error);
  }
};
