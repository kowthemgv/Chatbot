export const encodeBase64 = (text) => {
    try{
        return btoa(text);
    } catch(error) {
        console.error("Error encoding to Base64: ", error);
        return null;
    }
}
 
// Function to decode a Base64 string
export const decodeBase64 = (encodedText) => {
    try{
        return atob(encodedText);
    } catch(error) {
        console.error("Error decoding from Base64:", error);
        return null;
    }
}

