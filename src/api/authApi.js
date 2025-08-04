import axios from "axios";
import { encodeBase64 } from "../utils/EncryptionService";

const API_URL = "https://atlas-api.limoaiservices.com/limo/user/login";
const API_KEY = "sCzIT6PendarNRm-Fvs5p-Qdt9bMeRHNtLUk86jnYBI";

export const loginWithApi = async (user_name, pass_word) => {
  const encryptredUserName = encodeBase64(user_name);
  try{
    const response = await axios.post(
        API_URL,
        {
            gid: encryptredUserName,
            password: pass_word
        },
        {
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            }
        }
    );

    console.log(response);

    return response.data.body;
  }catch(error){
    console.error('API login error:', error);
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};
