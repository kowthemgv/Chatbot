import axios from "axios";

export function parseInput(input) {
  return input
    .trim()
    .split("\n")
    .map(line => line.trim());
}

export const chatWithAssistIQ = async (flowState, question, userData) => {
    
    const API_URL = "http://assitiq-alb-1555551784.us-east-1.elb.amazonaws.com/query";
    let parsedUser = typeof userData === 'string' ? JSON.parse(userData) : user;
    console.log("Parsed user name:", parsedUser.name);
 
    try{

        const response = await axios.post(
            API_URL,
            {
                system: flowState.selectedMain,
                sub_system: flowState.selectedSub,
                query: question,
                user_id: parsedUser.name
            },
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );
        console.log("Atlasrespone",response);
        return {
            result: response.data.response.summary
        }
 
    }catch(error){
        console.error('Atlas API Error:', error);
        throw error.response?.data || { success: false, message: 'Error while fetching from Atlas' };
    }
}