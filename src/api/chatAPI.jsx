import axios from "axios";
 
let mainSystem = "default";
const API_KEY = "sCzIT6PendarNRm-Fvs5p-Qdt9bMeRHNtLUk86jnYBI";
 
export const chatWithAtlas = async (flowState, question, token) => {
    mainSystem = flowState.selectedMain;
    const API_URL = `https://atlas-api.limoaiservices.com/limo/${mainSystem}/webchat`;
 
    try{
        const response = await axios.post(
            API_URL,
            {
                query: question
            },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );
 
        return {
            files: response.data["Reference files"],
            message: response.data.body.answer,
            suggestions: response.data.suggestions
        }
 
    }catch(error){
        console.error('Atlas API Error:', error);
        throw error.response?.data || { success: false, message: 'Error while fetching from Atlas' };
    }
}
 