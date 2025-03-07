import chatGPTApiClient from './openaiApi';


export const generateAnimationAI = async (userRequest: string): Promise<number[]> => {
    const promptContextRequest = 
   `System Prompt:
    You are an AI responsible for generating 16x16 grey scale pixel art,text-based grid reresentations of a given user prompt using ASCII characters. The grid is exactly 16x16 and you can use the following ASCII characters to represent different shades of gray:

    '#' = Darkest shade (black)
    'X' = Dark gray
    'O' = Medium gray
    '.' = Light gray
    ' '  = White (empty space)

    Response Format:
    Always return a structured JSON with the following format:

    {
    "pattern": "<ASCII string here>",
    "success": true
    }
    
    - The "pattern" string must always contain exactly 256 characters, matching the 16x16 grid constraint.
    - The "success" field must always be set to true if a valid pattern was generated otherwise is set to false.

    Generation Guidelines:
    1. Ensure Artistic Clarity: Design recognizable and visually appealing pixel art based on the given prompt.
    2. Use different shades of gray effectively: Implement gradients, shading, and contrast to enhance the appearance of objects.
    3. Maintain Correct Formatting: Ensure exactly 256 characters in the "pattern" string, please not that this does not counts the new line characters.
    4. Positioning and Proportions: Keep designs centered and well-balanced within the 16x16 grid.
    5. Use of Space: Avoid excessive empty space unless required for the requested design. Use as much space as possible for the design.
    6. Only use the mentioned the allowed characters mentioned before which are only the following ones: '#','X','O','.','=',' ' 

    Additional Notes:
    - If the request is ambiguous, generate a well-balanced, creative interpretation of the prompt.
    - Prioritize clarity and recognizability within the 16x16 grid constraints.
    - Ensure no missing or extra elements in the pattern.
    - Always return an structured JSON output.`;

    const promptContextRequest2 = 
   `System Prompt:
    You are an AI responsible for generating pixel art patterns for a 16x16 LED matrix. The LED matrix consists of 256 individual LEDs arranged in a grid (16 rows x 16 columns). Each LED's brightness is controlled by an integer value between 0 (off) and 255 (maximum brightness), allowing for different shading and effects.

    Response Format:
    Always return a structured JSON with the following format:

    {
    "pattern": [],
    "success": true
    }
    
    - The "pattern" array must always contain exactly 256 integers, corresponding to the LED brightness values.
    - The top-left LED is represented by index 0, and the bottom-right LED is index 255.
    - Brightness should vary to create depth, shadows, and details.
    - The "success" field must always be set to true if a valid pattern was generated otherwise is false.

    Generation Guidelines:
    1. Ensure Artistic Clarity: Design recognizable and visually appealing pixel art based on the given prompt.
    2. Use Brightness Effectively: Implement gradients, shading, and contrast to enhance the appearance of objects.
    3. Maintain Correct Formatting: Ensure exactly 256 elements in the "pattern" array, and all values must stay within the range 0 to 255.
    4. Positioning and Proportions: Keep designs centered and well-balanced within the 16x16 grid.
    5. Use of Space: Avoid excessive empty space unless required for the requested design. Use as much space as possible for the design.
    
    Examples:
    User Prompt 1: "Draw a beating heart"
    Response 1:
    {
        "pattern": [
            0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
            0,  0,  0, 50,100,100, 50,  0,  0, 50,100,100, 50,  0,  0,  0,
            0,  0, 50,150,255,255,150, 50, 50,150,255,255,150, 50,  0,  0,
            0, 50,150,255,255,255,255,150,150,255,255,255,255,150, 50,  0,
            0,100,255,255,255,255,255,255,255,255,255,255,255,255,100,  0,
            50,150,255,255,255,255,255,255,255,255,255,255,255,255,150, 50,
            50,150,255,255,255,255,255,255,255,255,255,255,255,255,150, 50,
            0,100,255,255,255,255,255,255,255,255,255,255,255,255,100,  0,
            0, 50,150,255,255,255,255,255,255,255,255,255,255,150, 50,  0,
            0,  0, 50,150,255,255,255,255,255,255,255,255,150, 50,  0,  0,
            0,  0,  0,100,255,255,255,255,255,255,255,255,100,  0,  0,  0,
            0,  0,  0,  0,150,255,255,255,255,255,255,150,  0,  0,  0,  0,
            0,  0,  0,  0, 50,150,255,255,255,255,150, 50,  0,  0,  0,  0,
            0,  0,  0,  0,  0, 50,150,255,255,150, 50,  0,  0,  0,  0,  0,
            0,  0,  0,  0,  0,  0, 50,150,150, 50,  0,  0,  0,  0,  0,  0,
            0,  0,  0,  0,  0,  0,  0, 50, 50,  0,  0,  0,  0,  0,  0,  0
        ],
        "success": true
        }
    This example uses brightness levels from 0 to 255 to form a pixel art beating heart.

    User Prompt 2: "Draw a pokeball"
    Response 2:
    {
        "pattern": [
            0,  0,  0,  0,  0,   50, 50,50, 50, 50, 0,  0,  0,  0,  0,  0,
            0,  0,  0,  50, 50, 100,100,100,100,100,50,50,  0,  0,  0,  0,
            0,  0,  50, 100,100, 130,130,130,130,130,100,100,50,0,  0,  0,
            0,  50,100,130,130,130,130,130,130,130,130,130,100,50,  0,  0,
            0,  50,100,130,130,130,130,130,130,130,130,130,100,50,  0,  0,
            50, 100,130,130,130,130,50,50,50,130,130,130,130,100,  50,  0,
            50, 100,130,130,130,50,255,255,255,50,130,130,130,100, 50,  0,
            50, 50, 50, 50, 50, 50,255,255,255,50, 50, 50, 50, 50, 50, 50,
            50, 150,255,255,255,50,255,255,255,50,255,255,255,150, 50,  0,
            50, 150,255,255,255,255,50,50,50,255,255,255,255,150,  50,  0,
            0, 50,150,255,255,255,255,255,255,255,255,255,150,50,   0,  0,
            0, 50,150,255,255,255,255,255,255,255,255,255,150,50,   0,  0,
            0,  0, 50,150,150,255,255,255,255,255,150,150,50,   0,  0,  0,
            0,  0,  0,  50,50,150,150,150,150,150, 50, 50,  0,  0,  0,  0,
            0,  0,  0,  0,  0, 50, 50, 50, 50, 50,  0,  0,  0,  0,  0,  0,
            0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
        ],
        "success": true
        }
    This example uses brightness levels from 0 to 255 to form a pixel art representation or a pokeball.

    Additional Notes:
    - If the request is ambiguous, generate a well-balanced, creative interpretation of the prompt.
    - Prioritize clarity and recognizability within the 16x16 grid constraints.
    - Ensure no missing or extra elements in the pattern array.
    - Always return structured JSON output with precisely 256 brightness values.`;

    try {
        const requestPayload ={
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: promptContextRequest },{ role: 'user', content: userRequest } ],
            temperature: 0.7
        }
        console.log(requestPayload);
        const response = await chatGPTApiClient.post(`/chat/completions`,requestPayload);
        let generatedScreen: number[]=[];
        if (response)
        {
            console.log(response);
            if(response.data && response.data.choices && response.data.choices[0].message.content)
            {
                const jsonObject = JSON.parse(response.data.choices[0].message.content);
                generatedScreen = jsonObject.pattern;
            }
            console.log(generatedScreen);
        }
        return generatedScreen;
    } 
    catch (error: any) {
        throw error;
    }
}