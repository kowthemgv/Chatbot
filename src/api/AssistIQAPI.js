import axios from "axios";

export const chatWithAssistIQ = async (flowState, question, userData) => {
    
    const API_URL = "http://assitiq-alb-1555551784.us-east-1.elb.amazonaws.com/query";

    console.log(userData)
 
    try{
        const response = await axios.post(
            API_URL,
            {
                withCredentials: false
            },
            {
                system: flowState.selectedMain,
                sub_system: flowState.selectedSub,
                query: question,
                user_id: userData.id
            },
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );
 
        return {
            result: response.response.summary
        }
 
    }catch(error){
        console.error('Atlas API Error:', error);
        throw error.response?.data || { success: false, message: 'Error while fetching from Atlas' };
    }
}