const API_KEY = "Y5POYE0i052bwKEnA1Oul7KFVd2l1Zhn8pFK0iux";

export const chatWithAssistIQ = async (flowState, question, userData) => {
    
    const API_URL = "http://assitiq-alb-1555551784.us-east-1.elb.amazonaws.com/query";
 
    try{
        const response = await axios.post(
            API_URL,
            {
                system: flowState.selectedMain,
                sub_system: flowState.selectedSub,
                query: question,
                user_id: userData.id
            },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json",
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